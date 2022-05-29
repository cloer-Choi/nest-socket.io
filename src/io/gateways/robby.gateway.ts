import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { MySocket } from '../common/custom.type';
import { ROBBY_EVENTS } from '../common/events';
import { RobbyCreateRoomDto, RobbyDeleteRoomDto } from '../common/socket.dto';

@WebSocketGateway({ namespace: '/robby' })
export class RobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger('ws: /robby');

  @WebSocketServer()
  private readonly robby: Namespace;
  // robby = { namw, server, sockets, adapter, ... }

  handleConnection(@ConnectedSocket() socket: MySocket) {
    this.logger.log(`[ ${socket.id} ] connected`);

    socket.onAny((event: string) => {
      this.logger.log(`[ ${socket.id} ] ${event}`);
      // this.robby.emit('test_event', 'robby.emit');
      // socket.broadcast.emit('test_event', 'socket.broadcast.emit');
      // this.robby.server.of('/chats').emit('test_event', 'this.robby.server.of("/chats").emitrobby.emit');
    });
  }
  handleDisconnect(@ConnectedSocket() socket: MySocket) {
    this.logger.log(`[ ${socket.id} ] disconnected`);
  }

  @SubscribeMessage(ROBBY_EVENTS.CREATE_ROOM)
  handleCreateRoom(
    @ConnectedSocket() socket: MySocket,
    @MessageBody() { roomName }: RobbyCreateRoomDto,
  ) {
    // TODO: check exist of a room named 'roomName'
    socket.join(roomName);

    const roomId = `${socket.id}${roomName}${Date.now()}`;
    socket.broadcast.emit(ROBBY_EVENTS.CREATE_ROOM, { roomId, roomName }); // broadcast to Nsp

    return roomId;
  }

  @SubscribeMessage(ROBBY_EVENTS.DELETE_ROOM)
  handleDeleteRoom(
    @ConnectedSocket() socket: MySocket,
    @MessageBody() { roomId }: RobbyDeleteRoomDto,
  ) {
    socket.broadcast.emit(ROBBY_EVENTS.DELETE_ROOM, { roomId });
    return null;
  }
}
