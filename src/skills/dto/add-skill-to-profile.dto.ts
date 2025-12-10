import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AddSkillToProfileDto {
  @ApiProperty({
    description: 'Skill name to add to profile',
    example: 'React',
  })
  @IsNotEmpty({ message: 'Skill name is required' })
  @IsString({ message: 'Skill name must be a string' })
  skillName: string;
}
