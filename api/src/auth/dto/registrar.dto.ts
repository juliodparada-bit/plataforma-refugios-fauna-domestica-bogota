import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class RegistrarDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEmail()
  correo!: string;

  @IsString()
  @MinLength(8)
  contrasena!: string;

  @IsUUID()
  localidadId!: string;

  @IsIn(['adoptante', 'donante', 'entidad'])
  rol!: 'adoptante' | 'donante' | 'entidad';

  @IsBoolean()
  consentimientoDatos!: boolean;
}
