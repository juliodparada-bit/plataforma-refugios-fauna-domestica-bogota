import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class ResolverDto {
  @IsIn(['aprobar', 'rechazar', 'complemento'])
  accion!: 'aprobar' | 'rechazar' | 'complemento';

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsBoolean()
  visitaNecesaria?: boolean;
}
