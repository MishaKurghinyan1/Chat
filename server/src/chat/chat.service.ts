import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatEntity } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatDto } from './dto/chat.dto';
import { MessageEntity } from 'src/message/entites/messages.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
  ) {}
  async getChats() {
    return await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.messages', 'messages')
      .leftJoin('chat.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.email'])
      .getMany();
  }

  async getChatById(id: string) {
    return await this.chatRepository.findOne({
      where: { id },
      relations: ['messages', 'messages.sender'],
    });
  }

  async createChat(chatDto: ChatDto) {
    const { user_id, ...rest } = chatDto;

    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) throw new Error('User not found');

    const chat = this.chatRepository.create({
      ...rest,
      user,
      messages:
        chatDto.messages?.map((msg) => this.messageRepository.create(msg)) ||
        [],
    });

    return await this.chatRepository.save(chat);
  }

  async updateChat(id: string, name: string) {
    const chat = await this.chatRepository.findOne({
      where: { id },
      relations: ['user', 'messages'], // если нужно подтянуть связи
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Обновляем только разрешённые поля
    const updatedChat = Object.assign(chat, { name});

    return await this.chatRepository.save(updatedChat);
  }

  async deleteChat(id: string) {
    return await this.chatRepository.delete(id);
  }
}
