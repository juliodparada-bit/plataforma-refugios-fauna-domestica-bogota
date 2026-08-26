import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/roles.guard';
import { SesionOpcionalGuard } from '../auth/sesion-opcional.guard';
import { AnimalesController } from './animales.controller';
import { AnimalesService } from './animales.service';

@Module({
  imports: [AuthModule],
  controllers: [AnimalesController],
  providers: [AnimalesService, RolesGuard, SesionOpcionalGuard],
  exports: [AnimalesService],
})
export class AnimalesModule {}
