import { ServerResponse, IncomingMessage } from 'http';

const handler = (cb?: () => void) => (request: IncomingMessage, response: ServerResponse) => {
  response.writeHead(200, {
    'Content-Type': 'application/json'
  })
  const responseObj = {
    url: request.url,
    method: request.method,
    headers: request.headers,
  }
  response.write(JSON.stringify(responseObj), 'utf8', cb)
  response.end(cb)
}

export = handler
