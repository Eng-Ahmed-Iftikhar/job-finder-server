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
import { ConnectionsService } from './connections.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';
import { ConnectionResponseDto } from './dto/connection-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/user.types';

@ApiTags('Connections')
@Controller('connections')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post('connect/:userId')
  @ApiOperation({ summary: 'Create a connection with a user' })
  @ApiCreatedResponse({ type: ConnectionResponseDto })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  connectWithUser(@Param('userId') targetUserId: string, @Request() req: any) {
    const currentUserId = req.user?.id as string;
    return this.connectionsService.connectWithUser(currentUserId, targetUserId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a connection' })
  @ApiCreatedResponse({ type: ConnectionResponseDto })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  create(@Body() dto: CreateConnectionDto) {
    return this.connectionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List connections' })
  @ApiOkResponse({ type: ConnectionResponseDto, isArray: true })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  findAll() {
    return this.connectionsService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'List my connections (other users)' })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          connectionId: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string', nullable: true },
              lastName: { type: 'string', nullable: true },
              pictureUrl: { type: 'string', nullable: true },
              role: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  listMine(@Request() req: any) {
    const userId = req.user?.id as string;
    return this.connectionsService.listMine(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a connection by id' })
  @ApiOkResponse({ type: ConnectionResponseDto })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  findOne(@Param('id') id: string) {
    return this.connectionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a connection' })
  @ApiOkResponse({ type: ConnectionResponseDto })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  update(@Param('id') id: string, @Body() dto: UpdateConnectionDto) {
    return this.connectionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a connection' })
  @ApiOkResponse({ type: ConnectionResponseDto })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  remove(@Param('id') id: string) {
    return this.connectionsService.remove(id);
  }
}
