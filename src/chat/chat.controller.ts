import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { UpdateChatDto } from './dto/update-chat.dto';
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
    const userId = req.user.id;
    return this.chatService.getChats({
      userId: userId || '',
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
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
    console.log(req.user);

    return this.chatService.createChat(dto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a chat' })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({
    type: UpdateChatDto,
    examples: {
      default: {
        summary: 'Update chat',
        value: {
          name: 'Updated Chat Name',
          isGroup: false,
          // Add other fields as defined in UpdateChatDto
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Chat updated.', type: Object })
  updateChat(@Param('id') id: string, @Body() dto: any) {
    return this.chatService.updateChat(id, dto);
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
    @Param('id') chatId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.chatService.getMessages(
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
  updateMessage(@Param('messageId') messageId: string, @Body() dto: any) {
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
  addReaction(@Param('messageId') messageId: string, @Body() dto: any) {
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
  addReply(@Param('messageId') messageId: string, @Body() dto: any) {
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
  blockUser(@Param('id') chatId: string, @Body() dto: any) {
    return this.chatService.blockUser(chatId, dto);
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
