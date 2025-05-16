import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bot } from './model/bot.model';
import { Master } from './model/master.model';
import { Customer } from './model/customer.model';

@Module({
  imports:[SequelizeModule.forFeature([Bot, Master, Customer])],
  controllers: [],
  providers: [BotService, BotUpdate],
  exports:[BotService]
})
export class BotModule {}
