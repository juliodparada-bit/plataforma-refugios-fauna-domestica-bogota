export const SELLO: Record<string, string> = {
  nivel_1: 'Sello Nivel 1',
  nivel_2: 'Sello Nivel 2',
  en_revision: 'En revisión',
  rechazada: 'Rechazada',
};

export const TALLA: Record<string, string> = {
  pequeno: 'pequeño',
  mediano: 'mediano',
  grande: 'grande',
};

export function etiquetaEspecie(especie: string) {
  return especie === 'canino' ? 'Canino' : 'Felino';
}

export function etiquetaSello(valor: string) {
  return SELLO[valor] ?? valor;
}

export function etiquetaTalla(valor: string) {
  return TALLA[valor] ?? valor;
}

export function etiquetaCategoria(valor: string) {
  const mapa: Record<string, string> = {
    alimento: 'Alimento',
    medicina: 'Medicina',
    aseo: 'Aseo',
  };
  return mapa[valor] ?? valor;
}

export function iconoCategoria(valor: string) {
  const mapa: Record<string, string> = {
    alimento: '🌾',
    medicina: '💊',
    aseo: '🧼',
  };
  return mapa[valor] ?? '✦';
}

export function etiquetaRol(rol: 'adoptante' | 'donante' | 'entidad' | 'validador') {
  switch (rol) {
    case 'adoptante':
      return 'Adoptante';
    case 'donante':
      return 'Donante de insumos';
    case 'entidad':
      return 'Entidad';
    case 'validador':
      return 'Validador';
  }
}
