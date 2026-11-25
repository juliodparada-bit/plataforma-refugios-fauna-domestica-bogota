import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { RolesGuard } from '../auth/roles.guard';
import { SesionGuard } from '../auth/sesion.guard';
import { SesionOpcionalGuard } from '../auth/sesion-opcional.guard';
import { AnimalesController } from './animales.controller';
import { AnimalesService } from './animales.service';

/**
 * Doble: mock del servicio y stub del JWT.
 * La base no se abre. El contrato HTTP se verifica en el controlador real.
 */
describe('Contrato HTTP de animales y sesión', () => {
  let app: INestApplication;
  const animales = {
    catalogo: jest.fn().mockResolvedValue([]),
    mios: jest.fn().mockResolvedValue([{ id: 'an1', nombre: 'Luna', especie: 'felino' }]),
    detalle: jest.fn(async (id: string) => {
      if (id === 'no-esta') throw new NotFoundException('No encontré ese animal.');
      return { id, nombre: 'Luna', especie: 'felino', historia: 'Una historia larga de verdad.' };
    }),
    publicar: jest.fn().mockResolvedValue({ id: 'an1', nombre: 'Luna' }),
    rutaFoto: jest.fn(),
  };
  const auth = {
    entrar: jest.fn().mockResolvedValue({
      token: 'jwt',
      usuario: { id: 'u1', nombre: 'Ada', correo: 'ada@mestizo.test', rol: 'adoptante' },
    }),
    registrar: jest.fn(),
    yo: jest.fn(),
    actualizar: jest.fn(),
    guardarFoto: jest.fn(),
    rutaFoto: jest.fn(),
  };

  beforeAll(async () => {
    const jwt = {
      verifyAsync: jest.fn(async (token: string) => {
        if (token === 'entidad') return { sub: 'entidad-1', rol: 'entidad' };
        if (token === 'adoptante') return { sub: 'adoptante-1', rol: 'adoptante' };
        throw new Error('firma');
      }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AnimalesController, AuthController],
      providers: [
        Reflector,
        RolesGuard,
        SesionGuard,
        SesionOpcionalGuard,
        { provide: AnimalesService, useValue: animales },
        { provide: AuthService, useValue: auth },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /animales responde 200, JSON y el arreglo que consume el catálogo', async () => {
    const res = await request(app.getHttpServer()).get('/animales');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toEqual([]);
    expect(animales.catalogo).toHaveBeenCalled();
  });

  it('GET /animales/:id inexistente responde 404 en JSON, sin stack ni SQL', async () => {
    const res = await request(app.getHttpServer()).get('/animales/no-esta');

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(JSON.stringify(res.body)).not.toMatch(/SELECT|at\s+\//);
    expect(res.body.message).toMatch(/No encontré/);
  });

  it('GET /animales/mios sin sesión es 401, con adoptante es 403 y con entidad es 200', async () => {
    const sinSesion = await request(app.getHttpServer()).get('/animales/mios');
    expect(sinSesion.status).toBe(401);
    expect(sinSesion.headers['content-type']).toMatch(/application\/json/);

    const ajeno = await request(app.getHttpServer())
      .get('/animales/mios')
      .set('Authorization', 'Bearer adoptante');
    expect(ajeno.status).toBe(403);

    const propio = await request(app.getHttpServer())
      .get('/animales/mios')
      .set('Authorization', 'Bearer entidad');
    expect(propio.status).toBe(200);
    expect(propio.body[0].nombre).toBe('Luna');
    expect(animales.mios).toHaveBeenCalledWith('entidad-1');
  });

  it('POST /auth/entrar con JSON mal formado responde 400 JSON, no HTML', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/entrar')
      .set('Content-Type', 'application/json')
      .send('{"correo":');

    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.text).not.toMatch(/<html|SELECT/i);
  });

  it('POST /auth/entrar con correo inválido es 400 y no llama al servicio', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/entrar')
      .send({ correo: 'no-es-correo', contrasena: 'x' });

    expect(res.status).toBe(400);
    expect(auth.entrar).not.toHaveBeenCalled();
  });

  it('POST /animales rechaza un nombre de 81 caracteres antes de publicar', async () => {
    const res = await request(app.getHttpServer())
      .post('/animales')
      .set('Authorization', 'Bearer entidad')
      .field('nombre', 'N'.repeat(81))
      .field('especie', 'felino')
      .field('sexo', 'hembra')
      .field('talla', 'pequeno')
      .field('edadAprox', 'adulto')
      .field('localidadId', '11111111-1111-4111-8111-111111111111')
      .field('energia', 'baja')
      .field('historia', 'Historia con más de veinte caracteres.')
      .field('conviveNinos', 'true')
      .field('conviveOtrosAnimales', 'false')
      .field('necesidadEspecial', 'false')
      .attach('foto', Buffer.from('jpeg'), { filename: 'luna.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(animales.publicar).not.toHaveBeenCalled();
  });
});
