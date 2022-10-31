import fastify, { FastifyServerOptions } from 'fastify';
import cookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fastifyV4Handler from '../../src/fastifyV4Handler'

const app = fastify({})
app.register(cookie)
app.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
})

app.get('/', (_request, reply) => {
  reply
  .code(200)
  .setCookie('foo', 'bar')
  .setCookie('bar', 'foo')
  .header('Content-Type', 'application/json; charset=utf-8')
  .send({ hello: 'world' })
  return reply
})

export default fastifyV4Handler(app)
