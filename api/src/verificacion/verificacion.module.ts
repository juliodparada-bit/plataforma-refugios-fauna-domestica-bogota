import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VerificacionController } from './verificacion.controller';
import { VerificacionService } from './verificacion.service';

@Module({
  imports: [AuthModule],
  controllers: [VerificacionController],
  providers: [VerificacionService],
})
export class VerificacionModule {}
