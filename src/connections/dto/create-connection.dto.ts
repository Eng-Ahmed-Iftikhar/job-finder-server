import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateConnectionDto {
  @ApiProperty({ description: 'Employee user id' })
  @IsString()
  employeeId!: string;

  @ApiProperty({ description: 'Employer user id' })
  @IsString()
  employerId!: string;
}
