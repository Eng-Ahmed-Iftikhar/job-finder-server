import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/user.types';
import { MarkBulkReadDto } from './dto/mark-bulk-read.dto';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'List notifications for authenticated user' })
  @ApiOkResponse({ description: 'Paginated list of notifications' })
  @ApiQuery({ name: 'page', required: false, schema: { default: 1 } })
  @ApiQuery({ name: 'pageSize', required: false, schema: { default: 10 } })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  listMine(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    const userId = req.user?.id as string;
    return this.notificationsService.listForUser(userId, { page, pageSize });
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiOkResponse({ description: 'Notification marked as read' })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  markAsRead(@Request() req: any, @Param('id') notificationId: string) {
    const userId = req.user?.id as string;
    return this.notificationsService.markAsRead(notificationId, userId);
  }

  @Patch('read')
  @ApiOperation({ summary: 'Mark multiple notifications as read' })
  @ApiOkResponse({ description: 'Notifications marked as read' })
  @ApiBody({ type: MarkBulkReadDto })
  @Roles(UserRole.EMPLOYER, UserRole.EMPLOYEE)
  markBulkAsRead(@Request() req: any, @Body() body: MarkBulkReadDto) {
    const userId = req.user?.id as string;
    return this.notificationsService.markBulkAsRead(body.ids, userId);
  }
}
