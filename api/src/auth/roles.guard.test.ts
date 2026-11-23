import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function contexto(rol?: string) {
  const req = { sesion: rol ? { sub: 'u1', rol } : undefined };
  return {
    req,
    ctx: {
      switchToHttp: () => ({ getRequest: () => req }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as never,
  };
}

describe('RolesGuard', () => {
  it('deja pasar cuando el endpoint no declara roles', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const { ctx } = contexto();

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('responde 403 si la sesión no trae uno de los roles pedidos', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['entidad']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const { ctx } = contexto('adoptante');

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('deja pasar a la entidad cuando el endpoint es de entidad', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['entidad']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const { ctx } = contexto('entidad');

    expect(guard.canActivate(ctx)).toBe(true);
  });
});
