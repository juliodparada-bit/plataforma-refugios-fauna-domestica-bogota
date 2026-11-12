import { esCuentaPiloto } from './demo';

describe('esCuentaPiloto', () => {
  it('reconoce el dominio de las cuentas de piloto y nada más', () => {
    expect(esCuentaPiloto('adoptante.ejemplo@local.test')).toBe(true);
    expect(esCuentaPiloto('Alguien@LOCAL.TEST')).toBe(true);
    expect(esCuentaPiloto('ada@mestizo.co')).toBe(false);
    expect(esCuentaPiloto(null)).toBe(false);
    expect(esCuentaPiloto(undefined)).toBe(false);
  });
});
