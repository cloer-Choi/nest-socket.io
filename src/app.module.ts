import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { IoModule } from './io/io.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), IoModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
