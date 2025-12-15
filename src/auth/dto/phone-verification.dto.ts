import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendPhoneVerificationDto {
  @ApiProperty({
    description: "User's phone number",
    example: '+1234567890',
  })
  @IsString({ message: 'Please provide a valid phone number' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @ApiProperty({
    description: 'Country code for phone number',
    example: '+1',
  })
  @IsString({ message: 'Country code must be a string' })
  @IsNotEmpty({ message: 'Country code is required' })
  countryCode: string;
}

export class VerifyPhoneCodeDto {
  @ApiProperty({
    description: 'Verification code sent to phone',
    example: '123456',
  })
  @IsString({ message: 'Verification code must be a string' })
  @IsNotEmpty({ message: 'Verification code is required' })
  verificationCode: string;
}
