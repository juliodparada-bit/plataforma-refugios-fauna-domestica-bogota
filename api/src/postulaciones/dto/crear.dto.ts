import { IsBoolean } from 'class-validator';

export class CrearPostulacionDto {
  @IsBoolean()
  mayorDeEdad!: boolean;

  @IsBoolean()
  viveEnBogota!: boolean;
}
