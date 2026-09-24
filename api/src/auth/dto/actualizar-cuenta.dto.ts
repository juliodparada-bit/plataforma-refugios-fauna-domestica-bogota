import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class ActualizarCuentaDto {
  @IsString()
  @MinLength(2)
  nombre!: string;

  @IsUUID()
  localidadId!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  entidadNombre?: string;
}
