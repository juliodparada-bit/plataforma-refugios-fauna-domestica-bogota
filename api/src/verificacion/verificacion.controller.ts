import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request, Response } from 'express';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SesionGuard, type SesionPayload } from '../auth/sesion.guard';
import { ResolverDto } from './dto/resolver.dto';
import {
  TIPOS_EVIDENCIA,
  VerificacionService,
  type ArchivoSubido,
} from './verificacion.service';

type ReqSesion = Request & { sesion: SesionPayload };

const campos = TIPOS_EVIDENCIA.map((nombre) => ({ name: nombre, maxCount: 1 }));

@Controller()
export class VerificacionController {
  constructor(private readonly servicio: VerificacionService) {}

  @Post('verificaciones')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('entidad')
  @UseInterceptors(
    FileFieldsInterceptor(campos, {
      storage: memoryStorage(),
      limits: { fileSize: 5_242_880 },
    }),
  )
  solicitar(
    @Req() req: ReqSesion,
    @Body()
    cuerpo: { nombre?: string; localidadId?: string; tipoNivel?: string },
    @UploadedFiles()
    grupos: Record<string, Express.Multer.File[] | undefined>,
  ) {
    const archivos: ArchivoSubido[] = [];
    for (const lista of Object.values(grupos ?? {})) {
      for (const f of lista ?? []) {
        if (!f.size) {
          continue;
        }
        archivos.push({
          fieldname: f.fieldname,
          originalname: f.originalname,
          mimetype: f.mimetype,
          size: f.size,
          buffer: f.buffer,
        });
      }
    }
    return this.servicio.solicitar(
      req.sesion.sub,
      {
        nombre: cuerpo.nombre ?? '',
        localidadId: cuerpo.localidadId ?? '',
        tipoNivel: cuerpo.tipoNivel ?? '',
      },
      archivos,
    );
  }

  @Get('verificaciones/mia')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('entidad')
  mia(@Req() req: ReqSesion) {
    return this.servicio.mia(req.sesion.sub);
  }

  @Get('verificaciones')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('validador')
  cola() {
    return this.servicio.cola();
  }

  @Get('verificaciones/:id')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('entidad', 'validador')
  detalle(@Req() req: ReqSesion, @Param('id') id: string) {
    return this.servicio.detalle(id, req.sesion.sub, req.sesion.rol);
  }

  @Post('verificaciones/:id/resolver')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('validador')
  resolver(
    @Req() req: ReqSesion,
    @Param('id') id: string,
    @Body() dto: ResolverDto,
  ) {
    return this.servicio.resolver(id, req.sesion.sub, dto);
  }

  @Get('verificaciones/:id/evidencias/:evidenciaId')
  @UseGuards(SesionGuard, RolesGuard)
  @Roles('entidad', 'validador')
  async archivo(
    @Req() req: ReqSesion,
    @Param('id') id: string,
    @Param('evidenciaId') evidenciaId: string,
    @Res() res: Response,
  ) {
    const { absoluta, mime, nombre } = await this.servicio.rutaArchivo(
      id,
      evidenciaId,
      req.sesion.sub,
      req.sesion.rol,
    );
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `inline; filename="${nombre}"`);
    return res.sendFile(absoluta);
  }
}
