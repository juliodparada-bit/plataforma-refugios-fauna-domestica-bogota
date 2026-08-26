import {
  Energia,
  Especie,
  EstadoAnimal,
  EstadoItem,
  EstadoPostulacion,
  EstadoReserva,
  EstadoSolicitudVerificacion,
  EstadoVerificacionEntidad,
  Nivel,
  PrismaClient,
  Rol,
  Sexo,
  Talla,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { deflateSync } from 'zlib';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { calcularPuntaje } from '../src/dominio/puntaje';

const prisma = new PrismaClient();

const LOCALIDADES = [
  ['Usaquén', 'usaquen'],
  ['Chapinero', 'chapinero'],
  ['Santa Fe', 'santa_fe'],
  ['San Cristóbal', 'san_cristobal'],
  ['Usme', 'usme'],
  ['Tunjuelito', 'tunjuelito'],
  ['Bosa', 'bosa'],
  ['Kennedy', 'kennedy'],
  ['Fontibón', 'fontibon'],
  ['Engativá', 'engativa'],
  ['Suba', 'suba'],
  ['Barrios Unidos', 'barrios_unidos'],
  ['Teusaquillo', 'teusaquillo'],
  ['Los Mártires', 'los_martires'],
  ['Antonio Nariño', 'antonio_narino'],
  ['Puente Aranda', 'puente_aranda'],
  ['La Candelaria', 'la_candelaria'],
  ['Rafael Uribe Uribe', 'rafael_uribe'],
  ['Ciudad Bolívar', 'ciudad_bolivar'],
];

const CLAVE_EJEMPLO = 'EjemploLocal123';
const MARCA_EJEMPLO =
  'EJEMPLO (no es un caso real; solo sirve para demostrar el prototipo en local). ';

function crc32(buf: Buffer) {
  let c = 0xffffffff;
  for (const byte of buf) {
    c ^= byte;
    for (let i = 0; i < 8; i++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngCuadrado(r: number, g: number, b: number) {
  const ancho = 48;
  const alto = 36;
  const raw = Buffer.alloc((ancho * 3 + 1) * alto);
  for (let y = 0; y < alto; y++) {
    const fila = y * (ancho * 3 + 1);
    raw[fila] = 0;
    for (let x = 0; x < ancho; x++) {
      const i = fila + 1 + x * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const chunk = (tipo: string, data: Buffer) => {
    const tipoBuf = Buffer.from(tipo);
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([tipoBuf, data])), 0);
    return Buffer.concat([len, tipoBuf, data, crc]);
  };
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

async function usuarioEjemplo(datos: {
  correo: string;
  nombre: string;
  rol: Rol;
  localidadId: string;
  hash: string;
}) {
  return prisma.usuario.upsert({
    where: { correo: datos.correo },
    update: {
      nombre: datos.nombre,
      rol: datos.rol,
      localidadId: datos.localidadId,
      hashContrasena: datos.hash,
      consentimientoDatos: true,
    },
    create: {
      correo: datos.correo,
      nombre: datos.nombre,
      rol: datos.rol,
      localidadId: datos.localidadId,
      hashContrasena: datos.hash,
      consentimientoDatos: true,
      consentimientoEn: new Date(),
    },
  });
}

async function fotoAnimal(
  animalId: string,
  archivo: Buffer,
  nombre = 'portada.png',
  mime = 'image/png',
) {
  const carpeta = join(process.cwd(), 'uploads', 'animales', animalId);
  await mkdir(carpeta, { recursive: true });
  const destino = join(carpeta, nombre);
  await writeFile(destino, archivo);
  await prisma.animalFoto.create({
    data: {
      animalId,
      rutaArchivo: join('uploads', 'animales', animalId, nombre),
      esPortada: true,
      orden: 1,
      mime,
      pesoBytes: archivo.length,
    },
  });
}

async function main() {
  for (const [nombre, codigo] of LOCALIDADES) {
    await prisma.localidad.upsert({
      where: { codigo },
      update: { nombre },
      create: { nombre, codigo },
    });
  }

  const kennedy = await prisma.localidad.findUniqueOrThrow({
    where: { codigo: 'kennedy' },
  });
  const engativa = await prisma.localidad.findUniqueOrThrow({
    where: { codigo: 'engativa' },
  });

  const hashValidador = await bcrypt.hash(
    process.env.VALIDADOR_CLAVE_INICIAL ?? 'CambiaEsto123',
    12,
  );
  await prisma.usuario.upsert({
    where: { correo: 'validador@local.test' },
    update: {},
    create: {
      correo: 'validador@local.test',
      hashContrasena: hashValidador,
      nombre: 'Validador piloto',
      rol: Rol.validador,
      localidadId: kennedy.id,
      consentimientoDatos: true,
      consentimientoEn: new Date(),
    },
  });

  const hashEjemplo = await bcrypt.hash(CLAVE_EJEMPLO, 12);

  const usuarioEntidad = await usuarioEjemplo({
    correo: 'entidad.ejemplo@local.test',
    nombre: 'EJEMPLO — Entidad (no es un refugio real)',
    rol: Rol.entidad,
    localidadId: kennedy.id,
    hash: hashEjemplo,
  });

  const entidad = await prisma.entidad.upsert({
    where: { usuarioId: usuarioEntidad.id },
    update: {
      nombre: 'EJEMPLO — Hogar de paso Kennedy (no es un refugio real)',
      nivelSolicitado: Nivel.nivel_1,
      estadoVerificacion: EstadoVerificacionEntidad.nivel_1,
      localidadId: kennedy.id,
    },
    create: {
      usuarioId: usuarioEntidad.id,
      nombre: 'EJEMPLO — Hogar de paso Kennedy (no es un refugio real)',
      nivelSolicitado: Nivel.nivel_1,
      estadoVerificacion: EstadoVerificacionEntidad.nivel_1,
      localidadId: kennedy.id,
    },
  });

  const abierta = await prisma.verificacion.findFirst({
    where: { entidadId: entidad.id, estado: EstadoSolicitudVerificacion.en_revision },
  });
  if (!abierta) {
    const hayAprobada = await prisma.verificacion.findFirst({
      where: { entidadId: entidad.id, estado: EstadoSolicitudVerificacion.aprobada },
    });
    if (!hayAprobada) {
      await prisma.verificacion.create({
        data: {
          entidadId: entidad.id,
          tipoNivel: Nivel.nivel_1,
          estado: EstadoSolicitudVerificacion.aprobada,
          motivo: 'Semilla de ejemplo local. No es una verificación real.',
          resueltoEn: new Date(),
        },
      });
    }
  }

  const usuarioAdoptante = await usuarioEjemplo({
    correo: 'adoptante.ejemplo@local.test',
    nombre: 'EJEMPLO — Adoptante (no es una persona real)',
    rol: Rol.adoptante,
    localidadId: kennedy.id,
    hash: hashEjemplo,
  });

  await prisma.perfilAdoptante.upsert({
    where: { usuarioId: usuarioAdoptante.id },
    update: {
      tipoVivienda: 'casa_con_patio',
      horasCompania: 8,
      ninosEnHogar: false,
      otrosAnimales: 'ninguno',
      energiaSostenible: Energia.media,
    },
    create: {
      usuarioId: usuarioAdoptante.id,
      tipoVivienda: 'casa_con_patio',
      horasCompania: 8,
      ninosEnHogar: false,
      otrosAnimales: 'ninguno',
      energiaSostenible: Energia.media,
    },
  });

  await usuarioEjemplo({
    correo: 'donante.ejemplo@local.test',
    nombre: 'EJEMPLO — Donante de insumos (no es una persona real)',
    rol: Rol.donante,
    localidadId: engativa.id,
    hash: hashEjemplo,
  });

  const ejemplosPrevios = await prisma.animal.findMany({
    where: { entidadId: entidad.id, nombre: { contains: '(EJEMPLO)' } },
    select: { id: true },
  });
  const idsEjemplo = ejemplosPrevios.map((a) => a.id);
  if (idsEjemplo.length) {
    await prisma.postulacion.deleteMany({ where: { animalId: { in: idsEjemplo } } });
    await prisma.animalFoto.deleteMany({ where: { animalId: { in: idsEjemplo } } });
    await prisma.animal.deleteMany({ where: { id: { in: idsEjemplo } } });
  }
  const itemsPrevios = await prisma.itemDeseo.findMany({
    where: { entidadId: entidad.id, descripcion: { startsWith: 'EJEMPLO' } },
    select: { id: true },
  });
  const idsItems = itemsPrevios.map((i) => i.id);
  if (idsItems.length) {
    await prisma.reservaDeseo.deleteMany({ where: { itemDeseoId: { in: idsItems } } });
    await prisma.itemDeseo.deleteMany({ where: { id: { in: idsItems } } });
  }

  const perfil = await prisma.perfilAdoptante.findUniqueOrThrow({
    where: { usuarioId: usuarioAdoptante.id },
  });

  const fotoLuna = await readFile(join(process.cwd(), 'prisma', 'ejemplos', 'luna.png'));
  const fotoMote = await readFile(join(process.cwd(), 'prisma', 'ejemplos', 'mote.png'));

  const luna = await prisma.animal.create({
    data: {
      entidadId: entidad.id,
      nombre: 'Luna (EJEMPLO)',
      especie: Especie.canino,
      sexo: Sexo.hembra,
      talla: Talla.mediano,
      edadAprox: 'adulto',
      energia: Energia.media,
      historia:
        MARCA_EJEMPLO +
        'Llegó flaca del humedal. Convive con gatos si hay tiempo de presentación. Necesita medicación continua; el perfil no se oculta.',
      raza: null,
      necesidadEspecial: true,
      conviveNinos: true,
      conviveOtrosAnimales: true,
      esterilizado: true,
      estado: EstadoAnimal.publicado,
      localidadId: kennedy.id,
    },
  });
  await fotoAnimal(luna.id, fotoLuna, 'portada.png', 'image/png');

  const mote = await prisma.animal.create({
    data: {
      entidadId: entidad.id,
      nombre: 'Mote (EJEMPLO)',
      especie: Especie.felino,
      sexo: Sexo.macho,
      talla: Talla.pequeno,
      edadAprox: 'joven',
      energia: Energia.baja,
      historia:
        MARCA_EJEMPLO +
        'Duerme en la ventana y pide comida con un maullido corto. Buen candidato para apartamento tranquilo.',
      raza: null,
      necesidadEspecial: false,
      conviveNinos: false,
      conviveOtrosAnimales: true,
      esterilizado: true,
      estado: EstadoAnimal.publicado,
      localidadId: engativa.id,
    },
  });
  await fotoAnimal(mote.id, fotoMote, 'portada.png', 'image/png');

  const nube = await prisma.animal.create({
    data: {
      entidadId: entidad.id,
      nombre: 'Nube (EJEMPLO)',
      especie: Especie.canino,
      sexo: Sexo.macho,
      talla: Talla.grande,
      edadAprox: 'senior',
      energia: Energia.baja,
      historia:
        MARCA_EJEMPLO +
        'Ya fue entregado en el piloto de demostración. Sirve para ver un cupo liberado (animal.estado = adoptado).',
      raza: 'mestizo',
      necesidadEspecial: false,
      conviveNinos: true,
      conviveOtrosAnimales: true,
      esterilizado: true,
      estado: EstadoAnimal.adoptado,
      localidadId: kennedy.id,
    },
  });
  await fotoAnimal(nube.id, pngCuadrado(90, 110, 140));

  const puntajeLuna = calcularPuntaje(perfil, luna);
  await prisma.postulacion.create({
    data: {
      animalId: luna.id,
      adoptanteId: usuarioAdoptante.id,
      puntaje: puntajeLuna.puntaje,
      fraseExplicable: puntajeLuna.fraseExplicable,
      estado: EstadoPostulacion.enviada,
      requiereEvidenciaHogar: true,
    },
  });

  const puntajeNube = calcularPuntaje(perfil, nube);
  await prisma.postulacion.create({
    data: {
      animalId: nube.id,
      adoptanteId: usuarioAdoptante.id,
      puntaje: puntajeNube.puntaje,
      fraseExplicable: puntajeNube.fraseExplicable,
      estado: EstadoPostulacion.seguimiento,
      seguimientoResultado: 'estable',
      seguimientoEn: new Date(),
    },
  });

  const itemPendiente = await prisma.itemDeseo.create({
    data: {
      entidadId: entidad.id,
      categoria: 'alimento',
      descripcion: 'EJEMPLO — bulto de alimento para adultos 15 kg',
      cantidad: 2,
      unidad: 'bulto',
      prioridad: 'alta',
      estado: EstadoItem.pendiente,
    },
  });
  void itemPendiente;

  const itemCubierto = await prisma.itemDeseo.create({
    data: {
      entidadId: entidad.id,
      categoria: 'medicina',
      descripcion: 'EJEMPLO — pipetas antipulgas × 6',
      cantidad: 6,
      unidad: 'unidad',
      prioridad: 'media',
      estado: EstadoItem.cubierto,
    },
  });

  const donante = await prisma.usuario.findUniqueOrThrow({
    where: { correo: 'donante.ejemplo@local.test' },
  });
  const limite = new Date();
  limite.setDate(limite.getDate() - 2);
  const reserva = await prisma.reservaDeseo.create({
    data: {
      itemDeseoId: itemCubierto.id,
      donanteId: donante.id,
      estado: EstadoReserva.cubierto,
      contactoEntrega: 'EJEMPLO — contacto privado, no sale en bitácora',
      fechaLimite: limite,
    },
  });
  await prisma.evidenciaRecepcion.create({
    data: {
      reservaDeseoId: reserva.id,
      checkRecibido: true,
      rutaArchivo: null,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
