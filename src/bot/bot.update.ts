import {
  Action,
  Command,
  Ctx,
  Hears,
  On,
  Start,
  Update,
} from "nestjs-telegraf";
import { Context, Markup } from "telegraf";
import { BotService } from "./bot.service";
import { Logger } from "@nestjs/common";

@Update()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    this.logger.log("/start command received");
    return this.botService.start(ctx);
  }

  // @Command("main")
  // async onMain(@Ctx() ctx: Context) {
  //   return this.botService.sendMainMenu(ctx);
  // }

  // @Command("stop")
  // async onStop(@Ctx() ctx: Context) {
  //   return this.botService.onStop(ctx);
  // }

  // @Command("inline")
  // async onInline(@Ctx() ctx: Context) {
  //   return this.botService.showInlineButtons(ctx);
  // }

  @Command("help")
  async onHelp(@Ctx() ctx: Context) {
    return ctx.reply("Ertaga yordam beraman 😄");
  }

  @Hears("\ud83d\udccb Buyurtma berish")
  async onOrder(@Ctx() ctx: Context) {
    return ctx.reply("Buyurtma berish bo‘limiga xush kelibsiz!");
  }

  @Hears("\u2139\ufe0f Ma'lumot olish")
  async onInfo(@Ctx() ctx: Context) {
    return ctx.reply("Siz bu bot orqali buyurtma bera olasiz.");
  }

  @Hears("\ud83d\udcde Admin bilan bog'lanish")
  async onAdminContact(@Ctx() ctx: Context) {
    return ctx.reply("Admin: @your_admin_username");
  }

  @On("contact")
  async onContact(@Ctx() ctx: Context) {
    return this.botService.onContact(ctx);
  }

  // @On("location")
  // async onLocation(@Ctx() ctx: Context) {
  //   return this.botService.onLocation(ctx);
  // }

  // @On("photo")
  // async onPhoto(@Ctx() ctx: Context) {
  //   return this.botService.onPhoto(ctx);
  // }

  // @On("video")
  // async onVideo(@Ctx() ctx: Context) {
  //   return this.botService.onVideo(ctx);
  // }

  // @On("sticker")
  // async onSticker(@Ctx() ctx: Context) {
  //   return this.botService.onSticker(ctx);
  // }

  // @On("voice")
  // async onVoice(@Ctx() ctx: Context) {
  //   return this.botService.onVoice(ctx);
  // }

  // @On("text")
  // async onText(@Ctx() ctx: Context) {
  //   return this.botService.onText(ctx);
  // }

  // @Action("btn1")
  // async handleBtn1(@Ctx() ctx: Context) {
  //   await ctx.answerCbQuery();
  //   return ctx.reply("Siz 1-ni tanladingiz.");
  // }

  // @Action("btn2")
  // async handleBtn2(@Ctx() ctx: Context) {
  //   await ctx.answerCbQuery();
  //   return ctx.reply("Siz 2-ni tanladingiz.");
  // }

  // @Action("btn3")
  // async handleBtn3(@Ctx() ctx: Context) {
  //   await ctx.answerCbQuery();
  //   return ctx.reply("Siz 3-ni tanladingiz.");
  // }

  // @Action("btn4")
  // async handleBtn4(@Ctx() ctx: Context) {
  //   await ctx.answerCbQuery();
  //   return ctx.reply("Siz 4-ni tanladingiz.");
  // }

  // @Action("btn5")
  // async handleBtn5(@Ctx() ctx: Context) {
  //   await ctx.answerCbQuery();
  //   return ctx.reply("Siz 5-ni tanladingiz.");
  // }

  // @Action("btn6")
  // async handleBtn6(@Ctx() ctx: Context) {
  //   await ctx.answerCbQuery();
  //   return ctx.reply("Siz 6-ni tanladingiz.");
  // }

  @On("message")
  async onMessage(@Ctx() ctx: Context) {
    this.logger.debug("Message received", ctx.message);
  }
}
