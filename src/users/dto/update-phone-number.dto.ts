import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdatePhoneNumberDto {
  @ApiProperty({ 
    description: 'Country code', 
    example: '+1',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'Country code must be a string' })
  countryCode?: string;

  @ApiProperty({ 
    description: 'Phone number', 
    example: '5551234567',
    required: false 
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  number?: string;

  @ApiProperty({ 
    description: 'Verification status', 
    example: true,
    required: false 
  })
  @IsOptional()
  @IsBoolean({ message: 'Verification status must be a boolean' })
  isVerified?: boolean;
}
