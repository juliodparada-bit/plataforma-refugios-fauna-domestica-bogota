import type { Energia, Especie, OtrosAnimales, Talla, TipoVivienda } from '@prisma/client';

export type PerfilPuntaje = {
  tipoVivienda: TipoVivienda;
  horasCompania: number;
  ninosEnHogar: boolean;
  otrosAnimales: OtrosAnimales;
  energiaSostenible: Energia;
};

export type AnimalPuntaje = {
  especie: Especie;
  talla: Talla;
  energia: Energia;
  conviveNinos: boolean;
  conviveOtrosAnimales: boolean;
};

export function calcularPuntaje(perfil: PerfilPuntaje, animal: AnimalPuntaje) {
  const coincidencias: string[] = [];
  const choques: string[] = [];
  let puntos = 0;

  if (perfil.energiaSostenible === animal.energia) {
    puntos += 25;
    coincidencias.push('energía');
  } else {
    choques.push('energía');
  }

  if (perfil.ninosEnHogar && !animal.conviveNinos) {
    choques.push('niños en el hogar');
  } else {
    puntos += 20;
    coincidencias.push('convivencia con niños');
  }

  if (perfil.otrosAnimales !== 'ninguno' && !animal.conviveOtrosAnimales) {
    choques.push('otros animales');
  } else {
    puntos += 20;
    coincidencias.push('convivencia con otros animales');
  }

  if (
    animal.especie === 'canino' &&
    animal.talla === 'grande' &&
    perfil.tipoVivienda === 'casa_con_patio'
  ) {
    puntos += 20;
    coincidencias.push('vivienda');
  } else {
    puntos += 10;
  }

  if (animal.energia === 'alta') {
    if (perfil.horasCompania >= 6) {
      puntos += 15;
      coincidencias.push('horas de compañía');
    } else {
      puntos += 5;
      choques.push('horas de compañía para energía alta');
    }
  } else {
    puntos += 15;
  }

  const partes: string[] = [];
  if (coincidencias.length) {
    partes.push(`Coincide en ${coincidencias.join(', ')}`);
  }
  if (choques.length) {
    partes.push(`choque con ${choques.join(', ')}`);
  }

  return {
    puntaje: Math.min(100, puntos),
    fraseExplicable: partes.join('; ') || 'Sin coincidencias claras todavía.',
  };
}
