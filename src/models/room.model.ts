import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Document } from 'mongoose';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Room extends Document {
  @Prop({ unique: true, required: true })
  @IsNotEmpty()
  @IsString()
  roomName: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
