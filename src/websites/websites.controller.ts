import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WebsitesService } from './websites.service';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import { WebsiteResponseDto } from './dto/website-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/user.types';

@ApiTags('Websites')
@Controller('websites')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WebsitesController {
  constructor(private readonly websitesService: WebsitesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a website' })
  @ApiCreatedResponse({ type: WebsiteResponseDto })
  @Roles(UserRole.EMPLOYER)
  create(@Body() dto: CreateWebsiteDto) {
    return this.websitesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List websites' })
  @ApiOkResponse({ type: WebsiteResponseDto, isArray: true })
  @Roles(UserRole.EMPLOYER)
  findAll() {
    return this.websitesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a website by id' })
  @ApiOkResponse({ type: WebsiteResponseDto })
  @Roles(UserRole.EMPLOYER)
  findOne(@Param('id') id: string) {
    return this.websitesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a website' })
  @ApiOkResponse({ type: WebsiteResponseDto })
  @Roles(UserRole.EMPLOYER)
  update(@Param('id') id: string, @Body() dto: UpdateWebsiteDto) {
    return this.websitesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a website' })
  @ApiOkResponse({ type: WebsiteResponseDto })
  @Roles(UserRole.EMPLOYER)
  remove(@Param('id') id: string) {
    return this.websitesService.remove(id);
  }
}
