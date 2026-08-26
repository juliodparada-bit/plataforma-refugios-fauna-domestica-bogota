import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LocalidadesModule } from './localidades/localidades.module';
import { PrismaModule } from './prisma/prisma.module';
import { VerificacionModule } from './verificacion/verificacion.module';
import { AnimalesModule } from './animales/animales.module';
import { PerfilModule } from './perfil/perfil.module';
import { PostulacionesModule } from './postulaciones/postulaciones.module';
import { DeseosModule } from './deseos/deseos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    LocalidadesModule,
    VerificacionModule,
    AnimalesModule,
    PerfilModule,
    PostulacionesModule,
    DeseosModule,
  ],
})
export class AppModule {}
