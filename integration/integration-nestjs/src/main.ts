import { NestFactory } from "@nestjs/core"
import { Module, Get, Controller, Render, Injectable } from "@nestjs/common"
import { NestExpressApplication } from "@nestjs/platform-express"
import path from "path"
import nestHandler from "../../../src/nestHandler"

@Injectable()
class AppService {
  getHello(): string {
    return "Hello"
  }
}

@Controller()
class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render("index")
  render() {
    const message = this.appService.getHello()
    return { message }
  }
}

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
class AppModule {}

const getApp = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.setViewEngine("hbs")
  app.setBaseViewsDir(path.join(__dirname, "../views"))
  return await nestHandler(app)
}

export default getApp
