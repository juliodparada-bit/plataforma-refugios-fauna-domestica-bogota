import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoAnimal } from '@prisma/client';
import { AnimalesService, type ArchivoFoto } from './animales.service';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

const foto: ArchivoFoto = {
  originalname: 'luna.jpg',
  mimetype: 'image/jpeg',
  size: 1200,
  buffer: Buffer.from('jpeg'),
};

const datosValidos = {
  nombre: 'Luna',
  especie: 'felino',
  sexo: 'hembra',
  talla: 'pequeno',
  edadAprox: 'adulto',
  localidadId: 'loc-ok',
  energia: 'baja',
  historia: 'Llegó de un patio en Chapinero y busca un hogar tranquilo.',
  conviveNinos: 'true',
  conviveOtrosAnimales: 'false',
  necesidadEspecial: 'false',
  raza: '',
};

function fila(parcial: Record<string, unknown> = {}) {
  return {
    id: 'an1',
    nombre: 'Luna',
    especie: 'felino',
    sexo: 'hembra',
    talla: 'pequeno',
    edadAprox: 'adulto',
    energia: 'baja',
    historia: 'Llegó de un patio en Chapinero y busca un hogar tranquilo.',
    raza: null,
    necesidadEspecial: false,
    conviveNinos: true,
    conviveOtrosAnimales: false,
    esterilizado: null,
    estado: EstadoAnimal.publicado,
    localidadId: 'loc-ok',
    creadoEn: new Date('2026-03-01T00:00:00.000Z'),
    localidad: { id: 'loc-ok', nombre: 'Chapinero' },
    entidad: {
      id: 'e1',
      nombre: 'Hogar Norte',
      estadoVerificacion: 'nivel_1',
      usuarioId: 'duenia',
      localidad: { nombre: 'Chapinero' },
      usuario: { correo: 'entidad.ejemplo@local.test' },
    },
    fotos: [{ id: 'f1', esPortada: true, orden: 1 }],
    ...parcial,
  };
}

function prismaDePublicacion() {
  return {
    entidad: {
      findUnique: jest.fn().mockResolvedValue({ id: 'e1', estadoVerificacion: 'nivel_1' }),
    },
    localidad: { findUnique: jest.fn().mockResolvedValue({ id: 'loc-ok' }) },
    animal: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    animalFoto: { create: jest.fn().mockResolvedValue({ id: 'f1' }), findUnique: jest.fn() },
    perfilAdoptante: { findUnique: jest.fn().mockResolvedValue(null) },
  };
}

describe('AnimalesService.publicar', () => {
  it('un nombre de un solo carácter no se guarda', async () => {
    const prisma = prismaDePublicacion();
    const servicio = new AnimalesService(prisma as never);

    await expect(servicio.publicar('u1', { ...datosValidos, nombre: ' L ' }, foto)).rejects.toThrow(
      'obligatorio',
    );
    expect(prisma.animal.create).not.toHaveBeenCalled();
  });

  it('no guarda si falta la foto', async () => {
    const prisma = prismaDePublicacion();
    const servicio = new AnimalesService(prisma as never);

    await expect(servicio.publicar('u1', datosValidos, undefined)).rejects.toThrow(
      'Debes adjuntar al menos una foto.',
    );
    expect(prisma.animal.create).not.toHaveBeenCalled();
  });

  it('la historia de 19 caracteres no pasa y la de 20 sí llega a crear', async () => {
    const prisma = prismaDePublicacion();
    prisma.animal.create.mockResolvedValue({ id: 'an1' });
    prisma.animal.findUnique.mockResolvedValue(fila());
    const servicio = new AnimalesService(prisma as never);

    await expect(
      servicio.publicar('u1', { ...datosValidos, historia: 'x'.repeat(19) }, foto),
    ).rejects.toThrow('mínimo 20');
    expect(prisma.animal.create).not.toHaveBeenCalled();

    await servicio.publicar('u1', { ...datosValidos, historia: 'x'.repeat(20) }, foto);
    expect(prisma.animal.create).toHaveBeenCalled();
  });

  it('el nombre de 80 caracteres se guarda y el de 81 no toca la base', async () => {
    const prisma = prismaDePublicacion();
    prisma.animal.create.mockResolvedValue({ id: 'an1' });
    prisma.animal.findUnique.mockResolvedValue(fila());
    const servicio = new AnimalesService(prisma as never);

    await expect(
      servicio.publicar('u1', { ...datosValidos, nombre: 'N'.repeat(81) }, foto),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.animal.create).not.toHaveBeenCalled();

    await servicio.publicar('u1', { ...datosValidos, nombre: 'N'.repeat(80) }, foto);
    expect(prisma.animal.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ nombre: 'N'.repeat(80) }) }),
    );
  });

  it('solo publica caninos o felinos', async () => {
    const prisma = prismaDePublicacion();
    const servicio = new AnimalesService(prisma as never);

    await expect(
      servicio.publicar('u1', { ...datosValidos, especie: 'ave' }, foto),
    ).rejects.toThrow('caninos o felinos');
    expect(prisma.animal.create).not.toHaveBeenCalled();
  });

  it('rechaza una foto de más de 5 MB o de un tipo que no es imagen admitida', async () => {
    const prisma = prismaDePublicacion();
    const servicio = new AnimalesService(prisma as never);

    await expect(
      servicio.publicar('u1', datosValidos, { ...foto, size: 5_242_881 }),
    ).rejects.toThrow('5 MB');
    await expect(
      servicio.publicar('u1', datosValidos, { ...foto, mimetype: 'application/pdf' }),
    ).rejects.toThrow('JPEG, PNG o WebP');
  });
});

describe('AnimalesService.catalogo', () => {
  it('ordena por visibilidad cuando no hay perfil: necesidad especial y sin raza van primero', async () => {
    const prisma = prismaDePublicacion();
    prisma.animal.findMany.mockResolvedValue([
      fila({ id: 'comun', necesidadEspecial: false, raza: 'criollo', edadAprox: 'joven', creadoEn: new Date('2026-04-01') }),
      fila({ id: 'prioridad', necesidadEspecial: true, raza: null, edadAprox: 'senior', creadoEn: new Date('2026-01-01') }),
    ]);
    const servicio = new AnimalesService(prisma as never);

    const lista = await servicio.catalogo({});

    expect(lista.map((a) => a.id)).toEqual(['prioridad', 'comun']);
    expect(lista[0].demo).toBe(true);
    expect(prisma.perfilAdoptante.findUnique).not.toHaveBeenCalled();
  });

  it('con perfil de adoptante ordena por puntaje y no por visibilidad', async () => {
    const prisma = prismaDePublicacion();
    prisma.perfilAdoptante.findUnique.mockResolvedValue({
      tipoVivienda: 'casa_con_patio',
      horasCompania: 8,
      ninosEnHogar: false,
      otrosAnimales: 'ninguno',
      energiaSostenible: 'baja',
    });
    prisma.animal.findMany.mockResolvedValue([
      fila({ id: 'bajo', especie: 'felino', talla: 'pequeno', energia: 'alta' }),
      fila({ id: 'alto', especie: 'canino', talla: 'grande', energia: 'baja' }),
    ]);
    const servicio = new AnimalesService(prisma as never);

    const lista = await servicio.catalogo({}, 'adoptante-1');

    expect(lista[0].id).toBe('alto');
    expect(lista[0].puntaje).toBeGreaterThan(lista[1].puntaje ?? 0);
  });

  it('un filtro de especie inválido no consulta la base', async () => {
    const prisma = prismaDePublicacion();
    const servicio = new AnimalesService(prisma as never);

    await expect(servicio.catalogo({ especie: 'ave' })).rejects.toThrow('caninos o felinos');
    expect(prisma.animal.findMany).not.toHaveBeenCalled();
  });
});

describe('AnimalesService.detalle y rutaFoto', () => {
  it('404 si el animal no existe', async () => {
    const prisma = prismaDePublicacion();
    prisma.animal.findUnique.mockResolvedValue(null);
    const servicio = new AnimalesService(prisma as never);

    await expect(servicio.detalle('no-esta')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('oculta un animal que ya no está publicado a quien no es la dueña', async () => {
    const prisma = prismaDePublicacion();
    prisma.animal.findUnique.mockResolvedValue(fila({ estado: EstadoAnimal.reservado }));
    const servicio = new AnimalesService(prisma as never);

    await expect(servicio.detalle('an1', 'otra', 'adoptante')).rejects.toThrow(
      'ya no está en el catálogo',
    );
  });

  it('la dueña sí ve su animal reservado', async () => {
    const prisma = prismaDePublicacion();
    prisma.animal.findUnique.mockResolvedValue(fila({ estado: EstadoAnimal.reservado }));
    const servicio = new AnimalesService(prisma as never);

    const detalle = await servicio.detalle('an1', 'duenia', 'entidad');

    expect(detalle.estado).toBe('reservado');
    expect(detalle.entidad.nombre).toBe('Hogar Norte');
  });

  it('la foto de un borrador no es pública', async () => {
    const prisma = prismaDePublicacion();
    prisma.animalFoto.findUnique.mockResolvedValue({
      id: 'f1',
      animalId: 'an1',
      rutaArchivo: 'uploads/animales/an1/portada.jpg',
      mime: 'image/jpeg',
      animal: { estado: EstadoAnimal.borrador },
    });
    const servicio = new AnimalesService(prisma as never);

    await expect(servicio.rutaFoto('an1', 'f1')).rejects.toThrow('no es pública');
  });
});
