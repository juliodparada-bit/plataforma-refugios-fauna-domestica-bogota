import { ForbiddenException } from '@nestjs/common';
import { PerfilService } from './perfil.service';

describe('PerfilService', () => {
  it('el cuestionario es solo para adoptantes', async () => {
    const prisma = {
      usuario: { findUnique: jest.fn().mockResolvedValue({ rol: 'donante' }) },
      perfilAdoptante: { findUnique: jest.fn(), upsert: jest.fn() },
    };
    const servicio = new PerfilService(prisma as never);

    await expect(servicio.obtener('u1')).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      servicio.guardar('u1', {
        tipoVivienda: 'apartamento',
        horasCompania: 4,
        ninosEnHogar: false,
        otrosAnimales: 'ninguno',
        energiaSostenible: 'baja',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.perfilAdoptante.upsert).not.toHaveBeenCalled();
  });

  it('un adoptante guarda y vuelve a leer su perfil', async () => {
    const dto = {
      tipoVivienda: 'casa' as const,
      horasCompania: 6,
      ninosEnHogar: true,
      otrosAnimales: 'ninguno' as const,
      energiaSostenible: 'media' as const,
    };
    const prisma = {
      usuario: { findUnique: jest.fn().mockResolvedValue({ rol: 'adoptante' }) },
      perfilAdoptante: {
        findUnique: jest.fn().mockResolvedValue(dto),
        upsert: jest.fn().mockResolvedValue(dto),
      },
    };
    const servicio = new PerfilService(prisma as never);

    await expect(servicio.obtener('u1')).resolves.toEqual(dto);
    await servicio.guardar('u1', dto);
    expect(prisma.perfilAdoptante.upsert).toHaveBeenCalled();
  });
});
