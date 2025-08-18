import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Authorization } from 'src/common/decorators';
import { ChatDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/rooms')
  @Authorization()
  async getRooms() {
    const rooms = await this.chatService.getChats();

    return rooms ?? [];
  }

  @Post('/create')
  @Authorization()
  async createRoom(@Body() chat: ChatDto) {
    return await this.chatService.createChat(chat);
  }

  @Get('/rooms/:id')
  @Authorization()
  async getRoom(
    @Param('id')
    id: string,
  ) {
    const room = await this.chatService.getChatById(id);
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  @Put('/rooms/:id')
  @Authorization()
  async updateRoom(@Param('id') id: string, @Body('name') name: string) {
    return this.chatService.updateChat(id, name);
  }
  @Delete('/rooms/:id')
  @Authorization()
  async deleteRoom(@Param('id') id: string) {
    return this.chatService.deleteChat(id);
  }
}
