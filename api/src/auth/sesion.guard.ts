import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export type SesionPayload = {
  sub: string;
  rol: string;
};

@Injectable()
export class SesionGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = (req.cookies as Record<string, string> | undefined)?.sid;
    if (!token) {
      throw new UnauthorizedException('Debes iniciar sesión.');
    }
    try {
      const payload = await this.jwt.verifyAsync<SesionPayload>(token);
      (req as Request & { sesion: SesionPayload }).sesion = payload;
      return true;
    } catch {
      throw new UnauthorizedException('La sesión ya no es válida.');
    }
  }
}
