import fastify from 'fastify';
import { serverFactory, fastifyHandler } from '../../src/fastifySupport'

const app = fastify({ logger: false, serverFactory })

app.get('/', async (_request, reply) => {
  reply
  .code(200)
  .header('Content-Type', 'application/json; charset=utf-8')
  .send({ hello: 'world' })
})

export default fastifyHandler(app);
