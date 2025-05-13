import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";

async function start() {
  try {
    const PORT = process.env.PORT || 3030;
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());

    // app.enableCors({
    //   origin: (origin, callback) => {
    //     const allowedOrigigns = [
    //       "http://localhost:8000",
    //       "http://localhost:3000",
    //       "http://skidkachi.uz",
    //       "http://api/skidkachi.uz",
    //       "http://skidkachi.vercel.app",
    //     ];
    //     if (!origin || allowedOrigigns.includes(origin)) {
    //       callback(null, true);
    //     } else {
    //       callback(new BadRequestException("Not allowed by CORS"));
    //     }
    //   },
    //   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    //   credentials: true, //cookie va header
    // });

    app.setGlobalPrefix("api");
    app.useGlobalPipes(new ValidationPipe());

    const config = new DocumentBuilder()
      .setTitle("SKIDKACHI API")
      .setDescription(
        "SKIDKACHI - Discount Management System API Documentation"
      )
      .setVersion("1.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          name: "JWT",
          description: "Enter JWT token",
          in: "header",
        },
        "JWT-auth"
      )
      .addTag(
        "NEST JS, sawgger, send email, bot, sms, token, validation, sequalize"
      )

      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: "none",
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
      },
      customSiteTitle: "Daftarim API Documentation",
    });

    await app.listen(PORT);
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(
      `Swagger documentation available at http://localhost:${PORT}/api`
    );
  } catch (error) {
    console.error("Failed to start the server:", error);
  }
}

start();
