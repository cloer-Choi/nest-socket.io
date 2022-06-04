import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { MySocket } from 'src/common/custom.type';
import { CHATS_EVENTS } from 'src/common/events';
import {
  CreateRoomDto,
  EnterRoomDto,
  LeaveRoomDto,
  LogInDto,
  NewMessageDto,
} from 'src/common/socket.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/models/user.model';
import { Model } from 'mongoose';
import { Room } from 'src/models/room.model';
import { Message } from 'src/models/message.model';

@WebSocketGateway({ namespace: 'chats' })
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // @WebSocketServer()
  // private readonly chatNsp: Namespace; // chatNsp { name, server, sockets, adapter, ... }
  private readonly logger = new Logger('ws: /chats');
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Room.name) private readonly roomModel: Model<Room>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  handleConnection(@ConnectedSocket() socket: MySocket) {
    this.logger.log(`[ ${socket.id} ] connected`);

    socket.onAny((event: string) => {
      this.logger.log(`[ ${socket?.nickname ?? socket.id} ] ${event}`);
      // this.robby.emit('test_event', 'robby.emit'); //: to Nsp including me
      // socket.broadcast.emit('test_event', 'socket.broadcast.emit'); //: to Nsp without me
      // this.robby.server.of('/chats').emit('test_event', 'this.robby.server.of("/chats").emitrobby.emit'); //: to another Nsp
    });
  }
  async handleDisconnect(@ConnectedSocket() socket: MySocket) {
    this.logger.log(`[ ${socket?.nickname ?? socket.id} ] disconnected`);
    // TODO: providerDeleteUser
    await this.userModel.deleteOne({ sid: socket.id });
  }

  @SubscribeMessage(CHATS_EVENTS.LOGIN)
  async onLogIn(
    @ConnectedSocket() socket: MySocket,
    @MessageBody() { nickname }: LogInDto,
  ) {
    const doesUserExist = await this.userModel.exists({ nickname });
    if (doesUserExist)
      return {
        isSuccess: false,
        reason: `A user with the nickname "${nickname}" already exists`,
      };

    socket['nickname'] = nickname;
    this.logger.log(`[ ${socket.id} => ${nickname}]`);
    await this.userModel.create({ nickname, sid: socket.id });
    return { isSuccess: true };
  }

  @SubscribeMessage(CHATS_EVENTS.LOGOUT)
  async onLogOut(@ConnectedSocket() socket: MySocket) {
    // TODO: providerDeleteUser
    await this.userModel.deleteOne({ sid: socket.id });
    return { isSuccess: true };
  }

  @SubscribeMessage(CHATS_EVENTS.ENTER_ROBBY)
  async onEnterRobby() {
    const rooms = await this.roomModel.find(
      {},
      { _id: false, roomId: true, roomName: true },
    );
    return { isSuccess: true, data: { rooms } };
  }

  @SubscribeMessage(CHATS_EVENTS.CREATE_ROOM)
  async onCreateRoom(
    @ConnectedSocket() socket: MySocket,
    @MessageBody() { roomName }: CreateRoomDto,
  ) {
    const doesRoomExist = await this.roomModel.exists({ roomName });
    if (doesRoomExist)
      return {
        isSuccess: false,
        reason: `A room with the name "${roomName}" already exists`,
      };
    const user = await this.userModel.findOne(
      { sid: socket.id },
      { id: true, nickname: true },
    );
    if (!user) return { isSuccess: false, reason: 'Should be logged in.' };

    const roomId = `${socket.id}${roomName}${Date.now()}`;
    await this.roomModel.create({
      roomId,
      roomName,
      members: [user],
    });
    const room = { roomId, roomName };
    socket.join(roomName);
    socket.broadcast.emit(CHATS_EVENTS.CREATE_ROOM, { room }); // broadcast to Nsp

    return { isSuccess: true, data: { roomId } };
  }

  @SubscribeMessage(CHATS_EVENTS.ENTER_ROOM)
  async onEnterRoom(
    @ConnectedSocket() socket: MySocket,
    @MessageBody() { roomName }: EnterRoomDto,
  ) {
    const user = await this.userModel.findOne(
      { sid: socket.id },
      { id: true, nickname: true },
    );
    if (!user) return { isSuccess: false, reason: 'Should be logged in.' };

    const room = await this.roomModel.findOneAndUpdate(
      { roomName },
      { $push: { members: user } },
    );
    if (!room)
      return {
        isSuccess: false,
        reason: `There is no room with that name '${roomName}'.`,
      };

    socket.join(roomName);
    socket.broadcast
      .to(roomName)
      .emit(CHATS_EVENTS.ENTER_ROOM, { nickname: user.nickname });

    // TODO: get messages "after" I joined
    const chats = await this.messageModel.find({ room: { roomName } });
    return { isSuccess: true, data: { chats } };
  }

  @SubscribeMessage(CHATS_EVENTS.LEAVE_ROOM)
  async onLeaveRoom(
    @ConnectedSocket() socket: MySocket,
    @MessageBody() { roomName }: LeaveRoomDto,
  ) {
    // TODO: guard or filter about nickname validation
    const user = await this.userModel.findOne(
      { sid: socket.id },
      { id: true, nickname: true },
    );
    if (!user) return { isSuccess: false, reason: 'Should be logged in.' };

    const room = await this.roomModel.findOneAndUpdate(
      { roomName },
      { $pull: { members: user } },
    );
    if (!room)
      return {
        isSuccess: false,
        reason: `There is no room with that name '${roomName}'.`,
      };

    socket.broadcast
      .to(roomName)
      .emit(CHATS_EVENTS.LEAVE_ROOM, { nickname: user.nickname });
    socket.leave(roomName);
    if (!socket.nsp.adapter.rooms.has(roomName)) {
      await this.roomModel.deleteOne({ roomName });
      socket.broadcast.emit(CHATS_EVENTS.DELETE_ROOM, { roomId: room.roomId }); // broadcast to Nsp
    }
    return { isSuccess: true };
  }

  @SubscribeMessage(CHATS_EVENTS.NEW_MESSAGE)
  async onNewMessage(
    @ConnectedSocket() socket: MySocket,
    @MessageBody() { roomName, message }: NewMessageDto,
  ) {
    // TODO: guard or filter about nickname validation
    const nickname = socket.nickname;
    if (!nickname) return { isSuccess: false, reason: 'Should be logged in.' };

    const room = await this.roomModel.findOne({ roomName });
    if (!room)
      return {
        isSuccess: false,
        reason: `There is no room with that name '${roomName}'.`,
      };
    const user = await this.userModel.findOne({ nickname });
    if (!user)
      return {
        isSuccess: false,
        reason: `There is no user with that name '${nickname}'.`,
      };

    await this.messageModel.create({ room, user, message });

    socket.broadcast
      .to(roomName)
      .emit(CHATS_EVENTS.NEW_MESSAGE, { chat: { nickname, message } });

    return { isSuccess: true };
  }

  // Provider
  // providerDeleteUser: providerLeaveRoom -> delete user
  // providerLeaveRoom: leave room -> delete empty room -> broadcast to robby

  async providerDeleteUser(socket: MySocket) {
    await this.providerLeaveAllRoom(socket);
    await this.userModel.deleteOne({ sid: socket.id });
  }
  async providerLeaveAllRoom(socket: MySocket) {
    socket.rooms.forEach((room) => {
      socket.broadcast
        .to(room)
        .emit('leave_room', { nickname: socket.nickname });
      socket.leave(room);

      // delete the room if it's empty
      // if(!socket.nsp.adapter.rooms.has(room) && )
    });
  }
}
