import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { EstadoItem, EstadoReserva } from '@prisma/client';
import { DeseosService } from './deseos.service';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

function prismaNuevo() {
  const prisma: Record<string, unknown> = {
    entidad: { findUnique: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
    itemDeseo: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    usuario: { findUnique: jest.fn() },
    reservaDeseo: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    evidenciaRecepcion: { create: jest.fn() },
    animal: { findMany: jest.fn().mockResolvedValue([]) },
  };
  prisma.$transaction = jest.fn(async (arg: unknown) => {
    if (typeof arg === 'function') return (arg as (tx: unknown) => unknown)(prisma);
    return Promise.all(arg as Promise<unknown>[]);
  });
  return prisma;
}

const entidadOk = { id: 'e1', estadoVerificacion: 'nivel_1', usuarioId: 'duenia' };

describe('DeseosService', () => {
  it('publicar no crea el ítem si la entidad no tiene sello', async () => {
    const prisma = prismaNuevo();
    (prisma.entidad as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
      id: 'e1',
      estadoVerificacion: 'en_revision',
    });
    const servicio = new DeseosService(prisma as never);

    await expect(
      servicio.publicar('u1', {
        categoria: 'alimento',
        descripcion: ' Concentrado ',
        cantidad: 2,
        unidad: ' bultos ',
        prioridad: 'alta',
      }),
    ).rejects.toThrow('falta la verificación');
    expect((prisma.itemDeseo as { create: jest.Mock }).create).not.toHaveBeenCalled();
  });

  it('publicar guarda el ítem pendiente con textos recortados', async () => {
    const prisma = prismaNuevo();
    (prisma.entidad as { findUnique: jest.Mock }).findUnique.mockResolvedValue(entidadOk);
    (prisma.itemDeseo as { create: jest.Mock }).create.mockResolvedValue({ id: 'i1' });
    const servicio = new DeseosService(prisma as never);

    await servicio.publicar('u1', {
      categoria: 'alimento',
      descripcion: ' Concentrado ',
      cantidad: 2,
      unidad: ' bultos ',
      prioridad: 'alta',
    });

    expect((prisma.itemDeseo as { create: jest.Mock }).create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          descripcion: 'Concentrado',
          unidad: 'bultos',
          estado: EstadoItem.pendiente,
        }),
      }),
    );
  });

  it('listarPublicas ordena por pendientes y pone la prioridad alta primero', async () => {
    const prisma = prismaNuevo();
    (prisma.entidad as { findMany: jest.Mock }).findMany.mockResolvedValue([
      {
        id: 'poca',
        nombre: 'Beta',
        estadoVerificacion: 'nivel_1',
        localidad: { nombre: 'Usaquén' },
        itemsDeseo: [{ id: 'a', prioridad: 'baja', categoria: 'aseo', descripcion: 'jabón', cantidad: 1, unidad: 'und' }],
        _count: { itemsDeseo: 1 },
      },
      {
        id: 'mucha',
        nombre: 'Alfa',
        estadoVerificacion: 'nivel_2',
        localidad: { nombre: 'Kennedy' },
        itemsDeseo: [
          { id: 'b', prioridad: 'baja', categoria: 'alimento', descripcion: 'arroz', cantidad: 1, unidad: 'kg' },
          { id: 'c', prioridad: 'alta', categoria: 'medicina', descripcion: 'pipeta', cantidad: 1, unidad: 'und' },
        ],
        _count: { itemsDeseo: 4 },
      },
    ]);
    const servicio = new DeseosService(prisma as never);

    const lista = await servicio.listarPublicas();

    expect(lista.map((e) => e.id)).toEqual(['mucha', 'poca']);
    expect(lista[0].necesidades.map((n) => n.prioridad)).toEqual(['alta', 'baja']);
  });

  it('publicos responde 404 si la entidad no existe', async () => {
    const prisma = prismaNuevo();
    (prisma.entidad as { findUnique: jest.Mock }).findUnique.mockResolvedValue(null);
    const servicio = new DeseosService(prisma as never);

    await expect(servicio.publicos('no')).rejects.toThrow('No encontré esa entidad.');
  });

  it('reservar solo lo hace un donante y solo sobre un ítem pendiente', async () => {
    const prisma = prismaNuevo();
    (prisma.usuario as { findUnique: jest.Mock }).findUnique.mockResolvedValue({ rol: 'adoptante' });
    const servicio = new DeseosService(prisma as never);

    await expect(servicio.reservar('u1', 'i1', ' 3001234567 ')).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    (prisma.usuario as { findUnique: jest.Mock }).findUnique.mockResolvedValue({ rol: 'donante' });
    (prisma.itemDeseo as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
      id: 'i1',
      estado: EstadoItem.cubierto,
    });
    await expect(servicio.reservar('u1', 'i1', '3001234567')).rejects.toBeInstanceOf(ConflictException);
    expect((prisma.reservaDeseo as { create: jest.Mock }).create).not.toHaveBeenCalled();
  });

  it('reservar crea la reserva y marca el ítem, y caduca las vencidas antes', async () => {
    const prisma = prismaNuevo();
    (prisma.usuario as { findUnique: jest.Mock }).findUnique.mockResolvedValue({ rol: 'donante' });
    (prisma.itemDeseo as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
      id: 'i1',
      estado: EstadoItem.pendiente,
    });
    (prisma.reservaDeseo as { findMany: jest.Mock }).findMany.mockResolvedValue([
      { id: 'vieja', itemDeseoId: 'i9' },
    ]);
    (prisma.reservaDeseo as { create: jest.Mock }).create.mockResolvedValue({ id: 'r1' });
    const servicio = new DeseosService(prisma as never);

    const reserva = await servicio.reservar('donante-1', 'i1', '  calle 1  ');

    expect(reserva).toEqual({ id: 'r1' });
    expect((prisma.reservaDeseo as { update: jest.Mock }).update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { estado: EstadoReserva.vencido } }),
    );
    expect((prisma.reservaDeseo as { create: jest.Mock }).create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ contactoEntrega: 'calle 1', donanteId: 'donante-1' }),
      }),
    );
  });

  it('confirmar exige foto o check, y la foto inválida no cierra la reserva', async () => {
    const prisma = prismaNuevo();
    const servicio = new DeseosService(prisma as never);

    await expect(servicio.confirmar('duenia', 'r1', false)).rejects.toBeInstanceOf(BadRequestException);

    (prisma.reservaDeseo as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
      id: 'r1',
      estado: EstadoReserva.reservado,
      itemDeseoId: 'i1',
      item: { entidad: { usuarioId: 'duenia' } },
    });
    await expect(
      servicio.confirmar('duenia', 'r1', false, {
        mimetype: 'image/gif',
        size: 10,
        buffer: Buffer.from('x'),
      }),
    ).rejects.toThrow('5 MB');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('confirmar con check cierra reserva e ítem', async () => {
    const prisma = prismaNuevo();
    (prisma.reservaDeseo as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
      id: 'r1',
      estado: EstadoReserva.reservado,
      itemDeseoId: 'i1',
      item: { entidad: { usuarioId: 'duenia' } },
    });
    const servicio = new DeseosService(prisma as never);

    await expect(servicio.confirmar('duenia', 'r1', true)).resolves.toEqual({ ok: true });
    expect((prisma.itemDeseo as { update: jest.Mock }).update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { estado: EstadoItem.cubierto } }),
    );
  });

  it('perfilPublico arma bitácora, deseos y animales', async () => {
    const prisma = prismaNuevo();
    (prisma.entidad as { findUnique: jest.Mock }).findUnique.mockImplementation(async ({ where }: { where: { id: string } }) => {
      if (where.id === 'e1') {
        return {
          id: 'e1',
          nombre: 'Hogar',
          estadoVerificacion: 'nivel_1',
          localidad: { nombre: 'Bosa' },
          usuario: { correo: 'hogar@local.test' },
        };
      }
      return null;
    });
    (prisma.itemDeseo as { findMany: jest.Mock }).findMany.mockResolvedValue([
      {
        categoria: 'alimento',
        descripcion: 'arroz',
        cantidad: 1,
        unidad: 'kg',
        prioridad: 'alta',
        estado: EstadoItem.cubierto,
        actualizadoEn: new Date('2026-02-01'),
        reservas: [{ evidencia: { creadoEn: new Date('2026-02-02') } }],
      },
    ]);
    (prisma.animal as { findMany: jest.Mock }).findMany.mockResolvedValue([
      {
        id: 'an1',
        nombre: 'Luna',
        especie: 'felino',
        historia: 'x'.repeat(120),
        necesidadEspecial: false,
        localidad: { nombre: 'Bosa' },
        fotos: [],
      },
    ]);
    const servicio = new DeseosService(prisma as never);

    const perfil = await servicio.perfilPublico('e1');

    expect(perfil.demo).toBe(true);
    expect(perfil.animales[0].fotoUrl).toBeNull();
    expect(perfil.animales[0].historia).toHaveLength(90);
    expect(perfil.bitacora[0].cubiertoEn).toEqual(new Date('2026-02-02'));
  });

  it('rutaEvidencia rechaza una ruta que se sale de la carpeta de recepciones', async () => {
    const prisma = prismaNuevo();
    (prisma.reservaDeseo as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
      evidencia: { rutaArchivo: '../../etc/passwd', mime: 'image/jpeg' },
      item: { entidad: { usuarioId: 'duenia' } },
    });
    const servicio = new DeseosService(prisma as never);

    await expect(servicio.rutaEvidencia('r1', 'duenia')).rejects.toThrow('no válida');
  });
});
