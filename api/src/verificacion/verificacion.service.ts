import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EstadoSolicitudVerificacion,
  Nivel,
  type Entidad,
} from '@prisma/client';
import { mkdir, rm, writeFile } from 'fs/promises';
import { join, normalize, sep } from 'path';
import { PrismaService } from '../prisma/prisma.service';

const MAX_BYTES = 5_242_880;
const MIME_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
const TIPOS_N1 = ['rut', 'camara_comercio', 'representacion_legal'] as const;
const TIPOS_N2 = ['evidencia_idpyba', 'carta_comvezcol'] as const;
export const TIPOS_EVIDENCIA = [...TIPOS_N1, ...TIPOS_N2];

export type ArchivoSubido = {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

const RAIZ_ARCHIVOS = join(process.cwd(), 'uploads', 'verificaciones');

@Injectable()
export class VerificacionService {
  constructor(private readonly prisma: PrismaService) {}

  async solicitar(
    usuarioId: string,
    datos: { nombre: string; localidadId: string; tipoNivel: string },
    archivos: ArchivoSubido[],
  ) {
    const entidad = await this.exigirEntidad(usuarioId);
    const tipoNivel = this.nivel(datos.tipoNivel);
    this.validarMinimo(tipoNivel, archivos);

    const abierta = await this.prisma.verificacion.findFirst({
      where: {
        entidadId: entidad.id,
        estado: EstadoSolicitudVerificacion.en_revision,
      },
    });
    if (abierta) {
      throw new ConflictException(
        'Ya tienes una solicitud en revisión. Espera la respuesta del validador.',
      );
    }

    const localidad = await this.prisma.localidad.findUnique({
      where: { id: datos.localidadId },
    });
    if (!localidad) {
      throw new BadRequestException('La localidad no es válida.');
    }

    const nombre = datos.nombre.trim();
    if (nombre.length < 2) {
      throw new BadRequestException('El nombre de la entidad es obligatorio.');
    }

    const complemento = await this.prisma.verificacion.findFirst({
      where: {
        entidadId: entidad.id,
        estado: EstadoSolicitudVerificacion.complemento,
      },
      orderBy: { creadoEn: 'desc' },
    });

    const solicitud = complemento
      ? await this.prisma.verificacion.update({
          where: { id: complemento.id },
          data: {
            tipoNivel,
            estado: EstadoSolicitudVerificacion.en_revision,
            motivo: null,
            validadorId: null,
            resueltoEn: null,
          },
        })
      : await this.prisma.verificacion.create({
          data: {
            entidadId: entidad.id,
            tipoNivel,
            estado: EstadoSolicitudVerificacion.en_revision,
          },
        });

    try {
      if (complemento) {
        await this.prisma.evidenciaVerificacion.deleteMany({
          where: { verificacionId: solicitud.id },
        });
        await rm(join(RAIZ_ARCHIVOS, solicitud.id), { recursive: true, force: true });
      }
      const carpeta = join(RAIZ_ARCHIVOS, solicitud.id);
      await mkdir(carpeta, { recursive: true });
      for (const archivo of archivos) {
        this.validarArchivo(archivo);
        const ext = this.extension(archivo.mimetype);
        const destino = join(carpeta, `${archivo.fieldname}${ext}`);
        await writeFile(destino, archivo.buffer);
        await this.prisma.evidenciaVerificacion.create({
          data: {
            verificacionId: solicitud.id,
            tipoDocumento: archivo.fieldname,
            rutaArchivo: join(
              'uploads',
              'verificaciones',
              solicitud.id,
              `${archivo.fieldname}${ext}`,
            ),
            mime: archivo.mimetype,
            pesoBytes: archivo.size,
          },
        });
      }

      await this.prisma.entidad.update({
        where: { id: entidad.id },
        data: {
          nombre,
          localidadId: datos.localidadId,
          nivelSolicitado: tipoNivel,
          estadoVerificacion: 'en_revision',
        },
      });
    } catch (e) {
      if (!complemento) {
        await this.prisma.verificacion.delete({ where: { id: solicitud.id } });
      }
      throw e;
    }

    return this.detalle(solicitud.id, usuarioId, 'entidad');
  }

  async mia(usuarioId: string) {
    const entidad = await this.exigirEntidad(usuarioId);
    const ultima = await this.prisma.verificacion.findFirst({
      where: { entidadId: entidad.id },
      orderBy: { creadoEn: 'desc' },
      include: {
        evidencias: {
          select: {
            id: true,
            tipoDocumento: true,
            mime: true,
            pesoBytes: true,
            creadoEn: true,
          },
        },
      },
    });
    return {
      entidad: {
        id: entidad.id,
        nombre: entidad.nombre,
        localidadId: entidad.localidadId,
        nivelSolicitado: entidad.nivelSolicitado,
        estadoVerificacion: entidad.estadoVerificacion,
        puedePublicar:
          entidad.estadoVerificacion === 'nivel_1' ||
          entidad.estadoVerificacion === 'nivel_2',
      },
      solicitud: ultima,
    };
  }

  async cola() {
    return this.prisma.verificacion.findMany({
      where: {
        estado: {
          in: [
            EstadoSolicitudVerificacion.en_revision,
            EstadoSolicitudVerificacion.complemento,
          ],
        },
      },
      orderBy: { creadoEn: 'asc' },
      include: {
        entidad: {
          include: { localidad: true },
        },
        evidencias: {
          select: { id: true, tipoDocumento: true, mime: true, pesoBytes: true },
        },
      },
    });
  }

  async detalle(id: string, usuarioId: string, rol: string) {
    const fila = await this.prisma.verificacion.findUnique({
      where: { id },
      include: {
        entidad: { include: { localidad: true, usuario: true } },
        evidencias: {
          select: {
            id: true,
            tipoDocumento: true,
            mime: true,
            pesoBytes: true,
            creadoEn: true,
          },
        },
      },
    });
    if (!fila) {
      throw new NotFoundException('No encontré esa solicitud.');
    }
    if (rol === 'entidad' && fila.entidad.usuarioId !== usuarioId) {
      throw new ForbiddenException('No puedes ver la solicitud de otra entidad.');
    }
    return {
      id: fila.id,
      tipoNivel: fila.tipoNivel,
      estado: fila.estado,
      motivo: fila.motivo,
      creadoEn: fila.creadoEn,
      entidad: {
        id: fila.entidad.id,
        nombre: fila.entidad.nombre,
        localidad: fila.entidad.localidad.nombre,
        estadoVerificacion: fila.entidad.estadoVerificacion,
      },
      evidencias: fila.evidencias,
    };
  }

  async resolver(
    id: string,
    validadorId: string,
    dto: {
      accion: 'aprobar' | 'rechazar' | 'complemento';
      motivo?: string;
      visitaNecesaria?: boolean;
    },
  ) {
    const fila = await this.prisma.verificacion.findUnique({
      where: { id },
    });
    if (!fila) {
      throw new NotFoundException('No encontré esa solicitud.');
    }
    if (
      fila.estado !== EstadoSolicitudVerificacion.en_revision &&
      fila.estado !== EstadoSolicitudVerificacion.complemento
    ) {
      throw new ConflictException('Esta solicitud ya fue resuelta.');
    }

    if (dto.accion === 'rechazar' || dto.accion === 'complemento') {
      if (!dto.motivo?.trim()) {
        throw new BadRequestException('El motivo es obligatorio.');
      }
    }

    const visita = dto.visitaNecesaria
      ? 'Visita o video marcado como necesario (opcional). '
      : '';
    const motivo = `${visita}${dto.motivo?.trim() ?? ''}`.trim() || null;

    if (dto.accion === 'aprobar') {
      await this.prisma.$transaction([
        this.prisma.verificacion.update({
          where: { id },
          data: {
            estado: EstadoSolicitudVerificacion.aprobada,
            validadorId,
            resueltoEn: new Date(),
            motivo,
          },
        }),
        this.prisma.entidad.update({
          where: { id: fila.entidadId },
          data: { estadoVerificacion: fila.tipoNivel },
        }),
      ]);
    } else if (dto.accion === 'rechazar') {
      await this.prisma.$transaction([
        this.prisma.verificacion.update({
          where: { id },
          data: {
            estado: EstadoSolicitudVerificacion.rechazada,
            validadorId,
            resueltoEn: new Date(),
            motivo,
          },
        }),
        this.prisma.entidad.update({
          where: { id: fila.entidadId },
          data: { estadoVerificacion: 'rechazada' },
        }),
      ]);
    } else {
      await this.prisma.verificacion.update({
        where: { id },
        data: {
          estado: EstadoSolicitudVerificacion.complemento,
          validadorId,
          resueltoEn: new Date(),
          motivo,
        },
      });
    }

    return this.detalle(id, validadorId, 'validador');
  }

  async rutaArchivo(
    verificacionId: string,
    evidenciaId: string,
    usuarioId: string,
    rol: string,
  ) {
    const evidencia = await this.prisma.evidenciaVerificacion.findUnique({
      where: { id: evidenciaId },
      include: { verificacion: { include: { entidad: true } } },
    });
    if (!evidencia || evidencia.verificacionId !== verificacionId) {
      throw new NotFoundException('No encontré esa evidencia.');
    }
    if (rol === 'entidad' && evidencia.verificacion.entidad.usuarioId !== usuarioId) {
      throw new ForbiddenException('No puedes ver evidencias ajenas.');
    }
    if (rol !== 'entidad' && rol !== 'validador') {
      throw new ForbiddenException('No puedes ver evidencias de verificación.');
    }
    const absoluta = normalize(join(process.cwd(), evidencia.rutaArchivo));
    const raiz = normalize(RAIZ_ARCHIVOS) + sep;
    if (!absoluta.startsWith(raiz)) {
      throw new ForbiddenException('Ruta de archivo no válida.');
    }
    return { absoluta, mime: evidencia.mime, nombre: evidencia.tipoDocumento };
  }

  async perfilPublico(entidadId: string) {
    const entidad = await this.prisma.entidad.findUnique({
      where: { id: entidadId },
      include: { localidad: true },
    });
    if (!entidad) {
      throw new NotFoundException('No encontré esa entidad.');
    }
    return {
      id: entidad.id,
      nombre: entidad.nombre,
      localidad: entidad.localidad.nombre,
      badge: entidad.estadoVerificacion,
    };
  }

  private async exigirEntidad(usuarioId: string): Promise<Entidad> {
    const entidad = await this.prisma.entidad.findUnique({
      where: { usuarioId },
    });
    if (!entidad) {
      throw new ForbiddenException('Esta cuenta no es una entidad.');
    }
    return entidad;
  }

  private nivel(valor: string): Nivel {
    if (valor === Nivel.nivel_1 || valor === Nivel.nivel_2) {
      return valor;
    }
    throw new BadRequestException('El nivel debe ser nivel_1 o nivel_2.');
  }

  private validarMinimo(tipo: Nivel, archivos: ArchivoSubido[]) {
    const tipos = new Set(archivos.map((a) => a.fieldname));
    if (tipo === Nivel.nivel_1) {
      const faltan = TIPOS_N1.filter((t) => !tipos.has(t));
      if (faltan.length) {
        throw new BadRequestException(
          `Nivel 1 exige RUT, Cámara de Comercio y representación legal. Falta: ${faltan.join(', ')}.`,
        );
      }
    } else {
      const tieneN2 = TIPOS_N2.some((t) => tipos.has(t));
      if (!tieneN2) {
        throw new BadRequestException(
          'Nivel 2 exige al menos evidencia IDPYBA o carta COMVEZCOL.',
        );
      }
    }
    for (const archivo of archivos) {
      if (!TIPOS_EVIDENCIA.includes(archivo.fieldname as (typeof TIPOS_EVIDENCIA)[number])) {
        throw new BadRequestException(`Tipo de documento no válido: ${archivo.fieldname}.`);
      }
    }
  }

  private validarArchivo(archivo: ArchivoSubido) {
    if (archivo.size <= 0 || archivo.size > MAX_BYTES) {
      throw new BadRequestException('Cada archivo debe pesar como máximo 5 MB.');
    }
    if (!MIME_PERMITIDOS.includes(archivo.mimetype)) {
      throw new BadRequestException('Solo se aceptan PDF, JPEG o PNG.');
    }
  }

  private extension(mime: string) {
    if (mime === 'application/pdf') return '.pdf';
    if (mime === 'image/png') return '.png';
    return '.jpg';
  }
}
