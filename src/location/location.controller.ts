import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LocationService } from './location.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/user.types';

@ApiTags('Location')
@Controller('location')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get all locations' })
  @ApiOkResponse({ description: 'List of all locations' })
  async getAll() {
    return this.locationService.getAll();
  }

  @Get('search')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Search locations by city, state, or country' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query (city, state, or country)',
  })
  @ApiOkResponse({ description: 'List of matching locations' })
  async search(@Query('q') q: string) {
    return this.locationService.search(q);
  }
}
