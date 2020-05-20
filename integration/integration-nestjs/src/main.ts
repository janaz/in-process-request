import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import nestHandler from '../../../src/nestHandler'
import path from 'path'

const getApp = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setViewEngine('hbs');
  app.setBaseViewsDir(path.join(__dirname, '../views'))
  return await nestHandler(app);
}

export default getApp
