import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobResponseDto } from './dto/job-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/user.types';

@ApiTags('Jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly service: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a job (EMPLOYER only)' })
  @ApiCreatedResponse({ type: JobResponseDto })
  @Roles(UserRole.EMPLOYER)
  create(@Body() dto: CreateJobDto, @Request() req: any) {
    const employerId = req.user?.id as string;
    return this.service.create(dto, employerId);
  }

  @Get()
  @ApiOperation({ summary: 'List jobs' })
  @ApiOkResponse({ type: JobResponseDto, isArray: true })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  findAll() {
    return this.service.findAll();
  }

  @Get('suggested')
  @ApiOperation({
    summary: 'List suggested jobs for the authenticated employee',
  })
  @ApiOkResponse({ type: JobResponseDto, isArray: true })
  @Roles(UserRole.EMPLOYEE)
  suggested(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const employeeId = req.user?.id as string;
    return this.service.findSuggested(employeeId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job by id' })
  @ApiOkResponse({ type: JobResponseDto })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a job (EMPLOYER only)' })
  @ApiOkResponse({ type: JobResponseDto })
  @Roles(UserRole.EMPLOYER)
  update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job (EMPLOYER only)' })
  @ApiOkResponse({ type: JobResponseDto })
  @Roles(UserRole.EMPLOYER)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/apply')
  @ApiOperation({ summary: 'Apply to a job (EMPLOYEE only)' })
  @ApiOkResponse({ description: 'Application created' })
  @Roles(UserRole.EMPLOYEE)
  apply(@Param('id') jobId: string, @Request() req: any) {
    const employeeId = req.user?.id as string;
    return this.service.apply(jobId, employeeId);
  }

  @Post(':id/save')
  @ApiOperation({ summary: 'Save a job (EMPLOYEE only)' })
  @ApiOkResponse({ description: 'Job saved' })
  @Roles(UserRole.EMPLOYEE)
  save(@Param('id') jobId: string, @Request() req: any) {
    const employeeId = req.user?.id as string;
    return this.service.save(jobId, employeeId);
  }
}
