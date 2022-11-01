import { NestFactory } from "@nestjs/core"
import { Module, Get, Controller } from "@nestjs/common"
import { NestExpressApplication } from "@nestjs/platform-express"
import nestHandler from "../../../src/nestHandler"

@Controller()
class AppController {
  @Get()
  render() {
    return { hello: "world" }
  }
}

@Module({
  imports: [],
  controllers: [AppController],
})
class AppModule {}

const getApp = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  return await nestHandler(app)
}

export default getApp
