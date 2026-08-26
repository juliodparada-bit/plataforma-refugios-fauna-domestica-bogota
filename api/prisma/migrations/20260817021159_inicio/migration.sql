-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('adoptante', 'donante', 'entidad', 'validador');

-- CreateEnum
CREATE TYPE "Nivel" AS ENUM ('nivel_1', 'nivel_2');

-- CreateEnum
CREATE TYPE "EstadoVerificacionEntidad" AS ENUM ('en_revision', 'nivel_1', 'nivel_2', 'rechazada');

-- CreateEnum
CREATE TYPE "EstadoSolicitudVerificacion" AS ENUM ('en_revision', 'aprobada', 'rechazada', 'complemento');

-- CreateEnum
CREATE TYPE "Especie" AS ENUM ('canino', 'felino');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('macho', 'hembra');

-- CreateEnum
CREATE TYPE "Talla" AS ENUM ('pequeno', 'mediano', 'grande');

-- CreateEnum
CREATE TYPE "Energia" AS ENUM ('baja', 'media', 'alta');

-- CreateEnum
CREATE TYPE "EstadoAnimal" AS ENUM ('borrador', 'publicado', 'reservado', 'adoptado', 'archivado');

-- CreateEnum
CREATE TYPE "EstadoPostulacion" AS ENUM ('enviada', 'en_revision', 'preseleccionada', 'rechazada', 'entregada', 'seguimiento');

-- CreateEnum
CREATE TYPE "CategoriaDeseo" AS ENUM ('alimento', 'medicina', 'aseo');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('baja', 'media', 'alta');

-- CreateEnum
CREATE TYPE "EstadoItem" AS ENUM ('pendiente', 'reservado', 'cubierto');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('reservado', 'cubierto', 'vencido');

-- CreateEnum
CREATE TYPE "TipoVivienda" AS ENUM ('apartamento', 'casa', 'casa_con_patio', 'otro');

-- CreateEnum
CREATE TYPE "OtrosAnimales" AS ENUM ('ninguno', 'perro', 'gato', 'ambos', 'otros');

-- CreateTable
CREATE TABLE "localidad" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,

    CONSTRAINT "localidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL,
    "correo" VARCHAR(254) NOT NULL,
    "hash_contrasena" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "rol" "Rol" NOT NULL,
    "localidad_id" UUID NOT NULL,
    "consentimiento_datos" BOOLEAN NOT NULL,
    "consentimiento_en" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entidad" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "nombre" VARCHAR(160) NOT NULL,
    "nivel_solicitado" "Nivel" NOT NULL,
    "estado_verificacion" "EstadoVerificacionEntidad" NOT NULL,
    "localidad_id" UUID NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificacion" (
    "id" UUID NOT NULL,
    "entidad_id" UUID NOT NULL,
    "tipo_nivel" "Nivel" NOT NULL,
    "estado" "EstadoSolicitudVerificacion" NOT NULL,
    "motivo" TEXT,
    "validador_id" UUID,
    "resuelto_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencia_verificacion" (
    "id" UUID NOT NULL,
    "verificacion_id" UUID NOT NULL,
    "tipo_documento" VARCHAR(40) NOT NULL,
    "ruta_archivo" VARCHAR(500) NOT NULL,
    "mime" VARCHAR(80) NOT NULL,
    "peso_bytes" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencia_verificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfil_adoptante" (
    "usuario_id" UUID NOT NULL,
    "tipo_vivienda" "TipoVivienda" NOT NULL,
    "horas_compania" SMALLINT NOT NULL,
    "ninos_en_hogar" BOOLEAN NOT NULL,
    "otros_animales" "OtrosAnimales" NOT NULL,
    "energia_sostenible" "Energia" NOT NULL,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfil_adoptante_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "animal" (
    "id" UUID NOT NULL,
    "entidad_id" UUID NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "especie" "Especie" NOT NULL,
    "sexo" "Sexo" NOT NULL,
    "talla" "Talla" NOT NULL,
    "edad_aprox" VARCHAR(20) NOT NULL,
    "energia" "Energia" NOT NULL,
    "historia" TEXT NOT NULL,
    "raza" VARCHAR(80),
    "necesidad_especial" BOOLEAN NOT NULL DEFAULT false,
    "convive_ninos" BOOLEAN NOT NULL,
    "convive_otros_animales" BOOLEAN NOT NULL,
    "esterilizado" BOOLEAN,
    "estado" "EstadoAnimal" NOT NULL,
    "localidad_id" UUID NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animal_foto" (
    "id" UUID NOT NULL,
    "animal_id" UUID NOT NULL,
    "ruta_archivo" VARCHAR(500) NOT NULL,
    "es_portada" BOOLEAN NOT NULL,
    "orden" SMALLINT NOT NULL,
    "mime" VARCHAR(80) NOT NULL,
    "peso_bytes" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animal_foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postulacion" (
    "id" UUID NOT NULL,
    "animal_id" UUID NOT NULL,
    "adoptante_id" UUID NOT NULL,
    "puntaje" SMALLINT NOT NULL,
    "frase_explicable" VARCHAR(280) NOT NULL,
    "estado" "EstadoPostulacion" NOT NULL,
    "requiere_evidencia_hogar" BOOLEAN NOT NULL DEFAULT false,
    "seguimiento_resultado" VARCHAR(20),
    "seguimiento_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postulacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_deseo" (
    "id" UUID NOT NULL,
    "entidad_id" UUID NOT NULL,
    "categoria" "CategoriaDeseo" NOT NULL,
    "descripcion" VARCHAR(200) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "unidad" VARCHAR(30) NOT NULL,
    "prioridad" "Prioridad" NOT NULL,
    "estado" "EstadoItem" NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_deseo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva_deseo" (
    "id" UUID NOT NULL,
    "item_deseo_id" UUID NOT NULL,
    "donante_id" UUID NOT NULL,
    "estado" "EstadoReserva" NOT NULL,
    "contacto_entrega" VARCHAR(120) NOT NULL,
    "fecha_limite" DATE NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reserva_deseo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencia_recepcion" (
    "id" UUID NOT NULL,
    "reserva_deseo_id" UUID NOT NULL,
    "ruta_archivo" VARCHAR(500),
    "check_recibido" BOOLEAN NOT NULL,
    "mime" VARCHAR(80),
    "peso_bytes" INTEGER,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencia_recepcion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "localidad_nombre_key" ON "localidad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "localidad_codigo_key" ON "localidad"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "entidad_usuario_id_key" ON "entidad"("usuario_id");

-- CreateIndex
CREATE INDEX "verificacion_estado_idx" ON "verificacion"("estado");

-- CreateIndex
CREATE INDEX "animal_estado_especie_localidad_id_idx" ON "animal"("estado", "especie", "localidad_id");

-- CreateIndex
CREATE INDEX "animal_entidad_id_idx" ON "animal"("entidad_id");

-- CreateIndex
CREATE INDEX "postulacion_animal_id_estado_idx" ON "postulacion"("animal_id", "estado");

-- CreateIndex
CREATE INDEX "postulacion_adoptante_id_idx" ON "postulacion"("adoptante_id");

-- CreateIndex
CREATE INDEX "item_deseo_entidad_id_estado_idx" ON "item_deseo"("entidad_id", "estado");

-- CreateIndex
CREATE INDEX "reserva_deseo_item_deseo_id_estado_idx" ON "reserva_deseo"("item_deseo_id", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "evidencia_recepcion_reserva_deseo_id_key" ON "evidencia_recepcion"("reserva_deseo_id");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_localidad_id_fkey" FOREIGN KEY ("localidad_id") REFERENCES "localidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entidad" ADD CONSTRAINT "entidad_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entidad" ADD CONSTRAINT "entidad_localidad_id_fkey" FOREIGN KEY ("localidad_id") REFERENCES "localidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verificacion" ADD CONSTRAINT "verificacion_entidad_id_fkey" FOREIGN KEY ("entidad_id") REFERENCES "entidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verificacion" ADD CONSTRAINT "verificacion_validador_id_fkey" FOREIGN KEY ("validador_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencia_verificacion" ADD CONSTRAINT "evidencia_verificacion_verificacion_id_fkey" FOREIGN KEY ("verificacion_id") REFERENCES "verificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_adoptante" ADD CONSTRAINT "perfil_adoptante_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_entidad_id_fkey" FOREIGN KEY ("entidad_id") REFERENCES "entidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_localidad_id_fkey" FOREIGN KEY ("localidad_id") REFERENCES "localidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_foto" ADD CONSTRAINT "animal_foto_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulacion" ADD CONSTRAINT "postulacion_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulacion" ADD CONSTRAINT "postulacion_adoptante_id_fkey" FOREIGN KEY ("adoptante_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_deseo" ADD CONSTRAINT "item_deseo_entidad_id_fkey" FOREIGN KEY ("entidad_id") REFERENCES "entidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_deseo" ADD CONSTRAINT "reserva_deseo_item_deseo_id_fkey" FOREIGN KEY ("item_deseo_id") REFERENCES "item_deseo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_deseo" ADD CONSTRAINT "reserva_deseo_donante_id_fkey" FOREIGN KEY ("donante_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencia_recepcion" ADD CONSTRAINT "evidencia_recepcion_reserva_deseo_id_fkey" FOREIGN KEY ("reserva_deseo_id") REFERENCES "reserva_deseo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
