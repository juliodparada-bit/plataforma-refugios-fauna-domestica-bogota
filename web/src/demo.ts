/** El API ya manda `demo` para cuentas @local.test. Esto cubre el sello en pantalla. */
export function esFichaDemo(marca?: {
  demo?: boolean;
  correo?: string | null;
  nombre?: string | null;
  entidadNombre?: string | null;
  historia?: string | null;
}) {
  if (!marca) return false;
  if (marca.demo) return true;
  return Boolean(marca.correo?.toLowerCase().endsWith('@local.test'));
}

export function nombreVisible(nombre: string) {
  return nombre.trim();
}

export function marcaDiagonal(nombre: string) {
  const limpio = nombreVisible(nombre);
  const palabra = limpio.split(/\s+/).find((p) => p.length > 1) ?? limpio;
  return palabra.toUpperCase();
}

export function historiaVisible(historia: string) {
  return historia.trim();
}
