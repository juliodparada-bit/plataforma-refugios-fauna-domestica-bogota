import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/roles.guard';
import { DeseosController } from './deseos.controller';
import { DeseosService } from './deseos.service';

@Module({
  imports: [AuthModule],
  controllers: [DeseosController],
  providers: [DeseosService, RolesGuard],
})
export class DeseosModule {}
