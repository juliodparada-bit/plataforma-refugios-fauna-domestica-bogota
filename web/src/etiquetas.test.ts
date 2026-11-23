import { etiquetaCategoria, etiquetaEspecie, etiquetaRol, etiquetaSello, etiquetaTalla, iconoCategoria } from './etiquetas';

describe('etiquetas del catálogo', () => {
  it('traduce especie, talla y sello, y deja ver el valor crudo si no lo conoce', () => {
    expect(etiquetaEspecie('canino')).toBe('Canino');
    expect(etiquetaEspecie('felino')).toBe('Felino');
    expect(etiquetaTalla('pequeno')).toBe('pequeño');
    expect(etiquetaTalla('raro')).toBe('raro');
    expect(etiquetaSello('nivel_1')).toBe('Sello Nivel 1');
    expect(etiquetaSello('otro')).toBe('otro');
  });

  it('nombra la categoría y su icono, con un respaldo', () => {
    expect(etiquetaCategoria('medicina')).toBe('Medicina');
    expect(etiquetaCategoria('otro')).toBe('otro');
    expect(iconoCategoria('aseo')).toBe('🧼');
    expect(iconoCategoria('otro')).toBe('✦');
  });

  it('nombra cada rol que puede entrar a Mestizo', () => {
    expect(etiquetaRol('adoptante')).toBe('Adoptante');
    expect(etiquetaRol('donante')).toBe('Donante de insumos');
    expect(etiquetaRol('entidad')).toBe('Entidad');
    expect(etiquetaRol('validador')).toBe('Validador');
  });
});
