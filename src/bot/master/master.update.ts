import { Action, Command, Ctx, Hears, Start, Update } from "nestjs-telegraf";
import { Markup, Context } from "telegraf";
import { BotService } from "../bot.service";
import { MasterService } from "./master.service";

@Update()
export class MasterUpdate {
  constructor(
    private readonly botService: BotService,
    private readonly masterService: MasterService
  ) {}

  @Command("registerMaster")
  async onCar(@Ctx() ctx: Context) {
    return this.masterService.registerMaster(ctx);
  }
}
