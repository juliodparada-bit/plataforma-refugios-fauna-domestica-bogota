import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/roles.guard';
import { PostulacionesController } from './postulaciones.controller';
import { PostulacionesService } from './postulaciones.service';

@Module({
  imports: [AuthModule],
  controllers: [PostulacionesController],
  providers: [PostulacionesService, RolesGuard],
})
export class PostulacionesModule {}
