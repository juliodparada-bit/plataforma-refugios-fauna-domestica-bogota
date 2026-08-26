import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoAnimal, EstadoPostulacion } from '@prisma/client';
import { calcularPuntaje } from '../dominio/puntaje';
import { PrismaService } from '../prisma/prisma.service';

const ACTIVAS: EstadoPostulacion[] = [
  EstadoPostulacion.enviada,
  EstadoPostulacion.en_revision,
  EstadoPostulacion.preseleccionada,
];

@Injectable()
export class PostulacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(
    usuarioId: string,
    animalId: string,
    dto: { mayorDeEdad: boolean; viveEnBogota: boolean },
  ) {
    if (!dto.mayorDeEdad || !dto.viveEnBogota) {
      throw new BadRequestException('Debes confirmar que eres mayor de edad y vives en Bogotá.');
    }
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (usuario?.rol !== 'adoptante') {
      throw new ForbiddenException('Solo un adoptante puede postularse.');
    }
    const perfil = await this.prisma.perfilAdoptante.findUnique({ where: { usuarioId } });
    if (!perfil) {
      throw new ForbiddenException('Responde primero las cinco preguntas de estilo de vida.');
    }
    const animal = await this.prisma.animal.findUnique({ where: { id: animalId } });
    if (!animal || animal.estado !== EstadoAnimal.publicado) {
      throw new ConflictException('Ese animal no está publicado.');
    }
    const abierta = await this.prisma.postulacion.findFirst({
      where: { animalId, adoptanteId: usuarioId, estado: { in: ACTIVAS } },
    });
    if (abierta) {
      throw new ConflictException('Ya tienes una postulación activa para este animal.');
    }
    const { puntaje, fraseExplicable } = calcularPuntaje(perfil, animal);
    return this.prisma.postulacion.create({
      data: {
        animalId,
        adoptanteId: usuarioId,
        puntaje,
        fraseExplicable,
        estado: EstadoPostulacion.enviada,
      },
    });
  }

  async mias(usuarioId: string) {
    return this.prisma.postulacion.findMany({
      where: { adoptanteId: usuarioId },
      include: {
        animal: {
          include: {
            localidad: true,
            entidad: true,
            fotos: { where: { esPortada: true }, take: 1 },
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async deAnimal(usuarioId: string, animalId: string) {
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
      include: { entidad: true },
    });
    if (!animal || animal.entidad.usuarioId !== usuarioId) {
      throw new ForbiddenException('No puedes ver postulaciones de otro refugio.');
    }
    const filas = await this.prisma.postulacion.findMany({
      where: { animalId },
      include: {
        adoptante: {
          include: { perfilAdoptante: true, localidad: true },
        },
      },
      orderBy: { puntaje: 'desc' },
    });
    return {
      animal: {
        id: animal.id,
        nombre: animal.nombre,
        estado: animal.estado,
        necesidadEspecial: animal.necesidadEspecial,
      },
      postulaciones: filas.map((p) => ({
        id: p.id,
        puntaje: p.puntaje,
        fraseExplicable: p.fraseExplicable,
        estado: p.estado,
        requiereEvidenciaHogar: p.requiereEvidenciaHogar,
        seguimientoResultado: p.seguimientoResultado,
        creadoEn: p.creadoEn,
        adoptante: {
          nombre: p.adoptante.nombre,
          localidad: p.adoptante.localidad.nombre,
          perfil: p.adoptante.perfilAdoptante,
        },
      })),
    };
  }

  async resolver(
    usuarioId: string,
    id: string,
    dto: {
      accion: 'abrir' | 'preseleccionar' | 'rechazar' | 'caer' | 'entregar' | 'seguimiento';
      seguimientoResultado?: 'estable' | 'novedad' | 'retorno';
      requiereEvidenciaHogar?: boolean;
    },
  ) {
    const fila = await this.prisma.postulacion.findUnique({
      where: { id },
      include: { animal: { include: { entidad: true } } },
    });
    if (!fila) {
      throw new NotFoundException('No encontré esa postulación.');
    }
    if (fila.animal.entidad.usuarioId !== usuarioId) {
      throw new ForbiddenException('No puedes gestionar postulaciones ajenas.');
    }

    if (dto.accion === 'abrir') {
      if (fila.estado !== EstadoPostulacion.enviada) {
        throw new ConflictException('Solo puedes abrir una postulación enviada.');
      }
      return this.prisma.postulacion.update({
        where: { id },
        data: {
          estado: EstadoPostulacion.en_revision,
          requiereEvidenciaHogar: dto.requiereEvidenciaHogar ?? fila.requiereEvidenciaHogar,
        },
      });
    }

    if (dto.accion === 'preseleccionar') {
      if (
        fila.estado !== EstadoPostulacion.enviada &&
        fila.estado !== EstadoPostulacion.en_revision
      ) {
        throw new ConflictException('Esa postulación no se puede preseleccionar.');
      }
      if (fila.animal.estado !== EstadoAnimal.publicado) {
        throw new ConflictException('El animal ya no está publicado.');
      }
      const otra = await this.prisma.postulacion.findFirst({
        where: {
          animalId: fila.animalId,
          estado: EstadoPostulacion.preseleccionada,
          NOT: { id },
        },
      });
      if (otra) {
        throw new ConflictException('Ya hay una preselección para este animal.');
      }
      await this.prisma.$transaction([
        this.prisma.postulacion.update({
          where: { id },
          data: {
            estado: EstadoPostulacion.preseleccionada,
            requiereEvidenciaHogar:
              dto.requiereEvidenciaHogar ??
              (fila.animal.necesidadEspecial || fila.requiereEvidenciaHogar),
          },
        }),
        this.prisma.animal.update({
          where: { id: fila.animalId },
          data: { estado: EstadoAnimal.reservado },
        }),
      ]);
      return this.deAnimal(usuarioId, fila.animalId);
    }

    if (dto.accion === 'rechazar') {
      if (!ACTIVAS.includes(fila.estado)) {
        throw new ConflictException('Esa postulación ya no está activa.');
      }
      if (fila.estado === EstadoPostulacion.preseleccionada) {
        await this.prisma.$transaction([
          this.prisma.postulacion.update({
            where: { id },
            data: { estado: EstadoPostulacion.rechazada },
          }),
          this.prisma.animal.update({
            where: { id: fila.animalId },
            data: { estado: EstadoAnimal.publicado },
          }),
        ]);
        return this.deAnimal(usuarioId, fila.animalId);
      }
      return this.prisma.postulacion.update({
        where: { id },
        data: { estado: EstadoPostulacion.rechazada },
      });
    }

    if (dto.accion === 'caer') {
      if (fila.estado !== EstadoPostulacion.preseleccionada) {
        throw new ConflictException('Solo puedes caer una preselección.');
      }
      await this.prisma.$transaction([
        this.prisma.postulacion.update({
          where: { id },
          data: { estado: EstadoPostulacion.rechazada },
        }),
        this.prisma.animal.update({
          where: { id: fila.animalId },
          data: { estado: EstadoAnimal.publicado },
        }),
      ]);
      return this.deAnimal(usuarioId, fila.animalId);
    }

    if (dto.accion === 'entregar') {
      if (fila.estado !== EstadoPostulacion.preseleccionada) {
        throw new ConflictException('La entrega parte de una preselección (animal reservado).');
      }
      if (fila.animal.estado !== EstadoAnimal.reservado) {
        throw new ConflictException('El animal no está reservado.');
      }
      await this.prisma.$transaction([
        this.prisma.postulacion.update({
          where: { id },
          data: { estado: EstadoPostulacion.entregada },
        }),
        this.prisma.animal.update({
          where: { id: fila.animalId },
          data: { estado: EstadoAnimal.adoptado },
        }),
        this.prisma.postulacion.updateMany({
          where: {
            animalId: fila.animalId,
            estado: { in: ACTIVAS },
            NOT: { id },
          },
          data: { estado: EstadoPostulacion.rechazada },
        }),
      ]);
      return this.deAnimal(usuarioId, fila.animalId);
    }

    if (!dto.seguimientoResultado) {
      throw new BadRequestException('El resultado del seguimiento es obligatorio.');
    }
    if (fila.estado !== EstadoPostulacion.entregada && fila.estado !== EstadoPostulacion.seguimiento) {
      throw new ConflictException('El seguimiento se registra después de la entrega.');
    }
    return this.prisma.postulacion.update({
      where: { id },
      data: {
        estado: EstadoPostulacion.seguimiento,
        seguimientoResultado: dto.seguimientoResultado,
        seguimientoEn: new Date(),
      },
    });
  }
}
