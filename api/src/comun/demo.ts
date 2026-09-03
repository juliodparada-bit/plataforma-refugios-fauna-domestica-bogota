export function esCuentaPiloto(correo: string | null | undefined) {
  return Boolean(correo?.toLowerCase().endsWith('@local.test'));
}
