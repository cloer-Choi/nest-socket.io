import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { IoModule } from './io/io.module';
import { Message, MessageSchema } from './models/message.model';
import { Room, RoomSchema } from './models/room.model';
import { User, UserSchema } from './models/user.model';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Room.name, schema: RoomSchema },
    ]),
    IoModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
