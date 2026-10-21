import { extraerToken } from './token';
import type { Request } from 'express';

function req(parcial: { cookies?: Record<string, string>; authorization?: string }): Request {
  return {
    cookies: parcial.cookies,
    headers: { authorization: parcial.authorization },
  } as unknown as Request;
}

describe('extraerToken', () => {
  it('prioriza la cookie sid de la web', () => {
    expect(
      extraerToken(
        req({ cookies: { sid: 'cookie' }, authorization: 'Bearer header' }),
      ),
    ).toBe('cookie');
  });

  it('lee Authorization Bearer para el móvil', () => {
    expect(extraerToken(req({ authorization: 'Bearer abc.def' }))).toBe('abc.def');
  });

  it('sin cookie ni Bearer no hay sesión', () => {
    expect(extraerToken(req({}))).toBeUndefined();
  });
});
