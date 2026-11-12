import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { EstadoSolicitudVerificacion, Nivel } from '@prisma/client';
import { VerificacionService, type ArchivoSubido } from './verificacion.service';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  rm: jest.fn().mockResolvedValue(undefined),
}));

function archivo(fieldname: string, mime = 'application/pdf'): ArchivoSubido {
  return {
    fieldname,
    originalname: `${fieldname}.pdf`,
    mimetype: mime,
    size: 1000,
    buffer: Buffer.from('pdf'),
  };
}

const n1 = [
  archivo('rut'),
  archivo('camara_comercio', 'image/png'),
  archivo('representacion_legal', 'image/jpeg'),
];

function prismaNuevo() {
  const prisma: Record<string, unknown> = {
    entidad: { findUnique: jest.fn(), update: jest.fn() },
    verificacion: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    evidenciaVerificacion: { create: jest.fn(), deleteMany: jest.fn(), findUnique: jest.fn() },
    localidad: { findUnique: jest.fn() },
  };
  prisma.$transaction = jest.fn(async (arg: unknown) => Promise.all(arg as Promise<unknown>[]));
  return prisma;
}

const entidad = {
  id: 'e1',
  usuarioId: 'duenia',
  nombre: 'Hogar Norte',
  localidadId: 'loc-1',
  nivelSolicitado: Nivel.nivel_2,
  estadoVerificacion: 'en_revision',
};

describe('VerificacionService.solicitar', () => {
  it('exige los tres documentos del nivel 1', async () => {
    const prisma = prismaNuevo();
    (prisma.entidad as { findUnique: jest.Mock }).findUnique.mockResolvedValue(entidad);
    const servicio = new VerificacionService(prisma as never);

    await expect(
      servicio.solicitar('duenia', { nombre: 'Hogar', localidadId: 'loc-1', tipoNivel: 'nivel_1' }, [
        archivo('rut'),
      ]),
    ).rejects.toThrow('Nivel 1 exige');
  });

  it('el nivel 2 exige IDPYBA o carta, y rechaza un tipo desconocido', async () => {
    const prisma = prismaNuevo();
    (prisma.entidad as { findUnique: jest.Mock }).findUnique.mockResolvedValue(entidad);
    const servicio = new VerificacionService(prisma as never);

    await expect(
      servicio.solicitar('duenia', { nombre: 'Hogar', localidadId: 'loc-1', tipoNivel: 'nivel_2' }, []),
    ).rejects.toThrow('Nivel 2');

    await expect(
      servicio.solicitar(
        'duenia',
        { nombre: 'Hogar', localidadId: 'loc-1', tipoNivel: 'nivel_2' },
        [archivo('evidencia_idpyba'), archivo('pasaporte')],
      ),
    ).rejects.toThrow('no válido');
  });

  it('no abre otra solicitud si ya hay una en revisión', async () => {
    const prisma = prismaNuevo();
    (prisma.entidad as { findUnique: jest.Mock }).findUnique.mockResolvedValue(entidad);
    (prisma.verificacion as { findFirst: jest.Mock }).findFirst.mockResolvedValueOnce({ id: 'abierta' });
    const servicio = new VerificacionService(prisma as never);

    await expect(
      servicio.solicitar('duenia', { nombre: 'Hogar Norte', localidadId: 'loc-1', tipoNivel: 'nivel_1' }, n1),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('crea la solicitud, guarda los archivos y devuelve el detalle', async () => {
    const prisma = prismaNuevo();
    (prisma.entidad as { findUnique: jest.Mock }).findUnique.mockResolvedValue(entidad);
    (prisma.verificacion as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);
    (prisma.localidad as { findUnique: jest.Mock }).findUnique.mockResolvedValue({ id: 'loc-1' });
    (prisma.verificacion as { create: jest.Mock }).create.mockResolvedValue({ id: 'v1' });
    (prisma.verificacion as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
      id: 'v1',
      tipoNivel: 'nivel_1',
      estado: 'en_revision',
      motivo: null,
      creadoEn: new Date('2026-03-01'),
      entidad: {
        id: 'e1',
        usuarioId: 'duenia',
        nombre: 'Hogar Norte',
        estadoVerificacion: 'en_revision',
        localidad: { nombre: 'Suba' },
      },
      evidencias: [],
    });
    const servicio = new VerificacionService(prisma as never);

    const detalle = await servicio.solicitar(
      'duenia',
      { nombre: '  Hogar Norte  ', localidadId: 'loc-1', tipoNivel: 'nivel_1' },
      n1,
    );

    expect(detalle.id).toBe('v1');
    expect((prisma.evidenciaVerificacion as { create: jest.Mock }).create).toHaveBeenCalledTimes(3);
    expect((prisma.entidad as { update: jest.Mock }).update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ nombre: 'Hogar Norte' }) }),
    );
  });

  it('un archivo de más de 5 MB no deja la solicitud creada', async () => {
    const prisma = prismaNuevo();
    (prisma.entidad as { findUnique: jest.Mock }).findUnique.mockResolvedValue(entidad);
    (prisma.verificacion as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);
    (prisma.localidad as { findUnique: jest.Mock }).findUnique.mockResolvedValue({ id: 'loc-1' });
    (prisma.verificacion as { create: jest.Mock }).create.mockResolvedValue({ id: 'v1' });
    const servicio = new VerificacionService(prisma as never);
    const pesado = n1.map((a, i) => (i === 0 ? { ...a, size: 5_242_881 } : a));

    await expect(
      servicio.solicitar('duenia', { nombre: 'Hogar', localidadId: 'loc-1', tipoNivel: 'nivel_1' }, pesado),
    ).rejects.toThrow('5 MB');
    expect((prisma.verificacion as { delete: jest.Mock }).delete).toHaveBeenCalledWith({ where: { id: 'v1' } });
  });
});

describe('VerificacionService.resolver y consulta', () => {
  it('rechazar sin motivo es 400 y una solicitud ya resuelta es conflicto', async () => {
    const prisma = prismaNuevo();
    (prisma.verificacion as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
      id: 'v1',
      entidadId: 'e1',
      tipoNivel: 'nivel_1',
      estado: EstadoSolicitudVerificacion.aprobada,
    });
    const servicio = new VerificacionService(prisma as never);

    await expect(servicio.resolver('v1', 'val', { accion: 'aprobar' })).rejects.toBeInstanceOf(
      ConflictException,
    );

    (prisma.verificacion as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
      id: 'v1',
      entidadId: 'e1',
      tipoNivel: 'nivel_1',
      estado: EstadoSolicitudVerificacion.en_revision,
    });
    await expect(servicio.resolver('v1', 'val', { accion: 'rechazar', motivo: '  ' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('aprobar deja el sello del nivel pedido y complemento no cambia el sello', async () => {
    const prisma = prismaNuevo();
    const fila = {
      id: 'v1',
      entidadId: 'e1',
      tipoNivel: 'nivel_2',
      estado: EstadoSolicitudVerificacion.en_revision,
      motivo: null,
      creadoEn: new Date(),
      entidad: {
        id: 'e1',
        usuarioId: 'duenia',
        nombre: 'Hogar',
        estadoVerificacion: 'en_revision',
        localidad: { nombre: 'Fontibón' },
        usuario: { id: 'duenia' },
      },
      evidencias: [],
    };
    (prisma.verificacion as { findUnique: jest.Mock }).findUnique
      .mockResolvedValueOnce({ ...fila, entidad: undefined })
      .mockResolvedValueOnce(fila);
    const servicio = new VerificacionService(prisma as never);

    await servicio.resolver('v1', 'val', { accion: 'aprobar', visitaNecesaria: true, motivo: 'ok' });
    expect((prisma.entidad as { update: jest.Mock }).update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { estadoVerificacion: 'nivel_2' } }),
    );

    (prisma.verificacion as { findUnique: jest.Mock }).findUnique
      .mockResolvedValueOnce({ ...fila, entidad: undefined })
      .mockResolvedValueOnce(fila);
    await servicio.resolver('v1', 'val', { accion: 'complemento', motivo: 'falta RUT' });
    expect((prisma.verificacion as { update: jest.Mock }).update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ estado: EstadoSolicitudVerificacion.complemento }),
      }),
    );
  });

  it('una entidad no ve la solicitud de otra, y un adoptante no descarga evidencias', async () => {
    const prisma = prismaNuevo();
    (prisma.verificacion as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
      id: 'v1',
      tipoNivel: 'nivel_1',
      estado: 'en_revision',
      motivo: null,
      creadoEn: new Date(),
      entidad: { id: 'e1', usuarioId: 'otra', nombre: 'Hogar', estadoVerificacion: 'en_revision', localidad: { nombre: 'Bosa' } },
      evidencias: [],
    });
    const servicio = new VerificacionService(prisma as never);

    await expect(servicio.detalle('v1', 'duenia', 'entidad')).rejects.toBeInstanceOf(ForbiddenException);

    (prisma.evidenciaVerificacion as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
      id: 'ev1',
      verificacionId: 'v1',
      rutaArchivo: 'uploads/verificaciones/v1/rut.pdf',
      mime: 'application/pdf',
      tipoDocumento: 'rut',
      verificacion: { entidad: { usuarioId: 'duenia' } },
    });
    await expect(servicio.rutaArchivo('v1', 'ev1', 'ada', 'adoptante')).rejects.toThrow(
      'No puedes ver evidencias',
    );
  });

  it('mia dice si el sello ya permite publicar', async () => {
    const prisma = prismaNuevo();
    (prisma.entidad as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
      ...entidad,
      estadoVerificacion: 'nivel_1',
    });
    (prisma.verificacion as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);
    const servicio = new VerificacionService(prisma as never);

    const mia = await servicio.mia('duenia');

    expect(mia.entidad.puedePublicar).toBe(true);
    expect(mia.solicitud).toBeNull();
  });
});
