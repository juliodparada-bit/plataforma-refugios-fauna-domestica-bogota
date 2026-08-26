import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EntrarDto } from './dto/entrar.dto';
import { RegistrarDto } from './dto/registrar.dto';

const MENSAJE_LOGIN = 'Correo o contraseña incorrectos.';

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
    return this.publico(usuario);
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
      (usuario.entidad?.estadoVerificacion === 'nivel_1' ||
        usuario.entidad?.estadoVerificacion === 'nivel_2');

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      localidad: usuario.localidad.nombre,
      tienePerfilAdoptante: Boolean(usuario.perfilAdoptante),
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
