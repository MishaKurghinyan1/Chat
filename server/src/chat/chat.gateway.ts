import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { WsAuthorization } from 'src/common/decorators';
import { Server, Socket } from 'socket.io';
import { NotFoundException } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: 'http://localhost:5173',
  },
})
export class ChatGateway {
  private clients = new Set<string>();
  @WebSocketServer() server: Server;
  constructor(private readonly chatService: ChatService) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log('Client connected', client.id);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.clients.delete(client.id);
    console.log('Client disconnected', client.id);
  }

  @SubscribeMessage('join')
  @WsAuthorization()
  async handleJoin(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.clients.add(client.id);
    const chat = await this.chatService.getChatById(data.room);
    client.emit('joined', { chat, usersCount: this.clients.size });
  }

  @SubscribeMessage('getRoom')
  @WsAuthorization()
  async getRooms(@MessageBody() id: string) {
    const room = await this.chatService.getChatById(id);
    if (!room) throw new NotFoundException('Room not found');
    this.server.emit('room', room);
  }

  @SubscribeMessage('leavingRoom')
  @WsAuthorization()
  handleLeave(@ConnectedSocket() client: Socket) {
    console.log('Client left', client.id);
  }
}
