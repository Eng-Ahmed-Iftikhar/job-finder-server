import {
  Body,
  Controller,
  Delete,
  DefaultValuePipe,
  Get,
  Param,
  Patch,
  Post,
  Request,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { ConnectionRequestsService } from './connection-requests.service';
import { CreateConnectionRequestDto } from './dto/create-connection-request.dto';
import { UpdateConnectionRequestDto } from './dto/update-connection-request.dto';
import { ConnectionRequestResponseDto } from './dto/connection-request-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/user.types';

@ApiTags('Connection Requests')
@Controller('connection-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConnectionRequestsController {
  constructor(private readonly service: ConnectionRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a connection request' })
  @ApiCreatedResponse({ type: ConnectionRequestResponseDto })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  create(@Body() dto: CreateConnectionRequestDto, @Request() req: any) {
    const senderId = req.user?.id as string;
    return this.service.create(senderId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List connection requests' })
  @ApiOkResponse({ type: ConnectionRequestResponseDto, isArray: true })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  findAll() {
    return this.service.findAll();
  }
  @Get('me')
  @ApiOperation({
    summary: 'List connection requests for the authenticated employee',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            allOf: [
              { $ref: '#/components/schemas/ConnectionRequestResponseDto' },
              {
                type: 'object',
                properties: {
                  direction: {
                    type: 'string',
                    enum: ['INBOUND', 'OUTBOUND'],
                  },
                },
              },
            ],
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        pageSize: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiQuery({ name: 'page', required: false, schema: { default: 1 } })
  @ApiQuery({ name: 'pageSize', required: false, schema: { default: 10 } })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by sender/receiver name or email',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['INBOUND', 'OUTBOUND'],
    description: 'Filter by direction relative to the authenticated user',
  })
  @Roles(UserRole.EMPLOYEE)
  employeeRequests(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const employeeId = req.user?.id as string;
    return this.service.findEmployeeRequests(employeeId, {
      page,
      pageSize,
      search,
      status,
    });
  }

  @Get('count/me')
  @ApiOperation({ summary: 'Get count of my connection requests' })
  @ApiOkResponse({ schema: { type: 'number' } })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  async countMine(@Request() req: any) {
    const userId = req.user?.id as string;
    return this.service.countMine(userId);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept a connection request by id' })
  @ApiOkResponse({ type: ConnectionRequestResponseDto })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  accept(@Param('id') id: string) {
    return this.service.acceptRequest(id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a connection request by id' })
  @ApiOkResponse({ type: ConnectionRequestResponseDto })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  reject(@Param('id') id: string) {
    return this.service.rejectRequest(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a connection request by id' })
  @ApiOkResponse({ type: ConnectionRequestResponseDto })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a connection request' })
  @ApiOkResponse({ type: ConnectionRequestResponseDto })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  update(@Param('id') id: string, @Body() dto: UpdateConnectionRequestDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a connection request' })
  @ApiOkResponse({ type: ConnectionRequestResponseDto })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
