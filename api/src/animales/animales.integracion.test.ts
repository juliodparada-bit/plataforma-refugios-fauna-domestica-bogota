import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

/**
 * Integración contra PostgreSQL real. Se salta si no hay DATABASE_URL,
 * para que el CI de las semanas 2 a 6 siga en verde sin la base (la base
 * entra al workflow en la semana 8). La conexión no está escrita aquí.
 */
const databaseUrl = process.env.DATABASE_URL;
const describir = databaseUrl ? describe : describe.skip;

describir('Animal contra PostgreSQL de pruebas', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    execSync('npx prisma migrate deploy', {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'pipe',
    });
    prisma = new PrismaClient();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        evidencia_recepcion,
        reserva_deseo,
        item_deseo,
        postulacion,
        animal_foto,
        animal,
        evidencia_verificacion,
        verificacion,
        perfil_adoptante,
        entidad,
        usuario,
        localidad
      RESTART IDENTITY CASCADE
    `);
  });

  afterAll(async () => {
    await prisma?.$disconnect();
  });

  async function semilla() {
    const localidad = await prisma.localidad.create({
      data: { nombre: 'Chapinero', codigo: '02' },
    });
    const usuario = await prisma.usuario.create({
      data: {
        correo: 'hogar@local.test',
        hashContrasena: 'hash',
        nombre: 'Hogar Norte',
        rol: 'entidad',
        localidadId: localidad.id,
        consentimientoDatos: true,
        consentimientoEn: new Date(),
      },
    });
    const entidad = await prisma.entidad.create({
      data: {
        usuarioId: usuario.id,
        nombre: 'Hogar Norte',
        nivelSolicitado: 'nivel_2',
        estadoVerificacion: 'nivel_1',
        localidadId: localidad.id,
      },
    });
    return { localidad, entidad };
  }

  function animal(entidadId: string, localidadId: string, nombre: string, especie: 'canino' | 'felino', creadoEn: Date) {
    return prisma.animal.create({
      data: {
        entidadId,
        localidadId,
        nombre,
        especie,
        sexo: 'hembra',
        talla: 'mediano',
        edadAprox: 'adulto',
        energia: 'media',
        historia: 'Historia de integración con más de veinte caracteres.',
        conviveNinos: true,
        conviveOtrosAnimales: true,
        estado: 'publicado',
        creadoEn,
      },
    });
  }

  it('lista solo la especie pedida y en el orden creadoEn descendente', async () => {
    const { localidad, entidad } = await semilla();
    await animal(entidad.id, localidad.id, 'Antes', 'canino', new Date('2026-01-01T00:00:00.000Z'));
    await animal(entidad.id, localidad.id, 'Después', 'canino', new Date('2026-06-01T00:00:00.000Z'));
    await animal(entidad.id, localidad.id, 'Gato', 'felino', new Date('2026-08-01T00:00:00.000Z'));

    const caninos = await prisma.animal.findMany({
      where: { especie: 'canino' },
      orderBy: { creadoEn: 'desc' },
    });

    expect(caninos.map((a) => a.nombre)).toEqual(['Después', 'Antes']);
  });

  it('el correo de usuario es único en la tabla', async () => {
    const { localidad } = await semilla();

    await expect(
      prisma.usuario.create({
        data: {
          correo: 'hogar@local.test',
          hashContrasena: 'otro',
          nombre: 'Otra',
          rol: 'adoptante',
          localidadId: localidad.id,
          consentimientoDatos: true,
          consentimientoEn: new Date(),
        },
      }),
    ).rejects.toThrow();
  });

  it('un nombre de 81 caracteres lo rechaza PostgreSQL (varchar 80); uno de 80 queda guardado', async () => {
    const { localidad, entidad } = await semilla();

    await expect(
      animal(entidad.id, localidad.id, 'N'.repeat(81), 'felino', new Date()),
    ).rejects.toThrow();

    const guardado = await animal(entidad.id, localidad.id, 'N'.repeat(80), 'felino', new Date());
    const leido = await prisma.animal.findUniqueOrThrow({ where: { id: guardado.id } });
    expect(leido.nombre).toHaveLength(80);
  });
});
