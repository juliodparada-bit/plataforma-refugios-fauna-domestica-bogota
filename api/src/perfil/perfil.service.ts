import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GuardarPerfilDto } from './dto/guardar-perfil.dto';

@Injectable()
export class PerfilService {
  constructor(private readonly prisma: PrismaService) {}

  async obtener(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (usuario?.rol !== 'adoptante') {
      throw new ForbiddenException('El cuestionario es para adoptantes.');
    }
    return this.prisma.perfilAdoptante.findUnique({ where: { usuarioId } });
  }

  async guardar(usuarioId: string, dto: GuardarPerfilDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (usuario?.rol !== 'adoptante') {
      throw new ForbiddenException('El cuestionario es para adoptantes.');
    }
    return this.prisma.perfilAdoptante.upsert({
      where: { usuarioId },
      create: { usuarioId, ...dto },
      update: dto,
    });
  }
}
