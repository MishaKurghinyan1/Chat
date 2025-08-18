import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from './entites/messages.entity';
import { MessageDto } from './dto/message.dto';
import { UserEntity } from 'src/auth/entities/user.entity';
@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async getMessages() {
    return await this.messageRepository.find();
  }
  async addMessage(message: MessageDto) {
    const msg = this.messageRepository.create({
      ...message,
      chat: { id: message.chatId },
      sender: { id: message.senderId },
    });
    const savedMsg = await this.messageRepository.save(msg);
    return this.messageRepository.findOne({
      where: { id: savedMsg.id },
      relations: ['chat', 'sender'],
    });
  }

  async deleteMessage(id: string) {
    return await this.messageRepository.delete(id);
  }

  async updateMessage(id: string, messageDto: MessageDto) {
    const oldMessage = await this.messageRepository.findOneBy({ id });
    if (!oldMessage) {
      throw new Error('Message not found');
    }

    const updatedMessage = Object.assign(oldMessage, messageDto);

    return await this.messageRepository.save(updatedMessage);
  }
}
