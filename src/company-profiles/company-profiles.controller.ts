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
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CompanyProfilesService } from './company-profiles.service';
import { CreateCompanyProfileDto } from './dto/create-company-profile.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { CompanyProfileResponseDto } from './dto/company-profile-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/user.types';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Company Profiles')
@Controller('company-profiles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CompanyProfilesController {
  constructor(private readonly service: CompanyProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a company profile' })
  @ApiCreatedResponse({ type: CompanyProfileResponseDto })
  @Roles(UserRole.EMPLOYER)
  create(@Body() dto: CreateCompanyProfileDto, @Request() req: any) {
    const employerId = req.user?.id as string;
    return this.service.create(dto, employerId);
  }

  @Get()
  @ApiOperation({ summary: 'List company profiles' })
  @ApiOkResponse({ type: CompanyProfileResponseDto, isArray: true })
  @Roles(UserRole.EMPLOYER)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company profile by id' })
  @ApiOkResponse({ type: CompanyProfileResponseDto })
  @Roles(UserRole.EMPLOYER)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a company profile' })
  @ApiOkResponse({ type: CompanyProfileResponseDto })
  @Roles(UserRole.EMPLOYER)
  update(@Param('id') id: string, @Body() dto: UpdateCompanyProfileDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company profile' })
  @ApiOkResponse({ type: CompanyProfileResponseDto })
  @Roles(UserRole.EMPLOYER)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
