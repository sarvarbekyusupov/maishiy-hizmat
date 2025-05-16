import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Bot } from "./model/bot.model";
import { Master } from "./model/master.model";
import { Customer } from "./model/customer.model";
import { InjectBot } from "nestjs-telegraf";
import { Context, Markup, Telegraf } from "telegraf";
import { BOT_NAME } from "../constants";

@Injectable()
export class BotService {
  /**
   * Validates and formats a phone number to E.164 (adds + if missing).
   * @param phone The phone number to validate.
   */
  private formatPhoneNumber(phone: string): string {
    if (!phone.startsWith("+")) {
      return "+" + phone.replace(/\D/g, "");
    }
    return phone;
  }

  /**
   * Sends a request for the user's phone number with a custom keyboard.
   * @param ctx Telegram context
   * @param type 'usta' or 'mijoz'
   */
  private async requestPhone(ctx: Context, type: 'usta' | 'mijoz') {
    await ctx.replyWithHTML(
      `Iltimos, <b>Telefon raqamingizni yuboring</b>`,
      Markup.keyboard([
        [Markup.button.contactRequest("\ud83d\udcf1 Telefon raqamni yuborish")],
      ]).oneTime().resize()
    );
  }

  /**
   * Sends a registration complete message and removes the keyboard.
   * @param ctx Telegram context
   * @param type 'usta' or 'mijoz'
   */
  private async sendRegistrationComplete(ctx: Context, type: 'usta' | 'mijoz') {
    const msg = type === 'usta'
      ? `\u2705 Tabriklaymiz! Siz usta sifatida ro'yxatdan o'tdingiz.`
      : `\u2705 Tabriklaymiz! Siz mijoz sifatida ro'yxatdan o'tdingiz.`;
    await ctx.replyWithHTML(msg, Markup.removeKeyboard());
  }

  /**
   * Sends a message that the user is already registered.
   * @param ctx Telegram context
   * @param type 'usta' or 'mijoz'
   */
  private async sendAlreadyRegistered(ctx: Context, type: 'usta' | 'mijoz') {
    const msg = type === 'usta'
      ? `Siz allaqachon usta sifatida ro'yxatdan o'tgansiz \u2705`
      : `Siz allaqachon mijoz sifatida ro'yxatdan o'tgansiz \u2705`;
    await ctx.replyWithHTML(msg, Markup.removeKeyboard());
  }

  /**
   * Handles errors and logs them.
   * @param ctx Telegram context
   * @param error The error object
   * @param userMessage Optional message for the user
   */
  private async handleError(ctx: Context, error: any, userMessage?: string) {
    console.error(error);
    await ctx.reply(userMessage || 'Xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.');
  }

  /**
   * Handles unexpected messages.
   * @param ctx Telegram context
   */
  async handleUnexpected(ctx: Context) {
    await ctx.reply('Nomaʼlum buyruq. Iltimos, /start buyrugʻini bosing yoki asosiy menyudan foydalaning.');
  }
  constructor(
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    @InjectModel(Master) private readonly masterModel: typeof Master,
    @InjectModel(Customer) private readonly customerModel: typeof Customer,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>
  ) {}

  /**
   * Starts the onboarding by asking user type.
   * @param ctx Telegram context
   */
  async start(ctx: Context) {
    await ctx.reply(
      "Siz mijozmisiz yoki usta?",
      Markup.keyboard([["Mijoz"], ["Usta"]]).oneTime().resize()
    );
  }

  /**
   * Handles user type selection and registration branching.
   * @param ctx Telegram context
   * @param userType 'Mijoz' or 'Usta'
   */
  async handleUserType(ctx: Context, userType: string) {
    try {
      const user_id = ctx.from?.id;
      if (!user_id) return;
      if (userType === "Usta") {
        let master = await this.masterModel.findByPk(user_id);
        if (!master) {
          master = await this.masterModel.create({
            user_id,
            username: ctx.from?.username || "",
            first_name: ctx.from?.first_name || "",
            last_name: ctx.from?.last_name || "",
            lang: ctx.from?.language_code || "uz",
          });
        }
        if (!master.phone_number) {
          await this.requestPhone(ctx, 'usta');
        } else {
          await this.sendAlreadyRegistered(ctx, 'usta');
        }
      } else if (userType === "Mijoz") {
        let customer = await this.customerModel.findByPk(user_id);
        if (!customer) {
          customer = await this.customerModel.create({
            user_id,
            username: ctx.from?.username || "",
            first_name: ctx.from?.first_name || "",
            last_name: ctx.from?.last_name || "",
            lang: ctx.from?.language_code || "uz",
          });
        }
        if (!customer.phone_number) {
          await this.requestPhone(ctx, 'mijoz');
        } else {
          await this.sendAlreadyRegistered(ctx, 'mijoz');
        }
      }
    } catch (error) {
      await this.handleError(ctx, error);
    }
  }

  /**
   * Handles phone number registration for both master and customer.
   * @param ctx Telegram context
   */
  async onContact(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      if (!user_id || !("contact" in ctx.message!)) return;

      // Check if user is master and needs phone registration
      const master = await this.masterModel.findByPk(user_id);
      if (master && !master.phone_number) {
        if (ctx.message.contact.user_id !== user_id) {
          await ctx.replyWithHTML(
            `Iltimos, <b>faqat o'zingizning raqamingizni yuboring</b>`,
            Markup.keyboard([
              [Markup.button.contactRequest("\ud83d\udcf1 Telefon raqamni yuborish")],
            ]).oneTime().resize()
          );
          return;
        }
        master.phone_number = this.formatPhoneNumber(ctx.message.contact.phone_number);
        await master.save();
        await this.sendRegistrationComplete(ctx, 'usta');
        return;
      }

      // Check if user is customer and needs phone registration
      const customer = await this.customerModel.findByPk(user_id);
      if (customer && !customer.phone_number) {
        if (ctx.message.contact.user_id !== user_id) {
          await ctx.replyWithHTML(
            `Iltimos, <b>faqat o'zingizning raqamingizni yuboring</b>`,
            Markup.keyboard([
              [Markup.button.contactRequest("\ud83d\udcf1 Telefon raqamni yuborish")],
            ]).oneTime().resize()
          );
          return;
        }
        customer.phone_number = this.formatPhoneNumber(ctx.message.contact.phone_number);
        await customer.save();
        await this.sendRegistrationComplete(ctx, 'mijoz');
        return;
      }

      // Default: already registered or unknown state
      await ctx.replyWithHTML(`Siz allaqachon ro'yxatdan o'tgansiz \u2705`);
    } catch (error) {
      await this.handleError(ctx, error);
    }
  }

  /**
   * Shows the main menu for master users.
   * @param ctx Telegram context
   */
  async showMasterMenu(ctx: Context) {
    await ctx.reply(
      'Usta menyusi:',
      Markup.keyboard([
        ['\u001f3c6 Reytingni ko‘rish'],
        ['\u001f527 Ma’lumotlarni o‘zgartirish'],
        ['\u001f465 Mijozlar ro‘yxati']
      ]).resize()
    );
  }

  /**
   * Handles master rating display (stub).
   */
  async showMasterRating(ctx: Context) {
    await ctx.reply('Sizning reytingingiz: ⭐️⭐️⭐️⭐️⭐️ (demo)');
  }

  /**
   * Handles master info change (stub).
   */
  async changeMasterInfo(ctx: Context) {
    await ctx.reply('Ma’lumotlarni o‘zgartirish funksiyasi tez orada qo‘shiladi.');
  }

  /**
   * Handles listing of customers for the master (stub).
   */
  async listMasterCustomers(ctx: Context) {
    await ctx.reply('Mijozlar ro‘yxati funksiyasi tez orada qo‘shiladi.');
  }
}
