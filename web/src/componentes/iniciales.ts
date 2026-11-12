/** Iniciales del nombre para el avatar cuando no hay foto. */
export function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  const letras = (partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '');
  return letras.toUpperCase() || '?';
}
