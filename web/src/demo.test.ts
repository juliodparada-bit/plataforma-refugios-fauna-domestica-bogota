import { historiaVisible, nombreVisible } from './demo';

describe('textos visibles del catálogo', () => {
  it('recorta espacios del nombre y de la historia', () => {
    expect(nombreVisible('  Luna  ')).toBe('Luna');
    expect(historiaVisible('\nLlegó de un patio.\n')).toBe('Llegó de un patio.');
  });
});
