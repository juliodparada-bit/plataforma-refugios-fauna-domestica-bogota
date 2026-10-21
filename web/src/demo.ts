/** Recorte de espacios. Ya no hay marcas DEMO/EJEMPLO que strippear. */
export function nombreVisible(nombre: string) {
  return nombre.trim();
}

export function historiaVisible(historia: string) {
  return historia.trim();
}
