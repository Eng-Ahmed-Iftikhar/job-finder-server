import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber } from 'class-validator';

export class CreatePhoneNumberDto {
  @ApiProperty({ description: 'Country code', example: '+1' })
  @IsString({ message: 'Country code must be a string' })
  countryCode: string;

  @ApiProperty({ description: 'Phone number', example: '5551234567' })
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  number: string;
}
