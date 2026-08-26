import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { SesionPayload } from './sesion.guard';

@Injectable()
export class SesionOpcionalGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = (req.cookies as Record<string, string> | undefined)?.sid;
    if (!token) {
      return true;
    }
    try {
      const payload = await this.jwt.verifyAsync<SesionPayload>(token);
      (req as Request & { sesion: SesionPayload }).sesion = payload;
    } catch {
      /* visitante: cookie inválida no bloquea el catálogo */
    }
    return true;
  }
}
