import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { EntrarDto } from './dto/entrar.dto';
import { RegistrarDto } from './dto/registrar.dto';
import { SesionGuard, type SesionPayload } from './sesion.guard';

type ReqConSesion = Request & { sesion: SesionPayload };

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
    res.clearCookie('sid', { path: '/' });
    return { ok: true };
  }

  @Get('yo')
  @UseGuards(SesionGuard)
  yo(@Req() req: ReqConSesion) {
    return this.auth.yo(req.sesion.sub);
  }

  private ponerCookie(res: Response, token: string) {
    res.cookie('sid', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
