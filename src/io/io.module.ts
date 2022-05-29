import { Module } from '@nestjs/common';
import { RobbyGateway } from './gateways/robby.gateway';
// import { ChatsGateway } from './gateways/chats.gateway';

@Module({
  providers: [RobbyGateway],
  exports: [],
})
export class IoModule {}
