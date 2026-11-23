import { iniciales } from './iniciales';

describe('iniciales', () => {
  it('toma la primera letra de los dos primeros nombres', () => {
    expect(iniciales('  ada   lópez  ')).toBe('AL');
  });

  it('con un solo nombre usa una letra', () => {
    expect(iniciales('Ada')).toBe('A');
  });

  it('un nombre vacío no inventa letras', () => {
    expect(iniciales('   ')).toBe('?');
  });
});
