
const Hapi = require('@hapi/hapi');
import { HapiListener } from '../../src/httpMock';

const myListener = new HapiListener()

const server = Hapi.server({
  listener: myListener
});

server.route({
    method: 'GET',
    path: '/',
    handler: (_request: any, h: any) => {
        h.state('username', 'tom');
        return h.response('Hello');
    }
});

const app = async () => {
  await server.start()
  return myListener.handler
}

export = app
