import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: '123456', description: '6-digit verification code' })
  @IsString()
  @IsNotEmpty()
  @Length(5, 5, { message: 'Verification code must be exactly 5 digits' })
  verificationCode: string;
}

// No DTO needed for resend verification since we get user from JWT token
