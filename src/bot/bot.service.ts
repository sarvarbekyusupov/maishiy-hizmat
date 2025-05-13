import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Bot } from "./model/bot.model";
import { Master } from "./model/master.model";
import { InjectBot } from "nestjs-telegraf";
import { Context, Markup, Telegraf } from "telegraf";
import { BOT_NAME } from "../constants";

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    @InjectModel(Master) private readonly masterModel: typeof Master,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>
  ) {}

  async start(ctx: Context) {
    const user_id = ctx.from?.id;
    if (!user_id) return;

    const master = await this.masterModel.findByPk(user_id);
    if (!master) {
      await this.masterModel.create({
        user_id,
        username: ctx.from?.username || "",
        first_name: ctx.from?.first_name || "",
        last_name: ctx.from?.last_name || "",
        lang: ctx.from?.language_code || "uz",
      });

      await ctx.replyWithHTML(
        `Iltimos, <b>Telefon raqamingizni yuboring</b>`,
        Markup.keyboard([
          [Markup.button.contactRequest("📱 Telefon raqamni yuborish")],
        ])
          .oneTime()
          .resize()
      );
    } else if (!master.phone_number) {
      await ctx.replyWithHTML(
        `Iltimos, <b>Telefon raqamingizni yuboring</b>`,
        Markup.keyboard([
          [Markup.button.contactRequest("📱 Telefon raqamni yuborish")],
        ])
          .oneTime()
          .resize()
      );
    } else {
      await ctx.replyWithHTML(`Siz allaqachon ro'yxatdan o'tgansiz ✅`);
    }
  }

  async onContact(ctx: Context) {
    const user_id = ctx.from?.id;
    if (!user_id || !("contact" in ctx.message!)) return;

    const master = await this.masterModel.findByPk(user_id);
    if (!master) {
      await ctx.replyWithHTML(
        `Iltimos, <b>/start</b> buyrug'ini bosing`,
        Markup.keyboard([["/start"]])
          .oneTime()
          .resize()
      );
      return;
    }

    if (master.phone_number) {
      await ctx.replyWithHTML(`Siz avval ro'yxatdan o'tgansiz ✅`);
      return;
    }

    if (ctx.message.contact.user_id !== user_id) {
      await ctx.replyWithHTML(
        `Iltimos, <b>faqat o'zingizning raqamingizni yuboring</b>`,
        Markup.keyboard([
          [Markup.button.contactRequest("📱 Telefon raqamni yuborish")],
        ])
          .oneTime()
          .resize()
      );
      return;
    }

    let phone = ctx.message.contact.phone_number;
    if (!phone.startsWith("+")) {
      phone = "+" + phone.replace(/\D/g, "");
    }

    master.phone_number = phone;
    await master.save();

    await ctx.replyWithHTML(
      `✅ Tabriklaymiz! Siz usta sifatida ro'yxatdan o'tdingiz.`,
      Markup.removeKeyboard()
    );
  }
}
