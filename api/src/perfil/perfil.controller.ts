import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SesionGuard, type SesionPayload } from '../auth/sesion.guard';
import { GuardarPerfilDto } from './dto/guardar-perfil.dto';
import { PerfilService } from './perfil.service';

@Controller('perfil')
@UseGuards(SesionGuard, RolesGuard)
@Roles('adoptante')
export class PerfilController {
  constructor(private readonly servicio: PerfilService) {}

  @Get()
  obtener(@Req() req: Request & { sesion: SesionPayload }) {
    return this.servicio.obtener(req.sesion.sub);
  }

  @Put()
  guardar(
    @Req() req: Request & { sesion: SesionPayload },
    @Body() dto: GuardarPerfilDto,
  ) {
    return this.servicio.guardar(req.sesion.sub, dto);
  }
}
