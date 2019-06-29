import { IncomingHttpHeaders, OutgoingHttpHeaders, ServerResponse, IncomingMessage } from 'http';
import getHeaders from './getHeaders';

export interface MockRequestOptions {
  method?: string
  path: string
  body?: string | Buffer
  headers?: IncomingHttpHeaders
  remoteAddress?: string
  remotePort?: number
  ssl?: boolean
}

export interface MockResponse {
  body: Buffer,
  isUTF8: boolean,
  statusCode: number,
  headers: OutgoingHttpHeaders,
}

interface ObjectWithStringKeys<T> {
  [key: string]: T;
}

const keysToLowerCase = <T>(headers: ObjectWithStringKeys<T>): ObjectWithStringKeys<T> => {
  const lowerCaseHeaders: ObjectWithStringKeys<T> = {};
  Object.keys(headers).forEach(k => {
    lowerCaseHeaders[k.toLowerCase()] = headers[k];
  });
  return lowerCaseHeaders;
}

const toBuffer = (param: string | Buffer | undefined, encoding?: string): Buffer => {
  if (Buffer.isBuffer(param)) {
    return param;
  } else if (typeof param === 'string') {
    return Buffer.from(param, encoding as BufferEncoding);
  } else {
    return Buffer.alloc(0);
  }
}

export const createMockResponse = (req: IncomingMessage): ServerResponse => {
  const res = new ServerResponse(req);
  const chunks: Buffer[] = [];

  const addChunk = (chunk: string | Buffer | undefined, encoding?: string) => chunks.push(toBuffer(chunk, encoding));

  res.write = (chunk: string | Buffer) => {
    addChunk(chunk);
    return true;
  }

  const overriddenEnd = (chunk: string | Buffer | undefined, encoding?: string): void => {
    addChunk(chunk, encoding);
    const body = Buffer.concat(chunks);
    const headers = Object.assign({}, getHeaders(res));
    const response: MockResponse = {
      body,
      isUTF8: !!(headers['content-type'] as string || '').match(/charset=utf-8/i),
      statusCode: res.statusCode,
      headers,
    }
    res.emit('prefinish');
    res.emit('finish');
    res.emit('_response', response);
  }
  res.end = overriddenEnd as any;
  return res;
}

export const createMockRequest = (opts: MockRequestOptions): IncomingMessage => {
  const req = new IncomingMessage(undefined as any);
  const body = toBuffer(opts.body);
  const contentLength = Buffer.byteLength(body);

  req.method = (opts.method || 'GET').toUpperCase();
  req.url = opts.path;
  req.headers = keysToLowerCase(opts.headers || {});
  req.connection = {
    remoteAddress: opts.remoteAddress || '123.123.123.123',
    remotePort: opts.remotePort || 5757,
    encrypted: opts.ssl ? true : false,
  } as any;

  if (contentLength > 0 && !req.headers['content-length']) {
    req.headers['content-length'] = contentLength.toString();
  }

  let shouldPushData = contentLength > 0;

  req._read = () => {
    if (shouldPushData) {
      req.push(body);
      shouldPushData = false;
    } else {
      req.push(null);
    }
  }
  return req;
}
