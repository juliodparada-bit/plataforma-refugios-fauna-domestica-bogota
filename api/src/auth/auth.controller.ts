import {
  Body,
  Controller,
  Get,
  Patch,
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
import { AuthService } from './auth.service';
import { ActualizarCuentaDto } from './dto/actualizar-cuenta.dto';
import { EntrarDto } from './dto/entrar.dto';
import { RegistrarDto } from './dto/registrar.dto';
import { SesionOpcionalGuard } from './sesion-opcional.guard';
import { SesionGuard, type SesionPayload } from './sesion.guard';

type ReqConSesion = Request & { sesion?: SesionPayload };

const COOKIE_SID = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: false,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('registro')
  async registro(
    @Body() dto: RegistrarDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, usuario } = await this.auth.registrar(dto);
    this.ponerCookie(res, token);
    return { usuario };
  }

  @Post('entrar')
  async entrar(
    @Body() dto: EntrarDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, usuario } = await this.auth.entrar(dto);
    this.ponerCookie(res, token);
    return { usuario };
  }

  @Post('salir')
  salir(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('sid', {
      path: COOKIE_SID.path,
      httpOnly: COOKIE_SID.httpOnly,
      sameSite: COOKIE_SID.sameSite,
      secure: COOKIE_SID.secure,
    });
    return { ok: true };
  }

  @Get('yo')
  @UseGuards(SesionOpcionalGuard)
  yo(@Req() req: ReqConSesion) {
    if (!req.sesion) return null;
    return this.auth.yo(req.sesion.sub);
  }

  @Patch('yo')
  @UseGuards(SesionGuard)
  actualizar(@Req() req: ReqConSesion, @Body() dto: ActualizarCuentaDto) {
    return this.auth.actualizar(req.sesion!.sub, dto);
  }

  @Get('yo/foto')
  @UseGuards(SesionGuard)
  async foto(@Req() req: ReqConSesion, @Res() res: Response) {
    const { absoluta, mime } = await this.auth.rutaFoto(req.sesion!.sub);
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', 'inline');
    return res.sendFile(absoluta);
  }

  @Post('yo/foto')
  @UseGuards(SesionGuard)
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
      limits: { fileSize: 5_242_880 },
    }),
  )
  guardarFoto(
    @Req() req: ReqConSesion,
    @UploadedFile() foto: Express.Multer.File | undefined,
  ) {
    return this.auth.guardarFoto(req.sesion!.sub, foto);
  }

  private ponerCookie(res: Response, token: string) {
    res.cookie('sid', token, COOKIE_SID);
  }
}
