import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../auth/auth.module.js';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1] ||
        (client.handshake.query?.token as string);

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      const userId = payload.sub;
      client.data.userId = userId;

      // Join room for this specific user
      const roomName = `user_${userId}`;
      client.join(roomName);
      console.log(`[WebSocket] Client ${client.id} connected & joined ${roomName}`);
    } catch (err) {
      console.error('[WebSocket] Unauthorized socket connection attempt');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[WebSocket] Client ${client.id} disconnected`);
  }

  sendNotificationToUser(userId: number, notification: any) {
    const roomName = `user_${userId}`;
    this.server.to(roomName).emit('new_notification', notification);
    console.log(`[WebSocket] Emitted new_notification to ${roomName}:`, notification.title);
  }
}
