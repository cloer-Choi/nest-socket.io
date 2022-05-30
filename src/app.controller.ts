import { All, Controller, Get, Param, Redirect, Render } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './models/message.model';
import { Room } from './models/room.model';

@Controller()
export class AppController {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<Room>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}
  @Get()
  @Render('index')
  async getIndex() {
    const rooms = await this.roomModel.find();
    console.log(rooms);

    return { rooms };
  }

  @Get('rooms/:roomName')
  @Render('chat')
  async getRoom(@Param('roomName') roomName: string) {
    const chats = await this.messageModel.find({ room: { roomName } });
    console.log(chats);
    return { roomName, chats };
  }

  @All('*')
  @Redirect('/')
  notFoundExeption() {
    return;
  }
}
