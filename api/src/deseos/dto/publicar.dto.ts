import { Type } from 'class-transformer';
import { IsIn, IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class PublicarDeseoDto {
  @IsIn(['alimento', 'medicina', 'aseo'])
  categoria!: 'alimento' | 'medicina' | 'aseo';

  @IsString()
  @MinLength(4)
  @MaxLength(200)
  descripcion!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(30)
  unidad!: string;

  @IsIn(['baja', 'media', 'alta'])
  prioridad!: 'baja' | 'media' | 'alta';
}
