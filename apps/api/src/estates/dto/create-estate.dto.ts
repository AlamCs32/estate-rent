import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateEstateDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  @MaxLength(255)
  location!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
