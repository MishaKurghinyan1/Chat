import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entites/messages.entity';
import { AuthModule } from '../auth/auth.module';
import { WsJwtStrategy } from 'src/common/guards';
import { PassportModule } from '@nestjs/passport';
import { MessagesService } from './messages.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'ws-jwt' }),
    TypeOrmModule.forFeature([MessageEntity]),
    AuthModule,
  ],
  providers: [MessagesGateway, MessagesService, WsJwtStrategy],
})
export class MessagesModule {}
