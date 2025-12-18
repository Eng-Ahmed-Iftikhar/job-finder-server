import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/user.types';

@ApiTags('Skills')
@Controller('skills')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Create a new skill (Owner only)' })
  @ApiResponse({ status: 201, description: 'Skill created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Skill already exists' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createSkill(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.createSkill(createSkillDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all skills with pagination' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search skills by name',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10)',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Skills retrieved successfully' })
  async findAllSkills(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.skillsService.findAllSkills(search, pageNumber, limitNumber);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all skills without pagination (for dropdowns)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search skills by name',
  })
  @ApiResponse({
    status: 200,
    description: 'All skills retrieved successfully',
  })
  async getAllSkillsNoPagination(@Query('search') search?: string) {
    return await this.skillsService.getAllSkillsNoPagination(search);
  }

  @Get('stats')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get skill statistics (Owner only)' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getSkillStats() {
    return this.skillsService.getSkillStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get skill by ID' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async findSkillById(@Param('id') id: string) {
    return this.skillsService.findSkillById(id);
  }

  @Put(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update skill by ID (Owner only)' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  @ApiResponse({ status: 409, description: 'Skill name already exists' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async updateSkill(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillsService.updateSkill(id, updateSkillDto);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete skill by ID (Owner only)' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({ status: 204, description: 'Skill deleted successfully' })
  @ApiResponse({ status: 400, description: 'Skill is being used by profiles' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async deleteSkill(@Param('id') id: string) {
    return this.skillsService.deleteSkill(id);
  }
}
