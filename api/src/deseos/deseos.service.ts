import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoItem, EstadoReserva } from '@prisma/client';
import { mkdir, writeFile } from 'fs/promises';
import { join, normalize, sep } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { exigirEntidad, exigirPublicadora } from '../comun/entidad';
import { esCuentaPiloto } from '../comun/demo';

const MAX_BYTES = 5_242_880;
const MIME_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const RAIZ = join(process.cwd(), 'uploads', 'recepciones');

export type ArchivoFoto = {
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class DeseosService {
  constructor(private readonly prisma: PrismaService) {}

  async publicar(
    usuarioId: string,
    dto: {
      categoria: 'alimento' | 'medicina' | 'aseo';
      descripcion: string;
      cantidad: number;
      unidad: string;
      prioridad: 'baja' | 'media' | 'alta';
    },
  ) {
    const entidad = await exigirPublicadora(
      this.prisma,
      usuarioId,
      'Aún no puedes publicar ítems: falta la verificación.',
    );
    return this.prisma.itemDeseo.create({
      data: {
        entidadId: entidad.id,
        categoria: dto.categoria,
        descripcion: dto.descripcion.trim(),
        cantidad: dto.cantidad,
        unidad: dto.unidad.trim(),
        prioridad: dto.prioridad,
        estado: EstadoItem.pendiente,
      },
    });
  }

  async mios(usuarioId: string) {
    const entidad = await exigirEntidad(this.prisma, usuarioId);
    await this.caducarVencidas();
    return this.prisma.itemDeseo.findMany({
      where: { entidadId: entidad.id },
      include: {
        reservas: {
          where: { estado: { in: [EstadoReserva.reservado, EstadoReserva.cubierto] } },
          include: { evidencia: true, donante: { select: { nombre: true } } },
          orderBy: { creadoEn: 'desc' },
          take: 1,
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async publicos(entidadId: string) {
    await this.caducarVencidas();
    const entidad = await this.prisma.entidad.findUnique({ where: { id: entidadId } });
    if (!entidad) {
      throw new NotFoundException('No encontré esa entidad.');
    }
    const items = await this.prisma.itemDeseo.findMany({
      where: { entidadId, estado: { in: [EstadoItem.pendiente, EstadoItem.reservado] } },
      orderBy: [{ prioridad: 'asc' }, { creadoEn: 'desc' }],
    });
    const orden: Record<string, number> = { alta: 0, media: 1, baja: 2 };
    return items
      .sort((a, b) => orden[a.prioridad] - orden[b.prioridad])
      .map((i) => ({
      id: i.id,
      categoria: i.categoria,
      descripcion: i.descripcion,
      cantidad: i.cantidad,
      unidad: i.unidad,
      prioridad: i.prioridad,
      estado: i.estado,
    }));
  }

  async bitacora(entidadId: string) {
    const filas = await this.prisma.itemDeseo.findMany({
      where: { entidadId, estado: EstadoItem.cubierto },
      include: {
        reservas: {
          where: { estado: EstadoReserva.cubierto },
          include: { evidencia: true },
          take: 1,
        },
      },
      orderBy: { actualizadoEn: 'desc' },
    });
    return filas.map((i) => ({
      categoria: i.categoria,
      descripcion: i.descripcion,
      cantidad: i.cantidad,
      unidad: i.unidad,
      cubiertoEn: i.reservas[0]?.evidencia?.creadoEn ?? i.actualizadoEn,
    }));
  }

  async reservar(usuarioId: string, itemId: string, contactoEntrega: string) {
    await this.caducarVencidas();
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (usuario?.rol !== 'donante') {
      throw new ForbiddenException('Solo un donante puede reservar un ítem.');
    }
    const item = await this.prisma.itemDeseo.findUnique({ where: { id: itemId } });
    if (!item || item.estado !== EstadoItem.pendiente) {
      throw new ConflictException('Ese ítem no está pendiente.');
    }
    const limite = new Date();
    limite.setDate(limite.getDate() + 7);
    const [reserva] = await this.prisma.$transaction([
      this.prisma.reservaDeseo.create({
        data: {
          itemDeseoId: itemId,
          donanteId: usuarioId,
          estado: EstadoReserva.reservado,
          contactoEntrega: contactoEntrega.trim(),
          fechaLimite: limite,
        },
      }),
      this.prisma.itemDeseo.update({
        where: { id: itemId },
        data: { estado: EstadoItem.reservado },
      }),
    ]);
    return reserva;
  }

  async confirmar(
    usuarioId: string,
    reservaId: string,
    checkRecibido: boolean,
    foto?: ArchivoFoto,
  ) {
    if (!checkRecibido && !foto) {
      throw new BadRequestException('Confirma con foto o con el check de recibido.');
    }
    const reserva = await this.prisma.reservaDeseo.findUnique({
      where: { id: reservaId },
      include: { item: { include: { entidad: true } } },
    });
    if (!reserva) {
      throw new NotFoundException('No encontré esa reserva.');
    }
    if (reserva.item.entidad.usuarioId !== usuarioId) {
      throw new ForbiddenException('Solo la entidad confirma la recepción.');
    }
    if (reserva.estado !== EstadoReserva.reservado) {
      throw new ConflictException('Esa reserva ya no está pendiente de confirmación.');
    }

    let rutaArchivo: string | null = null;
    let mime: string | null = null;
    let pesoBytes: number | null = null;
    if (foto) {
      if (foto.size <= 0 || foto.size > MAX_BYTES || !MIME_FOTO.includes(foto.mimetype)) {
        throw new BadRequestException('La foto debe ser JPEG, PNG o WebP de máximo 5 MB.');
      }
      const ext = foto.mimetype === 'image/png' ? '.png' : foto.mimetype === 'image/webp' ? '.webp' : '.jpg';
      const carpeta = join(RAIZ, reservaId);
      await mkdir(carpeta, { recursive: true });
      await writeFile(join(carpeta, `evidencia${ext}`), foto.buffer);
      rutaArchivo = join('uploads', 'recepciones', reservaId, `evidencia${ext}`);
      mime = foto.mimetype;
      pesoBytes = foto.size;
    }

    await this.prisma.$transaction([
      this.prisma.evidenciaRecepcion.create({
        data: {
          reservaDeseoId: reservaId,
          checkRecibido: true,
          rutaArchivo,
          mime,
          pesoBytes,
        },
      }),
      this.prisma.reservaDeseo.update({
        where: { id: reservaId },
        data: { estado: EstadoReserva.cubierto },
      }),
      this.prisma.itemDeseo.update({
        where: { id: reserva.itemDeseoId },
        data: { estado: EstadoItem.cubierto },
      }),
    ]);
    return { ok: true };
  }

  async perfilPublico(entidadId: string) {
    const entidad = await this.prisma.entidad.findUnique({
      where: { id: entidadId },
      include: { localidad: true, usuario: { select: { correo: true } } },
    });
    if (!entidad) {
      throw new NotFoundException('No encontré esa entidad.');
    }
    const bitacora = await this.bitacora(entidadId);
    const deseos = await this.publicos(entidadId);
    const animales = await this.prisma.animal.findMany({
      where: { entidadId, estado: 'publicado' },
      include: {
        localidad: true,
        fotos: { where: { esPortada: true }, take: 1 },
      },
      orderBy: { creadoEn: 'desc' },
    });
    return {
      id: entidad.id,
      nombre: entidad.nombre,
      localidad: entidad.localidad.nombre,
      badge: entidad.estadoVerificacion,
      demo: esCuentaPiloto(entidad.usuario.correo),
      bitacora,
      deseos,
      animales: animales.map((a) => ({
        id: a.id,
        nombre: a.nombre,
        especie: a.especie,
        localidad: a.localidad.nombre,
        historia: a.historia.slice(0, 90),
        necesidadEspecial: a.necesidadEspecial,
        fotoUrl: a.fotos[0] ? `/api/animales/${a.id}/fotos/${a.fotos[0].id}` : null,
        demo: esCuentaPiloto(entidad.usuario.correo),
      })),
    };
  }

  async rutaEvidencia(reservaId: string, usuarioId: string) {
    const reserva = await this.prisma.reservaDeseo.findUnique({
      where: { id: reservaId },
      include: { evidencia: true, item: { include: { entidad: true } } },
    });
    if (!reserva?.evidencia?.rutaArchivo) {
      throw new NotFoundException('No hay foto de recepción.');
    }
    if (reserva.item.entidad.usuarioId !== usuarioId) {
      throw new ForbiddenException('La evidencia de recepción no es pública.');
    }
    const absoluta = normalize(join(process.cwd(), reserva.evidencia.rutaArchivo));
    const raiz = normalize(RAIZ) + sep;
    if (!absoluta.startsWith(raiz)) {
      throw new ForbiddenException('Ruta de archivo no válida.');
    }
    return { absoluta, mime: reserva.evidencia.mime ?? 'image/jpeg' };
  }

  private async caducarVencidas() {
    const hoy = new Date();
    const vencidas = await this.prisma.reservaDeseo.findMany({
      where: { estado: EstadoReserva.reservado, fechaLimite: { lt: hoy } },
    });
    for (const r of vencidas) {
      await this.prisma.$transaction([
        this.prisma.reservaDeseo.update({
          where: { id: r.id },
          data: { estado: EstadoReserva.vencido },
        }),
        this.prisma.itemDeseo.update({
          where: { id: r.itemDeseoId },
          data: { estado: EstadoItem.pendiente },
        }),
      ]);
    }
  }
}
