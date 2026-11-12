import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { writeFileSync } from 'fs';
import { join } from 'path';
import request from 'supertest';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { RolesGuard } from './auth/roles.guard';
import { SesionGuard } from './auth/sesion.guard';
import { SesionOpcionalGuard } from './auth/sesion-opcional.guard';
import { AnimalesController } from './animales/animales.controller';
import { AnimalesService } from './animales/animales.service';
import { DeseosController } from './deseos/deseos.controller';
import { DeseosService } from './deseos/deseos.service';
import { LocalidadesController } from './localidades/localidades.controller';
import { PerfilController } from './perfil/perfil.controller';
import { PerfilService } from './perfil/perfil.service';
import { PostulacionesController } from './postulaciones/postulaciones.controller';
import { PostulacionesService } from './postulaciones/postulaciones.service';
import { PrismaService } from './prisma/prisma.service';
import { VerificacionController } from './verificacion/verificacion.controller';
import { VerificacionService } from './verificacion/verificacion.service';

const archivo = join(process.cwd(), 'coverage-foto-prueba.txt');

describe('Rutas de los controladores', () => {
  let app: INestApplication;
  const sesion = (rol: string) => ({ sub: `${rol}-1`, rol });

  beforeAll(async () => {
    writeFileSync(archivo, 'foto');
    const jwt = {
      verifyAsync: jest.fn(async (token: string) => sesion(token)),
      signAsync: jest.fn().mockResolvedValue('jwt'),
    };
    const auth = {
      registrar: jest.fn().mockResolvedValue({ token: 'jwt', usuario: { id: 'u' } }),
      entrar: jest.fn().mockResolvedValue({ token: 'jwt', usuario: { id: 'u', rol: 'adoptante' } }),
      yo: jest.fn().mockResolvedValue({ id: 'u', rol: 'adoptante' }),
      actualizar: jest.fn().mockResolvedValue({ id: 'u' }),
      guardarFoto: jest.fn().mockResolvedValue({ id: 'u' }),
      rutaFoto: jest.fn().mockResolvedValue({ absoluta: archivo, mime: 'text/plain' }),
    };
    const animales = {
      catalogo: jest.fn().mockResolvedValue([]),
      mios: jest.fn().mockResolvedValue([]),
      detalle: jest.fn().mockResolvedValue({ id: 'an1' }),
      publicar: jest.fn().mockResolvedValue({ id: 'an1' }),
      rutaFoto: jest.fn().mockResolvedValue({ absoluta: archivo, mime: 'text/plain' }),
    };
    const deseos = {
      publicar: jest.fn().mockResolvedValue({ id: 'i1' }),
      mios: jest.fn().mockResolvedValue([]),
      listarPublicas: jest.fn().mockResolvedValue([]),
      perfilPublico: jest.fn().mockResolvedValue({ id: 'e1' }),
      reservar: jest.fn().mockResolvedValue({ id: 'r1' }),
      confirmar: jest.fn().mockResolvedValue({ ok: true }),
      rutaEvidencia: jest.fn().mockResolvedValue({ absoluta: archivo, mime: 'text/plain' }),
    };
    const perfil = {
      obtener: jest.fn().mockResolvedValue(null),
      guardar: jest.fn().mockResolvedValue({ horasCompania: 4 }),
    };
    const postulaciones = {
      crear: jest.fn().mockResolvedValue({ id: 'p1' }),
      mias: jest.fn().mockResolvedValue([]),
      deAnimal: jest.fn().mockResolvedValue({ postulaciones: [] }),
      resolver: jest.fn().mockResolvedValue({ id: 'p1' }),
    };
    const verificacion = {
      solicitar: jest.fn().mockResolvedValue({ id: 'v1' }),
      mia: jest.fn().mockResolvedValue({ solicitud: null }),
      cola: jest.fn().mockResolvedValue([]),
      detalle: jest.fn().mockResolvedValue({ id: 'v1' }),
      resolver: jest.fn().mockResolvedValue({ id: 'v1' }),
      rutaArchivo: jest.fn().mockResolvedValue({ absoluta: archivo, mime: 'text/plain', nombre: 'rut.pdf' }),
    };
    const prisma = { localidad: { findMany: jest.fn().mockResolvedValue([{ id: 'l', nombre: 'Bosa', codigo: '07' }]) } };

    const moduleRef = await Test.createTestingModule({
      controllers: [
        AuthController,
        AnimalesController,
        DeseosController,
        PerfilController,
        PostulacionesController,
        VerificacionController,
        LocalidadesController,
      ],
      providers: [
        Reflector,
        RolesGuard,
        SesionGuard,
        SesionOpcionalGuard,
        { provide: AuthService, useValue: auth },
        { provide: AnimalesService, useValue: animales },
        { provide: DeseosService, useValue: deseos },
        { provide: PerfilService, useValue: perfil },
        { provide: PostulacionesService, useValue: postulaciones },
        { provide: VerificacionService, useValue: verificacion },
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const bearer = (rol: string) => ({ Authorization: `Bearer ${rol}` });

  it('recorre el contrato que usa la web', async () => {
    const http = request(app.getHttpServer());

    expect((await http.get('/localidades')).status).toBe(200);
    expect((await http.post('/auth/registro').send({
      nombre: 'Ada López',
      correo: 'ada@mestizo.test',
      contrasena: 'Correcta123',
      localidadId: '11111111-1111-4111-8111-111111111111',
      rol: 'adoptante',
      consentimientoDatos: true,
    })).status).toBe(201);
    expect((await http.post('/auth/entrar').send({ correo: 'ada@mestizo.test', contrasena: 'Correcta123' })).status).toBe(201);
    expect((await http.post('/auth/salir')).body).toEqual({ ok: true });
    expect((await http.get('/auth/yo').set(bearer('adoptante'))).status).toBe(200);
    expect((await http.get('/auth/yo')).status).toBe(200);
    expect((await http.patch('/auth/yo').set(bearer('adoptante')).send({
      nombre: 'Ada',
      localidadId: '11111111-1111-4111-8111-111111111111',
    })).status).toBe(200);
    expect((await http.post('/auth/yo/foto').set(bearer('adoptante')).attach('foto', Buffer.from('a'), 'a.jpg')).status).toBe(201);
    expect((await http.get('/auth/yo/foto').set(bearer('adoptante'))).status).toBe(200);

    expect((await http.get('/animales/an1/fotos/f1')).status).toBe(200);
    expect((await http.get('/animales/an1').set(bearer('adoptante'))).status).toBe(200);
    expect((await http.post('/animales').set(bearer('entidad'))
      .field('nombre', 'Luna')
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
      .attach('foto', Buffer.from('a'), { filename: 'a.jpg', contentType: 'image/jpeg' })).status).toBe(201);

    expect((await http.get('/entidades')).status).toBe(200);
    expect((await http.get('/entidades/e1')).status).toBe(200);
    expect((await http.post('/deseos').set(bearer('entidad')).send({
      categoria: 'alimento',
      descripcion: 'Concentrado para adultos',
      cantidad: 1,
      unidad: 'bulto',
      prioridad: 'alta',
    })).status).toBe(201);
    expect((await http.get('/deseos/mios').set(bearer('entidad'))).status).toBe(200);
    expect((await http.post('/deseos/i1/reservar').set(bearer('donante')).send({ contactoEntrega: '3001234567' })).status).toBe(201);
    expect((await http.post('/reservas/r1/confirmar').set(bearer('entidad')).field('checkRecibido', 'true')).status).toBe(201);
    expect((await http.post('/reservas/r1/confirmar').set(bearer('entidad')).field('checkRecibido', 'on').attach('foto', Buffer.from('a'), { filename: 'e.jpg', contentType: 'image/jpeg' })).status).toBe(201);
    expect((await http.get('/reservas/r1/evidencia').set(bearer('entidad'))).status).toBe(200);

    expect((await http.get('/perfil').set(bearer('adoptante'))).status).toBe(200);
    expect((await http.put('/perfil').set(bearer('adoptante')).send({
      tipoVivienda: 'apartamento',
      horasCompania: 4,
      ninosEnHogar: false,
      otrosAnimales: 'ninguno',
      energiaSostenible: 'baja',
    })).status).toBe(200);

    expect((await http.post('/animales/an1/postulaciones').set(bearer('adoptante')).send({ mayorDeEdad: true, viveEnBogota: true })).status).toBe(201);
    expect((await http.get('/postulaciones/mias').set(bearer('adoptante'))).status).toBe(200);
    expect((await http.get('/animales/an1/postulaciones').set(bearer('entidad'))).status).toBe(200);
    expect((await http.post('/postulaciones/p1/resolver').set(bearer('entidad')).send({ accion: 'abrir' })).status).toBe(201);

    expect((await http.get('/verificaciones/mia').set(bearer('entidad'))).status).toBe(200);
    expect((await http.get('/verificaciones').set(bearer('validador'))).status).toBe(200);
    expect((await http.get('/verificaciones/v1').set(bearer('validador'))).status).toBe(200);
    expect((await http.post('/verificaciones/v1/resolver').set(bearer('validador')).send({ accion: 'aprobar' })).status).toBe(201);
    expect((await http.get('/verificaciones/v1/evidencias/ev1').set(bearer('validador'))).status).toBe(200);

    const grupos = await http
      .post('/verificaciones')
      .set(bearer('entidad'))
      .field('nombre', 'Hogar')
      .field('localidadId', '11111111-1111-4111-8111-111111111111')
      .field('tipoNivel', 'nivel_1')
      .attach('rut', Buffer.from(''), { filename: 'vacio.pdf', contentType: 'application/pdf' })
      .attach('camara_comercio', Buffer.from('pdf'), { filename: 'cc.pdf', contentType: 'application/pdf' });
    expect(grupos.status).toBe(201);
  });
});
