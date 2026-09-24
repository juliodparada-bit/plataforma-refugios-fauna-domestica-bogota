import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const extra = (process.env.WEB_ORIGEN ?? '')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);
  const permitidos = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    ...extra,
  ]);
  app.enableCors({
    origin(origen: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      if (!origen || permitidos.has(origen)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  });
  await app.listen(Number(process.env.PUERTO ?? 3000), '0.0.0.0');
}
void bootstrap();
