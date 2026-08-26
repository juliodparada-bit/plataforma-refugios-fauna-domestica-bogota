import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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
import { SesionOpcionalGuard } from '../auth/sesion-opcional.guard';
import { SesionGuard, type SesionPayload } from '../auth/sesion.guard';
import { AnimalesService } from './animales.service';

type ReqSesion = Request & { sesion?: SesionPayload };

@Controller()
export class AnimalesController {
  constructor(private readonly servicio: AnimalesService) {}

  @Get('animales')
  @UseGuards(SesionOpcionalGuard)
  catalogo(
    @Req() req: ReqSesion,
    @Query('especie') especie?: string,
    @Query('localidadId') localidadId?: string,
  ) {
    return this.servicio.catalogo({ especie, localidadId }, req.sesion?.sub);
  }

  @Get('animales/mios')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('entidad')
  mios(@Req() req: ReqSesion) {
    return this.servicio.mios(req.sesion!.sub);
  }

  @Get('animales/:id/fotos/:fotoId')
  async foto(
    @Param('id') id: string,
    @Param('fotoId') fotoId: string,
    @Res() res: Response,
  ) {
    const { absoluta, mime } = await this.servicio.rutaFoto(id, fotoId);
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', 'inline');
    return res.sendFile(absoluta);
  }

  @Get('animales/:id')
  @UseGuards(SesionOpcionalGuard)
  detalle(@Req() req: ReqSesion, @Param('id') id: string) {
    return this.servicio.detalle(id, req.sesion?.sub, req.sesion?.rol);
  }

  @Post('animales')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('entidad')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
      limits: { fileSize: 5_242_880 },
    }),
  )
  publicar(
    @Req() req: ReqSesion,
    @Body() cuerpo: Record<string, string>,
    @UploadedFile() foto: Express.Multer.File | undefined,
  ) {
    return this.servicio.publicar(
      req.sesion!.sub,
      cuerpo,
      foto
        ? {
            originalname: foto.originalname,
            mimetype: foto.mimetype,
            size: foto.size,
            buffer: foto.buffer,
          }
        : undefined,
    );
  }
}
