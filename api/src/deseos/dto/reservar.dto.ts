import { IsString, MaxLength, MinLength } from 'class-validator';

export class ReservarDto {
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  contactoEntrega!: string;
}
