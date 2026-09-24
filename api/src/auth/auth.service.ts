import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Rol } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join, normalize, sep } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { esCuentaPiloto } from '../comun/demo';
import { selloPermitePublicar } from '../comun/entidad';
import { ActualizarCuentaDto } from './dto/actualizar-cuenta.dto';
import { EntrarDto } from './dto/entrar.dto';
import { RegistrarDto } from './dto/registrar.dto';

const MENSAJE_LOGIN = 'Correo o contraseña incorrectos.';
const MAX_FOTO = 5_242_880;
const MIME_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const RAIZ_FOTO = join(process.cwd(), 'uploads', 'perfiles');

export type ArchivoPerfil = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async registrar(dto: RegistrarDto) {
    if (!dto.consentimientoDatos) {
      throw new BadRequestException(
        'Debes aceptar el tratamiento de datos personales.',
      );
    }

    const localidad = await this.prisma.localidad.findUnique({
      where: { id: dto.localidadId },
    });
    if (!localidad) {
      throw new BadRequestException('La localidad no es válida.');
    }

    const existe = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo.toLowerCase().trim() },
    });
    if (existe) {
      throw new ConflictException('Este correo ya está registrado.');
    }

    const hashContrasena = await bcrypt.hash(dto.contrasena, 12);
    const ahora = new Date();
    const correo = dto.correo.toLowerCase().trim();

    const usuario = await this.prisma.$transaction(async (tx) => {
      const creado = await tx.usuario.create({
        data: {
          nombre: dto.nombre.trim(),
          correo,
          hashContrasena,
          rol: dto.rol,
          localidadId: dto.localidadId,
          consentimientoDatos: true,
          consentimientoEn: ahora,
        },
      });

      if (dto.rol === Rol.entidad) {
        await tx.entidad.create({
          data: {
            usuarioId: creado.id,
            nombre: dto.nombre.trim(),
            nivelSolicitado: 'nivel_2',
            estadoVerificacion: 'en_revision',
            localidadId: dto.localidadId,
          },
        });
      }

      return creado;
    });

    return this.aSesion(usuario.id, usuario.rol);
  }

  async entrar(dto: EntrarDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo.toLowerCase().trim() },
    });
    if (!usuario) {
      throw new UnauthorizedException(MENSAJE_LOGIN);
    }
    const ok = await bcrypt.compare(dto.contrasena, usuario.hashContrasena);
    if (!ok) {
      throw new UnauthorizedException(MENSAJE_LOGIN);
    }
    return this.aSesion(usuario.id, usuario.rol);
  }

  async yo(usuarioId: string) {
    const usuario = await this.cargar(usuarioId);
    return this.publico(usuario);
  }

  async actualizar(usuarioId: string, dto: ActualizarCuentaDto) {
    const localidad = await this.prisma.localidad.findUnique({
      where: { id: dto.localidadId },
    });
    if (!localidad) {
      throw new BadRequestException('La localidad no es válida.');
    }

    const actual = await this.cargar(usuarioId);
    const nombre = dto.nombre.trim();

    await this.prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id: usuarioId },
        data: { nombre, localidadId: dto.localidadId },
      });
      if (actual.rol === Rol.entidad && actual.entidad) {
        const hogar = (dto.entidadNombre ?? actual.entidad.nombre).trim();
        if (hogar.length < 2) {
          throw new BadRequestException('El nombre del hogar es demasiado corto.');
        }
        await tx.entidad.update({
          where: { id: actual.entidad.id },
          data: { nombre: hogar, localidadId: dto.localidadId },
        });
      }
    });

    return this.yo(usuarioId);
  }

  async guardarFoto(usuarioId: string, archivo: ArchivoPerfil | undefined) {
    if (!archivo) {
      throw new BadRequestException('Adjunta una foto (JPEG, PNG o WebP).');
    }
    if (archivo.size > MAX_FOTO) {
      throw new BadRequestException('La foto no puede superar 5 MB.');
    }
    if (!MIME_FOTO.includes(archivo.mimetype)) {
      throw new BadRequestException('Usa una foto JPEG, PNG o WebP.');
    }
    await this.cargar(usuarioId);
    const ext =
      archivo.mimetype === 'image/png'
        ? '.png'
        : archivo.mimetype === 'image/webp'
          ? '.webp'
          : extname(archivo.originalname).toLowerCase() === '.jpg'
            ? '.jpg'
            : '.jpeg';
    await mkdir(RAIZ_FOTO, { recursive: true });
    const relativo = join('uploads', 'perfiles', `${usuarioId}${ext}`);
    await writeFile(join(process.cwd(), relativo), archivo.buffer);
    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { fotoPerfilRuta: relativo, fotoPerfilMime: archivo.mimetype },
    });
    return this.yo(usuarioId);
  }

  async rutaFoto(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { fotoPerfilRuta: true, fotoPerfilMime: true },
    });
    if (!usuario?.fotoPerfilRuta) {
      throw new NotFoundException('Esta cuenta no tiene foto de perfil.');
    }
    const absoluta = normalize(join(process.cwd(), usuario.fotoPerfilRuta));
    const raiz = normalize(RAIZ_FOTO) + sep;
    if (!absoluta.startsWith(raiz)) {
      throw new NotFoundException('Esta cuenta no tiene foto de perfil.');
    }
    return { absoluta, mime: usuario.fotoPerfilMime ?? 'image/jpeg' };
  }

  private async cargar(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        localidad: true,
        entidad: true,
        perfilAdoptante: true,
      },
    });
    if (!usuario) {
      throw new UnauthorizedException('La sesión ya no es válida.');
    }
    return usuario;
  }

  emitirToken(usuarioId: string, rol: Rol) {
    return this.jwt.signAsync({ sub: usuarioId, rol });
  }

  private async aSesion(usuarioId: string, rol: Rol) {
    const token = await this.emitirToken(usuarioId, rol);
    const perfil = await this.yo(usuarioId);
    return { token, usuario: perfil };
  }

  private publico(usuario: {
    id: string;
    nombre: string;
    correo: string;
    rol: Rol;
    fotoPerfilRuta: string | null;
    consentimientoEn: Date;
    actualizadoEn: Date;
    localidad: { id: string; nombre: string };
    entidad: {
      id: string;
      estadoVerificacion: string;
      nombre: string;
    } | null;
    perfilAdoptante: { usuarioId: string } | null;
  }) {
    const puedePublicar =
      usuario.rol === Rol.entidad &&
      selloPermitePublicar(usuario.entidad?.estadoVerificacion ?? '');

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      localidadId: usuario.localidad.id,
      localidad: usuario.localidad.nombre,
      fotoUrl: usuario.fotoPerfilRuta
        ? `/api/auth/yo/foto?t=${usuario.actualizadoEn.getTime()}`
        : null,
      consentimientoEn: usuario.consentimientoEn.toISOString(),
      tienePerfilAdoptante: Boolean(usuario.perfilAdoptante),
      demo: esCuentaPiloto(usuario.correo),
      entidad: usuario.entidad
        ? {
            id: usuario.entidad.id,
            nombre: usuario.entidad.nombre,
            estadoVerificacion: usuario.entidad.estadoVerificacion,
            puedePublicar,
          }
        : null,
    };
  }
}
