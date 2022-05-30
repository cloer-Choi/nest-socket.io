import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Document } from 'mongoose';

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class User extends Document {
  @Prop({ unique: true, required: true })
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @Prop({ unique: true, required: true })
  @IsNotEmpty()
  @IsString()
  sid: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
