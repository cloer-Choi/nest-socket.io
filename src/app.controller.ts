import { All, Controller, Get, Param, Redirect, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  getIndex() {
    const rooms = [
      { roomName: 'room1', roomId: '111111' },
      { roomName: 'room2', roomId: '222222' },
      { roomName: 'room3', roomId: '333333' },
      { roomName: 'room4', roomId: '444444' },
      { roomName: 'room5', roomId: '5' },
    ];
    return { rooms };
  }

  @Get('rooms/:roomName')
  @Render('chat')
  getRoom(@Param('roomName') roomName: string) {
    const chats = ['Hello!', 'Hi~~', 'how are you?'];
    return { roomName, chats };
  }

  @All('*')
  @Redirect('/')
  notFoundExeption() {
    return;
  }
}
