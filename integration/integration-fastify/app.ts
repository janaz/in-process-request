import fastify, { FastifyServerOptions } from 'fastify';
import cookie from 'fastify-cookie';
import fastifyStatic from 'fastify-static';
import path from 'path';
import fastifyHandler from '../../src/fastifyHandler'

const build = (options: FastifyServerOptions) => {
  const app = fastify(options)
  app.register(cookie)
  app.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    prefix: '/public/',
  })

  app.get('/', async (_request, reply) => {
    reply
    .code(200)
    .setCookie('foo', 'bar')
    .setCookie('bar', 'foo')
    .header('Content-Type', 'application/json; charset=utf-8')
    .send({ hello: 'world' })
  })

  return app;
}

export default fastifyHandler(build);
