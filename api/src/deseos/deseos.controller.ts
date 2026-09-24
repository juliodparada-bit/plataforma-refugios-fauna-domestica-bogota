import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request, Response } from 'express';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SesionGuard, type SesionPayload } from '../auth/sesion.guard';
import { ConfirmarDto } from './dto/confirmar.dto';
import { PublicarDeseoDto } from './dto/publicar.dto';
import { ReservarDto } from './dto/reservar.dto';
import { DeseosService } from './deseos.service';

type ReqSesion = Request & { sesion: SesionPayload };

@Controller()
export class DeseosController {
  constructor(private readonly servicio: DeseosService) {}

  @Post('deseos')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('entidad')
  publicar(@Req() req: ReqSesion, @Body() dto: PublicarDeseoDto) {
    return this.servicio.publicar(req.sesion.sub, dto);
  }

  @Get('deseos/mios')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('entidad')
  mios(@Req() req: ReqSesion) {
    return this.servicio.mios(req.sesion.sub);
  }

  @Get('entidades')
  listar() {
    return this.servicio.listarPublicas();
  }

  @Get('entidades/:id/deseos')
  publicos(@Param('id') id: string) {
    return this.servicio.publicos(id);
  }

  @Get('entidades/:id')
  perfil(@Param('id') id: string) {
    return this.servicio.perfilPublico(id);
  }

  @Post('deseos/:id/reservar')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('donante')
  reservar(
    @Req() req: ReqSesion,
    @Param('id') id: string,
    @Body() dto: ReservarDto,
  ) {
    return this.servicio.reservar(req.sesion.sub, id, dto.contactoEntrega);
  }

  @Post('reservas/:id/confirmar')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('entidad')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
      limits: { fileSize: 5_242_880 },
    }),
  )
  confirmar(
    @Req() req: ReqSesion,
    @Param('id') id: string,
    @Body() cuerpo: { checkRecibido?: string },
    @UploadedFile() foto: Express.Multer.File | undefined,
  ) {
    const check =
      cuerpo.checkRecibido === 'true' ||
      cuerpo.checkRecibido === 'on' ||
      (cuerpo as unknown as ConfirmarDto).checkRecibido === true;
    return this.servicio.confirmar(
      req.sesion.sub,
      id,
      check,
      foto
        ? { mimetype: foto.mimetype, size: foto.size, buffer: foto.buffer }
        : undefined,
    );
  }

  @Get('reservas/:id/evidencia')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('entidad')
  async evidencia(
    @Req() req: ReqSesion,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { absoluta, mime } = await this.servicio.rutaEvidencia(id, req.sesion.sub);
    res.setHeader('Content-Type', mime);
    return res.sendFile(absoluta);
  }
}
