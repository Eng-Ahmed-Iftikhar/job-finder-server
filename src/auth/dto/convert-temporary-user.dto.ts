import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class ConvertTemporaryUserDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}
