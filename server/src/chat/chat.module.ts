import { Module } from '@nestjs/common';
import { ChatController } from './chat.controllet';
import { ChatService } from './chat.service';
import { AuthModule } from 'src/auth/auth.module';
import { ChatEntity } from './entities/chat.entity';
import { UserEntity } from 'src/auth/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { MessageEntity } from 'src/message/entites/messages.entity';
import { ChatGateway } from './chat.gateway';
@Module({
  imports: [
    TypeOrmModule.forFeature([ChatEntity, MessageEntity, UserEntity]),
    AuthModule,
  ],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
