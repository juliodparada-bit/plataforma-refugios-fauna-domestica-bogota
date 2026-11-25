import { IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class PublicarAnimalDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nombre!: string;

  @IsIn(['canino', 'felino'])
  especie!: 'canino' | 'felino';

  @IsIn(['macho', 'hembra'])
  sexo!: 'macho' | 'hembra';

  @IsIn(['pequeno', 'mediano', 'grande'])
  talla!: 'pequeno' | 'mediano' | 'grande';

  @IsIn(['cachorro', 'joven', 'adulto', 'senior'])
  edadAprox!: 'cachorro' | 'joven' | 'adulto' | 'senior';

  @IsUUID()
  localidadId!: string;

  @IsIn(['baja', 'media', 'alta'])
  energia!: 'baja' | 'media' | 'alta';

  @IsString()
  @MinLength(20)
  historia!: string;

  @IsIn(['true', 'false'])
  conviveNinos!: string;

  @IsIn(['true', 'false'])
  conviveOtrosAnimales!: string;

  @IsIn(['true', 'false'])
  necesidadEspecial!: string;

  @IsOptional()
  @IsIn(['ns', 'si', 'no'])
  esterilizado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  raza?: string;
}
