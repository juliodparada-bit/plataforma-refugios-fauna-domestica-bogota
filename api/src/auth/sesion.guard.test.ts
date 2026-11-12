import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SesionGuard } from './sesion.guard';

function contexto(token?: string) {
  const req = {
    cookies: token ? { sid: token } : {},
    headers: {},
  };
  return {
    req,
    ctx: {
      switchToHttp: () => ({ getRequest: () => req }),
    } as never,
  };
}

describe('SesionGuard', () => {
  it('pide iniciar sesión cuando no hay cookie ni Bearer', async () => {
    const jwt = { verifyAsync: jest.fn() } as unknown as JwtService;
    const guard = new SesionGuard(jwt);
    const { ctx } = contexto();

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    expect(jwt.verifyAsync).not.toHaveBeenCalled();
  });

  it('rechaza un token que el JWT no puede verificar', async () => {
    const jwt = {
      verifyAsync: jest.fn().mockRejectedValue(new Error('firma')),
    } as unknown as JwtService;
    const guard = new SesionGuard(jwt);
    const { ctx } = contexto('token-malo');

    await expect(guard.canActivate(ctx)).rejects.toThrow('La sesión ya no es válida.');
  });

  it('guarda la sesión cuando el token es válido', async () => {
    const jwt = {
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'u1', rol: 'adoptante' }),
    } as unknown as JwtService;
    const guard = new SesionGuard(jwt);
    const { ctx, req } = contexto('token-bueno');

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect((req as { sesion?: { sub: string } }).sesion?.sub).toBe('u1');
  });
});
