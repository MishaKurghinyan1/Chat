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
    origin: [
      'http://localhost:5173',
      'https://client-production-b9fd.up.railway.app'
    ]
  },
})
export class ChatGateway {
  // roomId -> Map<userId, Set<socketId>>
  private rooms = new Map<string, Map<string, Set<string>>>();

  @WebSocketServer() server!: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log('Client connected', client.id);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    for (const [roomId, users] of this.rooms) {
      const userId = client.data.userID;
      if (!userId || !users.has(userId)) continue;

      const sockets = users.get(userId)!;
      sockets.delete(client.id);

      // remove user only if no more sockets remain
      if (sockets.size === 0) users.delete(userId);

      // broadcast updated count
      this.server
        .to(roomId)
        .emit('usersCountUpdated', { usersCount: users.size });
    }

    console.log('Client disconnected', client.id);
  }

  @SubscribeMessage('join')
  @WsAuthorization()
  async handleJoin(
    @MessageBody() data: { room: string; userID: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.data.userID = data.userID;

    if (!this.rooms.has(data.room)) this.rooms.set(data.room, new Map());
    const room = this.rooms.get(data.room)!;

    if (!room.has(data.userID)) room.set(data.userID, new Set());
    room.get(data.userID)!.add(client.id);

    client.join(data.room);

    const chat = await this.chatService.getChatById(data.room);

    client.emit('joined', { chat, usersCount: room.size });

    this.server
      .to(data.room)
      .emit('usersCountUpdated', { usersCount: room.size });
  }

  @SubscribeMessage('leavingRoom')
  @WsAuthorization()
  handleLeave(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.rooms.get(data.room);
    if (!room) return;

    const userId = client.data.userID;
    if (!userId || !room.has(userId)) return;

    const sockets = room.get(userId)!;
    sockets.delete(client.id);

    if (sockets.size === 0) room.delete(userId);

    client.leave(data.room);

    this.server
      .to(data.room)
      .emit('usersCountUpdated', { usersCount: room.size });

    console.log('Client left room', data.room, userId);
  }

  @SubscribeMessage('getRoom')
  @WsAuthorization()
  async getRooms(@MessageBody() id: string) {
    const room = await this.chatService.getChatById(id);
    if (!room) throw new NotFoundException('Room not found');
    this.server.emit('room', room);
  }
}
