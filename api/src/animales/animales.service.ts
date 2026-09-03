import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Energia,
  Especie,
  EstadoAnimal,
  Sexo,
  Talla,
} from '@prisma/client';
import { mkdir, writeFile } from 'fs/promises';
import { join, normalize, sep } from 'path';
import { exigirEntidad, exigirPublicadora } from '../comun/entidad';
import { esCuentaPiloto } from '../comun/demo';
import { PrismaService } from '../prisma/prisma.service';
import { calcularPuntaje } from '../dominio/puntaje';
import type { PublicarAnimalDto } from './dto/publicar.dto';

const MAX_BYTES = 5_242_880;
const MIME_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const EDADES = ['cachorro', 'joven', 'adulto', 'senior'] as const;
const RAIZ = join(process.cwd(), 'uploads', 'animales');

export type ArchivoFoto = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class AnimalesService {
  constructor(private readonly prisma: PrismaService) {}

  async publicar(
    usuarioId: string,
    datos: PublicarAnimalDto,
    foto: ArchivoFoto | undefined,
  ) {
    const entidad = await exigirPublicadora(
      this.prisma,
      usuarioId,
      'Aún no puedes publicar: falta la verificación.',
    );
    if (!foto) {
      throw new BadRequestException('Debes adjuntar al menos una foto.');
    }
    this.validarFoto(foto);

    const especie = this.especie(datos.especie);
    const historia = (datos.historia ?? '').trim();
    if (historia.length < 20) {
      throw new BadRequestException('La historia es obligatoria (mínimo 20 caracteres).');
    }
    const nombre = (datos.nombre ?? '').trim();
    if (nombre.length < 2) {
      throw new BadRequestException('El nombre es obligatorio.');
    }
    const localidadId = datos.localidadId;
    const localidad = await this.prisma.localidad.findUnique({ where: { id: localidadId } });
    if (!localidad) {
      throw new BadRequestException('La localidad no es válida.');
    }
    const edadAprox = (datos.edadAprox ?? '').trim();
    if (!EDADES.includes(edadAprox as (typeof EDADES)[number])) {
      throw new BadRequestException('La edad debe ser cachorro, joven, adulto o senior.');
    }

    const creado = await this.prisma.animal.create({
      data: {
        entidadId: entidad.id,
        nombre,
        especie,
        sexo: this.sexo(datos.sexo),
        talla: this.talla(datos.talla),
        edadAprox,
        energia: this.energia(datos.energia),
        historia,
        raza: datos.raza?.trim() || null,
        necesidadEspecial: datos.necesidadEspecial === 'true' || datos.necesidadEspecial === 'on',
        conviveNinos: datos.conviveNinos === 'true' || datos.conviveNinos === 'on',
        conviveOtrosAnimales:
          datos.conviveOtrosAnimales === 'true' || datos.conviveOtrosAnimales === 'on',
        esterilizado: this.esterilizado(datos.esterilizado),
        estado: EstadoAnimal.publicado,
        localidadId,
      },
    });

    const ext = this.extension(foto.mimetype);
    const carpeta = join(RAIZ, creado.id);
    await mkdir(carpeta, { recursive: true });
    const destino = join(carpeta, `portada${ext}`);
    await writeFile(destino, foto.buffer);
    await this.prisma.animalFoto.create({
      data: {
        animalId: creado.id,
        rutaArchivo: join('uploads', 'animales', creado.id, `portada${ext}`),
        esPortada: true,
        orden: 1,
        mime: foto.mimetype,
        pesoBytes: foto.size,
      },
    });

    return this.detalle(creado.id, usuarioId, 'entidad');
  }

  async catalogo(
    filtros: { especie?: string; localidadId?: string },
    usuarioId?: string,
  ) {
    const where = {
      estado: EstadoAnimal.publicado,
      ...(filtros.especie ? { especie: this.especie(filtros.especie) } : {}),
      ...(filtros.localidadId ? { localidadId: filtros.localidadId } : {}),
    };
    const filas = await this.prisma.animal.findMany({
      where,
      include: {
        localidad: true,
        entidad: { include: { usuario: { select: { correo: true } } } },
        fotos: { where: { esPortada: true }, take: 1 },
      },
      orderBy: { creadoEn: 'desc' },
    });

    let perfil = null;
    if (usuarioId) {
      perfil = await this.prisma.perfilAdoptante.findUnique({ where: { usuarioId } });
    }

    const listados = filas.map((a) => {
      const tarjeta = this.tarjeta(a);
      if (perfil) {
        const { puntaje, fraseExplicable } = calcularPuntaje(perfil, a);
        return { ...tarjeta, puntaje, fraseExplicable };
      }
      return { ...tarjeta, puntaje: undefined as number | undefined, fraseExplicable: undefined as string | undefined };
    });

    if (perfil) {
      listados.sort((a, b) => (b.puntaje ?? 0) - (a.puntaje ?? 0));
    } else {
      listados.sort((a, b) => {
        const vis = this.cupoVisibilidad(b) - this.cupoVisibilidad(a);
        if (vis !== 0) {
          return vis;
        }
        const tb = a.creadoEn && b.creadoEn ? new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime() : 0;
        return tb;
      });
    }
    return listados;
  }

  async mios(usuarioId: string) {
    const entidad = await exigirEntidad(this.prisma, usuarioId);
    const filas = await this.prisma.animal.findMany({
      where: { entidadId: entidad.id },
      include: {
        localidad: true,
        entidad: { include: { usuario: { select: { correo: true } } } },
        fotos: { where: { esPortada: true }, take: 1 },
        postulaciones: { select: { id: true, estado: true } },
      },
      orderBy: { actualizadoEn: 'desc' },
    });
    return filas.map((a) => ({
      ...this.tarjeta(a),
      estado: a.estado,
      postulaciones: a.postulaciones.length,
      cupoLiberado: a.estado === EstadoAnimal.adoptado,
    }));
  }

  async detalle(id: string, usuarioId?: string, rol?: string) {
    const animal = await this.prisma.animal.findUnique({
      where: { id },
      include: {
        localidad: true,
        entidad: { include: { localidad: true, usuario: { select: { correo: true } } } },
        fotos: { orderBy: { orden: 'asc' } },
      },
    });
    if (!animal) {
      throw new NotFoundException('No encontré ese animal.');
    }
    const esDuenio = rol === 'entidad' && animal.entidad.usuarioId === usuarioId;
    if (animal.estado !== EstadoAnimal.publicado && !esDuenio) {
      if (animal.estado === EstadoAnimal.reservado && rol === 'entidad' && esDuenio) {
        /* tablero */
      } else if (!esDuenio) {
        throw new NotFoundException('Ese animal ya no está en el catálogo.');
      }
    }

    let puntaje: { puntaje: number; fraseExplicable: string } | null = null;
    let tienePerfil = false;
    if (usuarioId && rol === 'adoptante') {
      const perfil = await this.prisma.perfilAdoptante.findUnique({ where: { usuarioId } });
      if (perfil) {
        tienePerfil = true;
        puntaje = calcularPuntaje(perfil, animal);
      }
    }

    return {
      id: animal.id,
      nombre: animal.nombre,
      especie: animal.especie,
      sexo: animal.sexo,
      talla: animal.talla,
      edadAprox: animal.edadAprox,
      energia: animal.energia,
      historia: animal.historia,
      raza: animal.raza,
      necesidadEspecial: animal.necesidadEspecial,
      conviveNinos: animal.conviveNinos,
      conviveOtrosAnimales: animal.conviveOtrosAnimales,
      esterilizado: animal.esterilizado,
      estado: animal.estado,
      localidad: animal.localidad.nombre,
      localidadId: animal.localidadId,
      entidad: {
        id: animal.entidad.id,
        nombre: animal.entidad.nombre,
        badge: animal.entidad.estadoVerificacion,
        localidad: animal.entidad.localidad.nombre,
      },
      demo: esCuentaPiloto(animal.entidad.usuario.correo),
      fotos: animal.fotos.map((f) => ({
        id: f.id,
        url: `/api/animales/${animal.id}/fotos/${f.id}`,
        esPortada: f.esPortada,
      })),
      tienePerfil,
      ...puntaje,
    };
  }

  async rutaFoto(animalId: string, fotoId: string) {
    const foto = await this.prisma.animalFoto.findUnique({
      where: { id: fotoId },
      include: { animal: true },
    });
    if (!foto || foto.animalId !== animalId) {
      throw new NotFoundException('No encontré esa foto.');
    }
    if (
      foto.animal.estado !== EstadoAnimal.publicado &&
      foto.animal.estado !== EstadoAnimal.reservado &&
      foto.animal.estado !== EstadoAnimal.adoptado
    ) {
      throw new NotFoundException('Esa foto no es pública.');
    }
    const absoluta = normalize(join(process.cwd(), foto.rutaArchivo));
    const raiz = normalize(RAIZ) + sep;
    if (!absoluta.startsWith(raiz)) {
      throw new ForbiddenException('Ruta de archivo no válida.');
    }
    return { absoluta, mime: foto.mime };
  }

  private tarjeta(a: {
    id: string;
    nombre: string;
    especie: Especie;
    historia: string;
    necesidadEspecial: boolean;
    raza: string | null;
    edadAprox: string;
    estado?: EstadoAnimal;
    creadoEn?: Date;
    localidad: { nombre: string };
    entidad: { id: string; nombre: string; estadoVerificacion: string; usuario?: { correo: string } };
    fotos: { id: string }[];
  }) {
    return {
      id: a.id,
      nombre: a.nombre,
      especie: a.especie,
      localidad: a.localidad.nombre,
      historia: a.historia.slice(0, 90),
      necesidadEspecial: a.necesidadEspecial,
      raza: a.raza,
      edadAprox: a.edadAprox,
      badge: a.entidad.estadoVerificacion,
      entidadId: a.entidad.id,
      entidadNombre: a.entidad.nombre,
      fotoUrl: a.fotos[0] ? `/api/animales/${a.id}/fotos/${a.fotos[0].id}` : null,
      creadoEn: a.creadoEn,
      demo: esCuentaPiloto(a.entidad.usuario?.correo),
    };
  }

  private cupoVisibilidad(t: { necesidadEspecial: boolean; raza: string | null; edadAprox: string }) {
    let n = 0;
    if (t.necesidadEspecial) n += 3;
    if (!t.raza) n += 2;
    if (t.edadAprox === 'adulto' || t.edadAprox === 'senior') n += 2;
    return n;
  }

  private especie(valor?: string): Especie {
    if (valor === Especie.canino || valor === Especie.felino) {
      return valor;
    }
    throw new BadRequestException('Solo se publican caninos o felinos domésticos.');
  }

  private sexo(valor?: string): Sexo {
    if (valor === Sexo.macho || valor === Sexo.hembra) return valor;
    throw new BadRequestException('El sexo debe ser macho o hembra.');
  }

  private talla(valor?: string): Talla {
    if (valor === Talla.pequeno || valor === Talla.mediano || valor === Talla.grande) {
      return valor;
    }
    throw new BadRequestException('La talla no es válida.');
  }

  private energia(valor?: string): Energia {
    if (valor === Energia.baja || valor === Energia.media || valor === Energia.alta) {
      return valor;
    }
    throw new BadRequestException('La energía no es válida.');
  }

  private esterilizado(valor?: string) {
    if (valor === 'true' || valor === 'on' || valor === 'si') return true;
    if (valor === 'false' || valor === 'no') return false;
    return null;
  }

  private validarFoto(foto: ArchivoFoto) {
    if (foto.size <= 0 || foto.size > MAX_BYTES) {
      throw new BadRequestException('La foto debe pesar como máximo 5 MB.');
    }
    if (!MIME_FOTO.includes(foto.mimetype)) {
      throw new BadRequestException('La foto debe ser JPEG, PNG o WebP.');
    }
  }

  private extension(mime: string) {
    if (mime === 'image/png') return '.png';
    if (mime === 'image/webp') return '.webp';
    return '.jpg';
  }
}
