import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('localidades')
export class LocalidadesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  listar() {
    return this.prisma.localidad.findMany({
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true, codigo: true },
    });
  }
}
