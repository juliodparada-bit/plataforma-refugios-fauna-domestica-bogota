import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AnimalesController } from './animales.controller';
import { AnimalesService } from './animales.service';

@Module({
  imports: [AuthModule],
  controllers: [AnimalesController],
  providers: [AnimalesService],
  exports: [AnimalesService],
})
export class AnimalesModule {}
