import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { MessageDto } from './dto/message.dto';
import { Server, Socket } from 'socket.io';
import { WsAuthorization } from 'src/common/decorators';

@WebSocketGateway({
  namespace: 'messages',
  cors: {
    origin: 'http://localhost:5173',
  },
})
export class MessagesGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: MessagesService) {}

  @SubscribeMessage('join')
  @WsAuthorization()
  joinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
  }

  @SubscribeMessage('getMessages')
  @WsAuthorization()
  async getMessages(@ConnectedSocket() client: Socket) {
    const messages = this.chatService.getMessages();
    client.emit('messages', messages);
  }

  @SubscribeMessage('addMessage')
  @WsAuthorization()
  async sendMessage(@MessageBody() message: MessageDto) {
    const msg = await this.chatService.addMessage(message);

    if (!msg) return null;

    this.server.to(message.chatId).emit('newMessage', {
      id: msg.id,
      content: msg.content,
      sender: { id: msg.sender.id, username: msg.sender.username }, // ⚠ explicitly include sender
      chatId: msg.chat.id,
      createdAt: msg.createdAt,
    });

    return msg;
  }

  @SubscribeMessage('updateMessage')
  @WsAuthorization()
  async updateMessage(
    @MessageBody()
    payload: { id: string; message: MessageDto },
    @ConnectedSocket() client: Socket,
  ) {
    return this.chatService.updateMessage(payload.id, payload.message);
  }

  @SubscribeMessage('deleteMessage')
  @WsAuthorization()
  async deleteMessage(
    @MessageBody()
    id: string,
    @ConnectedSocket() client: Socket,
  ) {
    return this.chatService.deleteMessage(id);
  }
}
