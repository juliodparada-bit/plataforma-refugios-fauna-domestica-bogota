import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, Max, Min } from 'class-validator';

export class GuardarPerfilDto {
  @IsIn(['apartamento', 'casa', 'casa_con_patio', 'otro'])
  tipoVivienda!: 'apartamento' | 'casa' | 'casa_con_patio' | 'otro';

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(24)
  horasCompania!: number;

  @IsBoolean()
  ninosEnHogar!: boolean;

  @IsIn(['ninguno', 'perro', 'gato', 'ambos', 'otros'])
  otrosAnimales!: 'ninguno' | 'perro' | 'gato' | 'ambos' | 'otros';

  @IsIn(['baja', 'media', 'alta'])
  energiaSostenible!: 'baja' | 'media' | 'alta';
}
