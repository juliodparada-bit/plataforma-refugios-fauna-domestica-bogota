import { calcularPuntaje } from './puntaje';

const perfilBase = {
  tipoVivienda: 'apartamento' as const,
  horasCompania: 6,
  ninosEnHogar: false,
  otrosAnimales: 'ninguno' as const,
  energiaSostenible: 'alta' as const,
};

const animalBase = {
  especie: 'felino' as const,
  talla: 'pequeno' as const,
  energia: 'alta' as const,
  conviveNinos: true,
  conviveOtrosAnimales: true,
};

describe('calcularPuntaje, valores límite', () => {
  it('con energía alta suma 15 puntos cuando las horas de compañía son exactamente 6', () => {
    const justo = calcularPuntaje({ ...perfilBase, horasCompania: 6 }, animalBase);
    const debajo = calcularPuntaje({ ...perfilBase, horasCompania: 5 }, animalBase);

    expect(justo.puntaje - debajo.puntaje).toBe(10);
    expect(justo.fraseExplicable).toMatch(/horas de compañía/);
    expect(debajo.fraseExplicable).toMatch(/energía alta/);
  });

  it('un canino grande en casa con patio suma vivienda; cualquier otro caso suma la mitad', () => {
    const encaja = calcularPuntaje(
      { ...perfilBase, tipoVivienda: 'casa_con_patio', energiaSostenible: 'baja' },
      { ...animalBase, especie: 'canino', talla: 'grande', energia: 'baja' },
    );
    const noEncaja = calcularPuntaje(
      { ...perfilBase, tipoVivienda: 'casa', energiaSostenible: 'baja' },
      { ...animalBase, especie: 'canino', talla: 'grande', energia: 'baja' },
    );

    expect(encaja.puntaje - noEncaja.puntaje).toBe(10);
    expect(encaja.fraseExplicable).toMatch(/vivienda/);
  });

  it('el puntaje no pasa de 100 aunque todas las coincidencias sumen más', () => {
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

    expect(r.puntaje).toBe(100);
    expect(r.puntaje).toBeLessThanOrEqual(100);
  });

  it('hay choque de otros animales cuando el hogar tiene alguno y el animal no convive', () => {
    const r = calcularPuntaje(
      { ...perfilBase, otrosAnimales: 'gato' },
      { ...animalBase, conviveOtrosAnimales: false },
    );

    expect(r.fraseExplicable).toMatch(/otros animales/);
  });
});
