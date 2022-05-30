import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Document, Types } from 'mongoose';
import { Room } from './room.model';
import { User } from './user.model';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Message extends Document {
  @Prop({
    type: {
      _id: { type: Types.ObjectId, required: true, ref: 'users' },
      nickname: { type: String, required: true, unique: true },
      sid: { type: String, required: true, unique: true },
    },
  })
  @IsNotEmpty()
  user: User;

  @Prop({
    type: {
      _id: { type: Types.ObjectId, required: true, ref: 'rooms' },
      roomName: { type: String, required: true, unique: true },
    },
  })
  @IsNotEmpty()
  room: Room;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  message: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
