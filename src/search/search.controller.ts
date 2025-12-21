import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/user.types';

@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({
    summary: 'Global search for jobs, employees, and companies',
    description:
      'Search across jobs, employees, and companies. Returns jobs, employees, and companies based on the search text. Optionally filter by location (city,state).',
  })
  @ApiQuery({
    name: 'text',
    required: true,
    description: 'Search text to find jobs, employees, and companies',
    type: String,
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description:
      'Location filter in format: city,state (e.g., faisalabad,punjab)',
    type: String,
  })
  @ApiOkResponse({
    description: 'Search results with limited data and total counts',
    schema: {
      type: 'object',
      properties: {
        jobs: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { type: 'object' },
              description: '2 most recent jobs matching the search',
            },
            total: {
              type: 'number',
              description: 'Total count of jobs found in the search',
            },
          },
        },
        employees: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { type: 'object' },
              description: '5 most recent employees matching the search',
            },
            total: {
              type: 'number',
              description: 'Total count of employees found in the search',
            },
          },
        },
        companies: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { type: 'object' },
              description: '5 most recent companies matching the search',
            },
            total: {
              type: 'number',
              description: 'Total count of companies found in the search',
            },
          },
        },
      },
    },
  })
  async search(
    @Query('text') text: string,
    @Query('location') location?: string,
  ) {
    return this.service.search(text, location);
  }
}
