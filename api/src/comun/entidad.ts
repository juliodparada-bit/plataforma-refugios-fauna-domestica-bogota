import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export async function exigirEntidad(prisma: PrismaService, usuarioId: string) {
  const entidad = await prisma.entidad.findUnique({ where: { usuarioId } });
  if (!entidad) {
    throw new ForbiddenException('Esta cuenta no es una entidad.');
  }
  return entidad;
}

export function selloPermitePublicar(estado: string) {
  return estado === 'nivel_1' || estado === 'nivel_2';
}

export async function exigirPublicadora(
  prisma: PrismaService,
  usuarioId: string,
  mensaje: string,
) {
  const entidad = await exigirEntidad(prisma, usuarioId);
  if (!selloPermitePublicar(entidad.estadoVerificacion)) {
    throw new ForbiddenException(mensaje);
  }
  return entidad;
}
