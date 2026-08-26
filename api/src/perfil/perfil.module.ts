import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/roles.guard';
import { PerfilController } from './perfil.controller';
import { PerfilService } from './perfil.service';

@Module({
  imports: [AuthModule],
  controllers: [PerfilController],
  providers: [PerfilService, RolesGuard],
})
export class PerfilModule {}
