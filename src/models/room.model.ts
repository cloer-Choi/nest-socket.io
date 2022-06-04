import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Document, Types } from 'mongoose';
import { User } from './user.model';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Room extends Document {
  @Prop({ unique: true, required: true })
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @Prop({ unique: true, required: true })
  @IsNotEmpty()
  @IsString()
  roomName: string;

  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, required: true, ref: 'users' },
        nickname: { type: String, required: true, unique: true },
      },
    ],
    required: true,
  })
  @IsNotEmpty()
  members: User[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
