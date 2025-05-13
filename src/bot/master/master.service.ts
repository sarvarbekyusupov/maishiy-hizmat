import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { InjectBot } from "nestjs-telegraf";
import { Context, Markup, Telegraf } from "telegraf";
import { BOT_NAME } from "../../constants";
import { Bot } from "../model/bot.model";
import { Master } from "../model/master.model";

@Injectable()
export class MasterService {
  constructor(
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    @InjectModel(Master) private readonly masterModel: typeof Master,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>
  ) {}

  async registerMaster(ctx: Context) {
    try {
      const userId = ctx.from?.id;
      const user = await this.botModel.findByPk(userId);

      if (!user) {
        await ctx.replyWithHTML(`Iltimos, <b>/start</b> ni bosing`, {
          ...Markup.keyboard([["/start"]])
            .oneTime()
            .resize(),
        });
        return;
      }

      await this.masterModel.create({
        user_id: userId!,
        last_state: "name", // boshlang'ich holat
      });

      await ctx.replyWithHTML(
        "👨‍🔧 Usta bo‘lib ro‘yxatdan o‘tish\n\nIsmingizni kiriting:",
        {
          ...Markup.removeKeyboard(),
        }
      );
    } catch (error) {
      console.error("Usta ro'yxatdan o'tishda xatolik:", error);
      await ctx.reply("Xatolik yuz berdi. Iltimos, keyinroq urinib ko‘ring.");
    }
  }
}
