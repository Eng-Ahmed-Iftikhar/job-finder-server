import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
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
