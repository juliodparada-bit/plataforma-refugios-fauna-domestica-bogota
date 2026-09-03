import { calcularPuntaje } from './puntaje';

describe('calcularPuntaje', () => {
  it('devuelve un número 0–100 y una frase cuando hay coincidencias', () => {
    const r = calcularPuntaje(
      {
        tipoVivienda: 'casa_con_patio',
        horasCompania: 8,
        ninosEnHogar: false,
        otrosAnimales: 'ninguno',
        energiaSostenible: 'media',
      },
      {
        especie: 'canino',
        talla: 'grande',
        energia: 'media',
        conviveNinos: true,
        conviveOtrosAnimales: true,
      },
    );
    expect(r.puntaje).toBeGreaterThan(0);
    expect(r.puntaje).toBeLessThanOrEqual(100);
    expect(r.fraseExplicable.length).toBeGreaterThan(10);
  });

  it('menciona el choque si hay niños y el animal no convive con ellos', () => {
    const r = calcularPuntaje(
      {
        tipoVivienda: 'apartamento',
        horasCompania: 4,
        ninosEnHogar: true,
        otrosAnimales: 'ninguno',
        energiaSostenible: 'baja',
      },
      {
        especie: 'felino',
        talla: 'pequeno',
        energia: 'baja',
        conviveNinos: false,
        conviveOtrosAnimales: true,
      },
    );
    expect(r.fraseExplicable).toMatch(/niños/);
  });
});
