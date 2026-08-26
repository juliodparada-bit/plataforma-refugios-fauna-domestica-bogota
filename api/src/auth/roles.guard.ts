import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_CLAVE } from './roles.decorator';
import type { SesionPayload } from './sesion.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_CLAVE, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) {
      return true;
    }
    const req = context.switchToHttp().getRequest<Request & { sesion?: SesionPayload }>();
    if (!req.sesion || !roles.includes(req.sesion.rol)) {
      throw new ForbiddenException('No tienes permiso para esta operación.');
    }
    return true;
  }
}
