import { IsBoolean, IsOptional } from 'class-validator';

export class ConfirmarDto {
  @IsBoolean()
  checkRecibido!: boolean;

  @IsOptional()
  @IsBoolean()
  conFoto?: boolean;
}
