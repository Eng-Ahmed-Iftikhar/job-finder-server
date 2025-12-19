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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/user.types';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Companies')
@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a company' })
  @ApiCreatedResponse({ type: CompanyResponseDto })
  @Roles(UserRole.EMPLOYER)
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List companies' })
  @ApiOkResponse({ type: CompanyResponseDto, isArray: true })
  @Roles(UserRole.EMPLOYER)
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by id' })
  @ApiOkResponse({ type: CompanyResponseDto })
  @Roles(UserRole.EMPLOYER)
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a company' })
  @ApiOkResponse({ type: CompanyResponseDto })
  @Roles(UserRole.EMPLOYER)
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company' })
  @ApiOkResponse({ type: CompanyResponseDto })
  @Roles(UserRole.EMPLOYER)
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }

  @Post(':id/follow')
  @ApiOperation({ summary: 'Follow a company (EMPLOYEE only)' })
  @ApiOkResponse({ description: 'Company followed' })
  @Roles(UserRole.EMPLOYEE)
  follow(@Param('id') companyId: string, @Request() req: any) {
    const employeeId = req.user?.id as string;
    return this.companiesService.follow(companyId, employeeId);
  }

  @Delete(':id/follow')
  @ApiOperation({ summary: 'Unfollow a company (EMPLOYEE only)' })
  @ApiOkResponse({ description: 'Company unfollowed' })
  @Roles(UserRole.EMPLOYEE)
  unfollow(@Param('id') companyId: string, @Request() req: any) {
    const employeeId = req.user?.id as string;
    return this.companiesService.unfollow(companyId, employeeId);
  }

  @Get('followedIds')
  @ApiOperation({
    summary: 'Get followed company IDs for the authenticated employee',
  })
  @ApiOkResponse({ type: String, isArray: true })
  @Roles(UserRole.EMPLOYEE)
  followedCompanyIds(@Request() req: any) {
    const employeeId = req.user?.id as string;
    return this.companiesService.getFollowedCompanyIds(employeeId);
  }
}
