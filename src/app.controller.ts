import { All, Controller, Get, Redirect, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  async getIndex() {
    return;
  }

  @All('*')
  @Redirect('/')
  notFoundExeption() {
    return;
  }
}
