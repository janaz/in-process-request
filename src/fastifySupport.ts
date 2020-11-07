import {Server, RequestListener} from 'http'

interface MockServer extends Server {
  __handler: RequestListener
}

export const serverFactory = (handler: RequestListener): MockServer => {
  return {
    __handler: handler,
    on: () => {},
    once: () => {},
    removeListener:() => {},
    address: () => "0.0.0.0",
    listen: (_: unknown, cb: () => void) => {
      cb();
    },
  } as any;
}

export const fastifyHandler = (fastifyApp: any): () => Promise<RequestListener> => () => fastifyApp.listen(0).then(() => fastifyApp.server.__handler)
