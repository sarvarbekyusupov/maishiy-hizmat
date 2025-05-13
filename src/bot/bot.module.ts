import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bot } from './model/bot.model';
import { Master } from './model/master.model';

@Module({
  imports:[SequelizeModule.forFeature([Bot, Master])],
  controllers: [],
  providers: [BotService, BotUpdate],
  exports:[BotService]
})
export class BotModule {}
