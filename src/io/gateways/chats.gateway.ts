import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { MySocket } from 'src/common/custom.type';

@WebSocketGateway({ namespace: 'chats' })
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger('ws: /chats');
  private readonly defaultNickname = 'Anonymous';

  handleConnection(@ConnectedSocket() socket: MySocket, ...args: any[]) {
    socket['nickname'] = this.defaultNickname;
    this.logger.log(`[ ${socket.id} ] connected`);

    socket.onAny((event: string) => {
      const user =
        socket.nickname === this.defaultNickname ? socket.id : socket.nickname;

      let logMessage = '';
      switch (event) {
        case '':
          logMessage = `[ ${socket.id} => ${socket.nickname} ] ${event}`;
          break;

        default:
          // if (Object.values(SOCKET_EVENTS).includes(event as any))
          //   logMessage = `[ ${user} ] Unknown event: ${event}`;
          logMessage = `[ ${user} ] ${event}: ${args}`;
          break;
      }
      this.logger.log(logMessage);
    });
  }
  handleDisconnect(@ConnectedSocket() socket: MySocket) {
    this.logger.log(
      `[ ${
        socket.nickname === this.defaultNickname ? socket.id : socket.nickname
      } ] disconnected`,
    );
  }

  @SubscribeMessage('')
  handleMessage(@ConnectedSocket() socket: MySocket, payload: any): string {
    return 'Hello world!';
  }
}
