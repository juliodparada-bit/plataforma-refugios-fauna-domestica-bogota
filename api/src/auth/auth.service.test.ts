import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Rol } from '@prisma/client';
import { AuthService } from './auth.service';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hash-nuevo'),
  compare: jest.fn(async (plain: string, hash: string) => plain === 'Correcta123' && hash === 'hash-guardado'),
}));

const usuarioCargado = {
  id: 'u-nuevo',
  nombre: 'Ada López',
  correo: 'ada@mestizo.test',
  rol: Rol.adoptante,
  fotoPerfilRuta: null,
  consentimientoEn: new Date('2026-01-01T00:00:00.000Z'),
  actualizadoEn: new Date('2026-01-02T00:00:00.000Z'),
  localidad: { id: 'loc-ok', nombre: 'Chapinero' },
  entidad: null,
  perfilAdoptante: null,
};

function prismaBase() {
  return {
    localidad: { findUnique: jest.fn() },
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    entidad: { create: jest.fn(), update: jest.fn() },
    $transaction: jest.fn(async (fn: (tx: unknown) => unknown) => fn(prisma)),
  };
}

let prisma: ReturnType<typeof prismaBase>;

function servicio() {
  const jwt = { signAsync: jest.fn().mockResolvedValue('jwt-prueba') } as unknown as JwtService;
  return new AuthService(prisma as never, jwt);
}

beforeEach(() => {
  prisma = prismaBase();
  prisma.$transaction.mockImplementation(async (fn: (tx: unknown) => unknown) => fn(prisma));
});

describe('AuthService.registrar', () => {
  const dto = {
    nombre: '  Ada López  ',
    correo: ' Ada@Mestizo.test ',
    contrasena: 'Correcta123',
    localidadId: 'loc-ok',
    rol: Rol.adoptante,
    consentimientoDatos: true,
  };

  it('exige el consentimiento antes de tocar la base', async () => {
    await expect(
      servicio().registrar({ ...dto, consentimientoDatos: false }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.usuario.create).not.toHaveBeenCalled();
  });

  it('rechaza una localidad que no existe', async () => {
    prisma.localidad.findUnique.mockResolvedValue(null);

    await expect(servicio().registrar(dto)).rejects.toThrow('La localidad no es válida.');
    expect(prisma.usuario.create).not.toHaveBeenCalled();
  });

  it('responde conflicto si el correo ya está registrado, comparando en minúsculas', async () => {
    prisma.localidad.findUnique.mockResolvedValue({ id: 'loc-ok' });
    prisma.usuario.findUnique.mockResolvedValue({ id: 'viejo' });

    await expect(servicio().registrar(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { correo: 'ada@mestizo.test' },
    });
    expect(prisma.usuario.create).not.toHaveBeenCalled();
  });

  it('crea la cuenta adoptante y devuelve sesión', async () => {
    prisma.localidad.findUnique.mockResolvedValue({ id: 'loc-ok' });
    prisma.usuario.findUnique.mockImplementation(async ({ where }: { where: { correo?: string; id?: string } }) => {
      if (where.id === 'u-nuevo') return usuarioCargado;
      return null;
    });
    prisma.usuario.create.mockResolvedValue({ id: 'u-nuevo', rol: Rol.adoptante });

    const sesion = await servicio().registrar(dto);

    expect(prisma.usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ correo: 'ada@mestizo.test', nombre: 'Ada López' }),
      }),
    );
    expect(prisma.entidad.create).not.toHaveBeenCalled();
    expect(sesion.token).toBe('jwt-prueba');
    expect(sesion.usuario.correo).toBe('ada@mestizo.test');
  });

  it('además abre la entidad en revisión cuando el rol es entidad', async () => {
    prisma.localidad.findUnique.mockResolvedValue({ id: 'loc-ok' });
    prisma.usuario.findUnique.mockImplementation(async ({ where }: { where: { id?: string } }) => {
      if (where.id === 'u-nuevo') {
        return {
          ...usuarioCargado,
          rol: Rol.entidad,
          entidad: { id: 'e1', estadoVerificacion: 'en_revision', nombre: 'Ada López' },
        };
      }
      return null;
    });
    prisma.usuario.create.mockResolvedValue({ id: 'u-nuevo', rol: Rol.entidad });

    await servicio().registrar({ ...dto, rol: Rol.entidad });

    expect(prisma.entidad.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ estadoVerificacion: 'en_revision', nivelSolicitado: 'nivel_2' }),
      }),
    );
  });
});

describe('AuthService.entrar', () => {
  it('no revela si el correo existe: el mensaje es el mismo', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    await expect(
      servicio().entrar({ correo: 'nadie@mestizo.test', contrasena: 'x' }),
    ).rejects.toThrow('Correo o contraseña incorrectos.');
  });

  it('rechaza la contraseña incorrecta con el mismo mensaje', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 'u1',
      rol: Rol.adoptante,
      hashContrasena: 'hash-guardado',
    });

    await expect(
      servicio().entrar({ correo: 'ada@mestizo.test', contrasena: 'mala' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('abre sesión cuando la contraseña coincide', async () => {
    prisma.usuario.findUnique.mockImplementation(async ({ where }: { where: { correo?: string; id?: string } }) => {
      if (where.correo) {
        return { id: 'u-nuevo', rol: Rol.adoptante, hashContrasena: 'hash-guardado' };
      }
      return usuarioCargado;
    });

    const sesion = await servicio().entrar({ correo: 'ADA@mestizo.test', contrasena: 'Correcta123' });

    expect(sesion.usuario.id).toBe('u-nuevo');
  });
});

describe('AuthService.guardarFoto', () => {
  it('exige un archivo', async () => {
    await expect(servicio().guardarFoto('u1', undefined)).rejects.toThrow('Adjunta una foto');
  });

  it('el límite es 5 MB: 5242880 entra a la validación de tipo y 5242881 no', async () => {
    const grande = {
      originalname: 'a.jpg',
      mimetype: 'image/jpeg',
      size: 5_242_881,
      buffer: Buffer.from('x'),
    };
    await expect(servicio().guardarFoto('u1', grande)).rejects.toThrow('5 MB');

    const justo = { ...grande, size: 5_242_880, mimetype: 'image/gif' };
    await expect(servicio().guardarFoto('u1', justo)).rejects.toThrow('JPEG, PNG o WebP');
  });
});
