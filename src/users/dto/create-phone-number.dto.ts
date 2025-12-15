import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePhoneNumberDto {
  @ApiProperty({ description: 'Country code', example: '+1' })
  @IsString({ message: 'Country code must be a string' })
  countryCode: string;

  @ApiProperty({ description: 'Phone number', example: '5551234567' })
  @IsString({ message: 'Please provide a valid phone number' })
  number: string;
}
