import { IsString, IsOptional, IsObject } from 'class-validator';

export class SubmitKycDto {
  @IsString()
  documentType: string;

  @IsString()
  @IsOptional()
  documentNumber?: string;

  @IsString()
  frontImageUrl: string;

  @IsString()
  @IsOptional()
  backImageUrl?: string;

  @IsString()
  @IsOptional()
  selfieImageUrl?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
