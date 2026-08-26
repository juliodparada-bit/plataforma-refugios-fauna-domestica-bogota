import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SesionGuard, type SesionPayload } from '../auth/sesion.guard';
import { CrearPostulacionDto } from './dto/crear.dto';
import { ResolverPostulacionDto } from './dto/resolver.dto';
import { PostulacionesService } from './postulaciones.service';

type ReqSesion = Request & { sesion: SesionPayload };

@Controller()
export class PostulacionesController {
  constructor(private readonly servicio: PostulacionesService) {}

  @Post('animales/:id/postulaciones')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('adoptante')
  crear(
    @Req() req: ReqSesion,
    @Param('id') id: string,
    @Body() dto: CrearPostulacionDto,
  ) {
    return this.servicio.crear(req.sesion.sub, id, dto);
  }

  @Get('postulaciones/mias')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('adoptante')
  mias(@Req() req: ReqSesion) {
    return this.servicio.mias(req.sesion.sub);
  }

  @Get('animales/:id/postulaciones')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('entidad')
  deAnimal(@Req() req: ReqSesion, @Param('id') id: string) {
    return this.servicio.deAnimal(req.sesion.sub, id);
  }

  @Post('postulaciones/:id/resolver')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('entidad')
  resolver(
    @Req() req: ReqSesion,
    @Param('id') id: string,
    @Body() dto: ResolverPostulacionDto,
  ) {
    return this.servicio.resolver(req.sesion.sub, id, dto);
  }
}
