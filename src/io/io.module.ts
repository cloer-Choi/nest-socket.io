import { Module } from '@nestjs/common';
import { ChatsGateway } from './gateways/chats.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/models/user.model';
import { Message, MessageSchema } from 'src/models/message.model';
import { Room, RoomSchema } from 'src/models/room.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Room.name, schema: RoomSchema },
    ]),
  ],
  providers: [ChatsGateway],
})
export class IoModule {}
