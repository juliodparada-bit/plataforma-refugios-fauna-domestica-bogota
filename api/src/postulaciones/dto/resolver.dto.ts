import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class ResolverPostulacionDto {
  @IsIn(['abrir', 'preseleccionar', 'rechazar', 'caer', 'entregar', 'seguimiento'])
  accion!: 'abrir' | 'preseleccionar' | 'rechazar' | 'caer' | 'entregar' | 'seguimiento';

  @IsOptional()
  @IsIn(['estable', 'novedad', 'retorno'])
  seguimientoResultado?: 'estable' | 'novedad' | 'retorno';

  @IsOptional()
  @IsBoolean()
  requiereEvidenciaHogar?: boolean;

  @IsOptional()
  @IsString()
  mayorDeEdad?: string;
}
