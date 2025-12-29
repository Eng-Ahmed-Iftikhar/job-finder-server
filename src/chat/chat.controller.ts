import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ChatService } from './chat.service';
import { AddReactionDto } from './dto/add-reaction.dto';
import { AddReplyDto } from './dto/add-reply.dto';
import { BlockUserDto } from './dto/block-user.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateChatDto, UpdateChatGroupDto } from './dto/update-chat.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@ApiTags('Chat')
@Controller('chats')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all chats for a user with pagination and search',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by group name or user name',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'List of chats.', type: [Object] })
  getChats(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const userId = req.user.id as string;
    return this.chatService.getChats({
      userId: userId || '',
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  @Get('unread-messages')
  @ApiOperation({
    summary: 'Get all unread (not received) messages for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of unread messages.',
    type: [Object],
  })
  getUnreadMessages(@Request() req: any) {
    const userId = req.user.id;
    return this.chatService.getUnreadMessages(userId as string);
  }
  @Patch('/message-status-update/:statusId')
  @ApiOperation({ summary: 'Update message user status (receivedAt/seenAt)' })
  @ApiParam({ name: 'statusId', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        receivedAt: { type: 'string', format: 'date-time', nullable: true },
        seenAt: { type: 'string', format: 'date-time', nullable: true },
      },
    },
    examples: {
      received: {
        summary: 'Mark as received',
        value: { receivedAt: new Date().toISOString() },
      },
      seen: {
        summary: 'Mark as seen',
        value: { seenAt: new Date().toISOString() },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Message user status updated.',
    type: Object,
  })
  updateMessageUserStatus(
    @Request() req: any,
    @Param('statusId') statusId: string,
    @Body() body: { receivedAt?: string; seenAt?: string },
  ) {
    return this.chatService.updateMessageUserStatus(
      statusId,
      body,
      req.user.id,
    );
  }

  @Put('messages/:messageId')
  @ApiOperation({ summary: 'Update a message' })
  @ApiParam({ name: 'messageId', required: true })
  @ApiBody({
    type: UpdateMessageDto,
    examples: {
      default: {
        summary: 'Update message',
        value: {
          content: 'Updated message content',
          // Add other fields as defined in UpdateMessageDto
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Message updated.', type: Object })
  updateMessage(
    @Param('messageId') messageId: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.chatService.updateMessage(messageId, dto);
  }

  @Delete('messages/:messageId')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiParam({ name: 'messageId', required: true })
  @ApiResponse({ status: 200, description: 'Message deleted.', type: Object })
  deleteMessage(@Param('messageId') messageId: string) {
    return this.chatService.deleteMessage(messageId);
  }

  // Chat reactions
  @Post('messages/:messageId/reactions')
  @ApiOperation({ summary: 'Add a reaction to a message' })
  @ApiParam({ name: 'messageId', required: true })
  @ApiBody({
    type: AddReactionDto,
    examples: {
      default: {
        summary: 'Add reaction',
        value: {
          userId: 'user-uuid-1',
          emoji: '👍',
          // Add other fields as defined in AddReactionDto
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Reaction added.', type: Object })
  addReaction(
    @Param('messageId') messageId: string,
    @Body() dto: AddReactionDto,
  ) {
    return this.chatService.addReaction(messageId, dto);
  }

  @Delete('messages/:messageId/reactions/:reactionId')
  @ApiOperation({ summary: 'Remove a reaction from a message' })
  @ApiParam({ name: 'messageId', required: true })
  @ApiParam({ name: 'reactionId', required: true })
  @ApiResponse({ status: 200, description: 'Reaction removed.', type: Object })
  removeReaction(
    @Param('messageId') messageId: string,
    @Param('reactionId') reactionId: string,
  ) {
    return this.chatService.removeReaction(messageId, reactionId);
  }

  // Chat replies
  @Post('messages/:messageId/replies')
  @ApiOperation({ summary: 'Add a reply to a message' })
  @ApiParam({ name: 'messageId', required: true })
  @ApiBody({
    type: AddReplyDto,
    examples: {
      default: {
        summary: 'Add reply',
        value: {
          userId: 'user-uuid-2',
          content: 'This is a reply',
          // Add other fields as defined in AddReplyDto
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Reply added.', type: Object })
  addReply(@Param('messageId') messageId: string, @Body() dto: AddReplyDto) {
    return this.chatService.addReply(messageId, dto);
  }

  @Delete('messages/:messageId/replies/:replyId')
  @ApiOperation({ summary: 'Remove a reply from a message' })
  @ApiParam({ name: 'messageId', required: true })
  @ApiParam({ name: 'replyId', required: true })
  @ApiResponse({ status: 200, description: 'Reply removed.', type: Object })
  removeReply(
    @Param('messageId') messageId: string,
    @Param('replyId') replyId: string,
  ) {
    return this.chatService.removeReply(messageId, replyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a chat by ID' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Chat details.', type: Object })
  getChat(@Param('id') id: string) {
    return this.chatService.getChat(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiBody({
    type: CreateChatDto,
    examples: {
      default: {
        summary: 'Create chat',
        value: {
          type: 'PRIVATE',
          userIds: ['user-uuid-1', 'user-uuid-2'],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Chat created.', type: Object })
  createChat(@Body() dto: CreateChatDto, @Request() req: any) {
    return this.chatService.createChat(dto, req.user.id as string);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a chat (non-group fields)' })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({
    type: UpdateChatDto,
    examples: {
      default: {
        summary: 'Update chat',
        value: {
          type: 'PRIVATE',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Chat updated.', type: Object })
  updateChat(@Param('id') id: string, @Body() dto: UpdateChatDto) {
    return this.chatService.updateChat(id, dto);
  }

  @Get(':id/message-dates')
  @ApiOperation({ summary: 'Get unique message dates for a chat' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({
    status: 200,
    description: 'List of unique message dates.',
    type: [String],
  })
  async getMessageDates(@Param('id') chatId: string) {
    // This should return an array of unique dates (YYYY-MM-DD) for messages in the chat
    return this.chatService.getMessageDates(chatId);
  }

  @Patch(':id/group')
  @ApiOperation({
    summary: 'Update group details (name, description, iconUrl)',
  })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({
    type: UpdateChatGroupDto,
    examples: {
      default: {
        summary: 'Update group',
        value: {
          name: 'Updated Group Name',
          description: 'Updated group description',
          iconUrl: 'https://example.com/icon.png',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Group updated.', type: Object })
  updateGroup(@Param('id') id: string, @Body() dto: UpdateChatGroupDto) {
    return this.chatService.updateGroup(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chat' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Chat deleted.', type: Object })
  deleteChat(@Param('id') id: string) {
    return this.chatService.deleteChat(id);
  }

  // Chat messages
  @Get(':id/messages')
  @ApiOperation({
    summary: 'Get messages for a chat with pagination grouped by date',
  })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Messages grouped by date.',
    type: [Object],
  })
  getMessages(
    @Request() req: any,
    @Param('id') chatId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const userId = req.user.id as string;
    return this.chatService.getMessages(
      userId,
      chatId,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message in a chat' })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({
    type: SendMessageDto,
    examples: {
      default: {
        summary: 'Send message',
        value: {
          senderId: 'user-uuid-1',
          content: 'Hello, world!',
          type: 'text',
          // Add other fields as defined in SendMessageDto
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Message sent.', type: Object })
  sendMessage(@Param('id') chatId: string, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(chatId, dto);
  }

  // get chat blocks
  @Get(':id/blocks')
  @ApiOperation({ summary: 'Get blocked users in a chat' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({
    status: 200,
    description: 'List of blocked users.',
    type: [Object],
  })
  getBlockedUsers(@Param('id') chatId: string, @Request() req: any) {
    const userId = req.user.id as string;
    return this.chatService.getBlockedUserChat(chatId, userId);
  }
  // Chat blocks
  @Post(':id/blocks')
  @ApiOperation({ summary: 'Block a user in a chat' })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({
    type: BlockUserDto,
    examples: {
      default: {
        summary: 'Block user',
        value: {
          userId: 'user-uuid-3',
          reason: 'Spamming',
          // Add other fields as defined in BlockUserDto
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User blocked.', type: Object })
  blockUser(@Param('id') chatId: string, @Request() req: any) {
    const userId = req.user.id as string;
    return this.chatService.blockUser(chatId, userId);
  }

  @Delete(':id/blocks/:blockId')
  @ApiOperation({ summary: 'Unblock a user in a chat' })
  @ApiParam({ name: 'id', required: true })
  @ApiParam({ name: 'blockId', required: true })
  @ApiResponse({ status: 200, description: 'User unblocked.', type: Object })
  unblockUser(@Param('id') chatId: string, @Param('blockId') blockId: string) {
    return this.chatService.unblockUser(chatId, blockId);
  }
}
