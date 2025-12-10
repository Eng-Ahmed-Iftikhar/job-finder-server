import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({
    description: 'Skill name',
    example: 'JavaScript',
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Skill name is required' })
  @IsString({ message: 'Skill name must be a string' })
  @MinLength(2, { message: 'Skill name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Skill name must not exceed 50 characters' })
  name: string;
}
