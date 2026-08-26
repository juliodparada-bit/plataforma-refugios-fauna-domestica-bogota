import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';
import { SesionOpcionalGuard } from './sesion-opcional.guard';
import { SesionGuard } from './sesion.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRETO', 'cambia-este-secreto-en-local'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SesionGuard, SesionOpcionalGuard, RolesGuard],
  exports: [JwtModule, SesionGuard, SesionOpcionalGuard, RolesGuard],
})
export class AuthModule {}
