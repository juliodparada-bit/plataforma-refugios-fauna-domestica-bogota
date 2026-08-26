import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/roles.guard';
import { VerificacionController } from './verificacion.controller';
import { VerificacionService } from './verificacion.service';

@Module({
  imports: [AuthModule],
  controllers: [VerificacionController],
  providers: [VerificacionService, RolesGuard],
})
export class VerificacionModule {}
