import { All, Controller, Get, Param, Redirect, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  getIndex() {
    const rooms = [
      { title: 'room1', id: '111111' },
      { title: 'room2', id: '222222' },
      { title: 'room3', id: '333333' },
      { title: 'room4', id: '444444' },
      { title: 'room5', id: '5' },
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
