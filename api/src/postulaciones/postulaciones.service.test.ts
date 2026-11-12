import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EstadoAnimal, EstadoPostulacion } from '@prisma/client';
import { PostulacionesService } from './postulaciones.service';

const perfil = {
  tipoVivienda: 'apartamento',
  horasCompania: 4,
  ninosEnHogar: false,
  otrosAnimales: 'ninguno',
  energiaSostenible: 'baja',
};

const animal = {
  id: 'an1',
  estado: EstadoAnimal.publicado,
  especie: 'felino',
  talla: 'pequeno',
  energia: 'baja',
  conviveNinos: true,
  conviveOtrosAnimales: true,
};

function prismaBase() {
  const prisma = {
    usuario: { findUnique: jest.fn() },
    perfilAdoptante: { findUnique: jest.fn() },
    animal: { findUnique: jest.fn(), update: jest.fn() },
    postulacion: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({ id: 'p1' }),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(async (arg: unknown[]) => Promise.all(arg)),
  };
  return prisma;
}

function fila(estado: EstadoPostulacion, animalEstado = EstadoAnimal.publicado) {
  return {
    id: 'p1',
    animalId: 'an1',
    estado,
    requiereEvidenciaHogar: false,
    animal: {
      id: 'an1',
      nombre: 'Luna',
      estado: animalEstado,
      necesidadEspecial: true,
      entidad: { usuarioId: 'duenia' },
    },
  };
}

describe('PostulacionesService.crear', () => {
  it('exige mayoría de edad y residencia en Bogotá antes de leer la base', async () => {
    const prisma = prismaBase();
    const servicio = new PostulacionesService(prisma as never);

    await expect(
      servicio.crear('u1', 'an1', { mayorDeEdad: false, viveEnBogota: true }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.usuario.findUnique).not.toHaveBeenCalled();
  });

  it('solo un adoptante puede postularse', async () => {
    const prisma = prismaBase();
    prisma.usuario.findUnique.mockResolvedValue({ id: 'u1', rol: 'entidad' });
    const servicio = new PostulacionesService(prisma as never);

    await expect(
      servicio.crear('u1', 'an1', { mayorDeEdad: true, viveEnBogota: true }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.postulacion.create).not.toHaveBeenCalled();
  });

  it('pide el cuestionario de estilo de vida', async () => {
    const prisma = prismaBase();
    prisma.usuario.findUnique.mockResolvedValue({ id: 'u1', rol: 'adoptante' });
    prisma.perfilAdoptante.findUnique.mockResolvedValue(null);
    const servicio = new PostulacionesService(prisma as never);

    await expect(
      servicio.crear('u1', 'an1', { mayorDeEdad: true, viveEnBogota: true }),
    ).rejects.toThrow('cinco preguntas');
  });

  it('no abre otra postulación activa para el mismo animal', async () => {
    const prisma = prismaBase();
    prisma.usuario.findUnique.mockResolvedValue({ id: 'u1', rol: 'adoptante' });
    prisma.perfilAdoptante.findUnique.mockResolvedValue(perfil);
    prisma.animal.findUnique.mockResolvedValue(animal);
    prisma.postulacion.findFirst.mockResolvedValue({ id: 'ya' });
    const servicio = new PostulacionesService(prisma as never);

    await expect(
      servicio.crear('u1', 'an1', { mayorDeEdad: true, viveEnBogota: true }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.postulacion.create).not.toHaveBeenCalled();
  });

  it('guarda el puntaje calculado cuando el camino es válido', async () => {
    const prisma = prismaBase();
    prisma.usuario.findUnique.mockResolvedValue({ id: 'u1', rol: 'adoptante' });
    prisma.perfilAdoptante.findUnique.mockResolvedValue(perfil);
    prisma.animal.findUnique.mockResolvedValue(animal);
    prisma.postulacion.findFirst.mockResolvedValue(null);
    prisma.postulacion.create.mockResolvedValue({ id: 'p1' });
    const servicio = new PostulacionesService(prisma as never);

    await servicio.crear('u1', 'an1', { mayorDeEdad: true, viveEnBogota: true });

    expect(prisma.postulacion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          animalId: 'an1',
          adoptanteId: 'u1',
          estado: EstadoPostulacion.enviada,
          puntaje: expect.any(Number),
          fraseExplicable: expect.any(String),
        }),
      }),
    );
  });
});

describe('PostulacionesService.resolver', () => {
  it('404 si no existe y 403 si el animal es de otro refugio', async () => {
    const prisma = prismaBase();
    prisma.postulacion.findUnique.mockResolvedValue(null);
    const servicio = new PostulacionesService(prisma as never);
    await expect(servicio.resolver('duenia', 'p1', { accion: 'abrir' })).rejects.toBeInstanceOf(
      NotFoundException,
    );

    prisma.postulacion.findUnique.mockResolvedValue({
      ...fila(EstadoPostulacion.enviada),
      animal: { ...fila(EstadoPostulacion.enviada).animal, entidad: { usuarioId: 'otra' } },
    });
    await expect(servicio.resolver('duenia', 'p1', { accion: 'abrir' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('abrir solo una enviada; preseleccionar reserva el animal si no hay otra', async () => {
    const prisma = prismaBase();
    const servicio = new PostulacionesService(prisma as never);
    prisma.postulacion.findUnique.mockResolvedValue(fila(EstadoPostulacion.en_revision));
    await expect(servicio.resolver('duenia', 'p1', { accion: 'abrir' })).rejects.toThrow('enviada');

    prisma.postulacion.findUnique.mockResolvedValue(fila(EstadoPostulacion.enviada));
    prisma.animal.findUnique.mockResolvedValue({
      id: 'an1',
      nombre: 'Luna',
      estado: EstadoAnimal.publicado,
      necesidadEspecial: true,
      entidad: { usuarioId: 'duenia' },
    });
    await servicio.resolver('duenia', 'p1', { accion: 'abrir', requiereEvidenciaHogar: true });
    expect(prisma.postulacion.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ estado: EstadoPostulacion.en_revision }) }),
    );

    prisma.postulacion.findUnique.mockResolvedValue(fila(EstadoPostulacion.enviada, EstadoAnimal.reservado));
    await expect(servicio.resolver('duenia', 'p1', { accion: 'preseleccionar' })).rejects.toThrow(
      'ya no está publicado',
    );

    prisma.postulacion.findUnique.mockResolvedValue(fila(EstadoPostulacion.enviada));
    prisma.postulacion.findFirst.mockResolvedValue({ id: 'otra' });
    await expect(servicio.resolver('duenia', 'p1', { accion: 'preseleccionar' })).rejects.toThrow(
      'preselección',
    );

    prisma.postulacion.findFirst.mockResolvedValue(null);
    const tablero = await servicio.resolver('duenia', 'p1', { accion: 'preseleccionar' });
    expect(prisma.animal.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { estado: EstadoAnimal.reservado } }),
    );
    expect(tablero.animal.nombre).toBe('Luna');
  });

  it('rechazar una preselección republica el animal; caer y entregar cubren el cierre', async () => {
    const prisma = prismaBase();
    const servicio = new PostulacionesService(prisma as never);
    prisma.animal.findUnique.mockResolvedValue({
      id: 'an1',
      nombre: 'Luna',
      estado: EstadoAnimal.publicado,
      necesidadEspecial: false,
      entidad: { usuarioId: 'duenia' },
    });

    prisma.postulacion.findUnique.mockResolvedValue(fila(EstadoPostulacion.rechazada));
    await expect(servicio.resolver('duenia', 'p1', { accion: 'rechazar' })).rejects.toThrow('ya no está activa');

    prisma.postulacion.findUnique.mockResolvedValue(fila(EstadoPostulacion.enviada));
    await servicio.resolver('duenia', 'p1', { accion: 'rechazar' });

    prisma.postulacion.findUnique.mockResolvedValue(fila(EstadoPostulacion.preseleccionada));
    await servicio.resolver('duenia', 'p1', { accion: 'rechazar' });
    expect(prisma.animal.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { estado: EstadoAnimal.publicado } }),
    );

    prisma.postulacion.findUnique.mockResolvedValue(fila(EstadoPostulacion.enviada));
    await expect(servicio.resolver('duenia', 'p1', { accion: 'caer' })).rejects.toThrow('preselección');

    prisma.postulacion.findUnique.mockResolvedValue(
      fila(EstadoPostulacion.preseleccionada, EstadoAnimal.publicado),
    );
    await expect(servicio.resolver('duenia', 'p1', { accion: 'entregar' })).rejects.toThrow('no está reservado');

    prisma.postulacion.findUnique.mockResolvedValue(
      fila(EstadoPostulacion.preseleccionada, EstadoAnimal.reservado),
    );
    await servicio.resolver('duenia', 'p1', { accion: 'caer' });
    await servicio.resolver('duenia', 'p1', { accion: 'entregar' });
    expect(prisma.postulacion.updateMany).toHaveBeenCalled();

    prisma.postulacion.findUnique.mockResolvedValue(fila(EstadoPostulacion.enviada));
    await expect(servicio.resolver('duenia', 'p1', { accion: 'seguimiento' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      servicio.resolver('duenia', 'p1', { accion: 'seguimiento', seguimientoResultado: 'estable' }),
    ).rejects.toThrow('después de la entrega');

    prisma.postulacion.findUnique.mockResolvedValue(fila(EstadoPostulacion.entregada));
    await servicio.resolver('duenia', 'p1', { accion: 'seguimiento', seguimientoResultado: 'novedad' });
    expect(prisma.postulacion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ seguimientoResultado: 'novedad' }),
      }),
    );
  });

  it('deAnimal niega el tablero de otro refugio y mias lista las propias', async () => {
    const prisma = prismaBase();
    prisma.animal.findUnique.mockResolvedValue(null);
    const servicio = new PostulacionesService(prisma as never);
    await expect(servicio.deAnimal('duenia', 'an1')).rejects.toBeInstanceOf(ForbiddenException);

    await servicio.mias('ada');
    expect(prisma.postulacion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { adoptanteId: 'ada' } }),
    );
  });
});
