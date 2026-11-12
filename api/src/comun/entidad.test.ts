import { ForbiddenException } from '@nestjs/common';
import { exigirEntidad, exigirPublicadora, selloPermitePublicar } from './entidad';

describe('selloPermitePublicar', () => {
  it.each(['nivel_1', 'nivel_2'])('el sello %s permite publicar', (estado) => {
    expect(selloPermitePublicar(estado)).toBe(true);
  });

  it.each(['en_revision', 'rechazada', ''])('el estado %s no permite publicar', (estado) => {
    expect(selloPermitePublicar(estado)).toBe(false);
  });
});

describe('exigirEntidad', () => {
  it('rechaza una cuenta que no tiene entidad', async () => {
    const prisma = {
      entidad: { findUnique: jest.fn().mockResolvedValue(null) },
    };

    await expect(exigirEntidad(prisma as never, 'u1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.entidad.findUnique).toHaveBeenCalledWith({ where: { usuarioId: 'u1' } });
  });

  it('exigePublicadora no deja publicar sin sello y no sigue si la cuenta no es entidad', async () => {
    const sinEntidad = { entidad: { findUnique: jest.fn().mockResolvedValue(null) } };
    await expect(
      exigirPublicadora(sinEntidad as never, 'u1', 'falta sello'),
    ).rejects.toThrow('Esta cuenta no es una entidad.');

    const enRevision = {
      entidad: {
        findUnique: jest.fn().mockResolvedValue({ id: 'e1', estadoVerificacion: 'en_revision' }),
      },
    };
    await expect(exigirPublicadora(enRevision as never, 'u1', 'falta sello')).rejects.toThrow(
      'falta sello',
    );
  });
});
