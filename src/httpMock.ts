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
  statusMessage: string,
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

const getRawHeaders = (headers: IncomingHttpHeaders): string[] => {
  const rawHeaders: string[] = [];
  Object.entries(headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => {
        rawHeaders.push(key);
        rawHeaders.push(v);
      })
    } else if (typeof value === 'string') {
      rawHeaders.push(key);
      rawHeaders.push(value);
    }
  })
  return rawHeaders;
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

const isUTF8 = (headers: OutgoingHttpHeaders): boolean => {
  if (headers['content-encoding']) {
    return false;
  }
  const contentType = headers['content-type'] as string || '';
  return contentType.match(/charset=(utf-8|"utf-8")$/i) ? true : false;
};

export const createMockResponse = (req: IncomingMessage): ServerResponse => {
  const res = new ServerResponse(req);
  res.shouldKeepAlive = false
  const chunks: Buffer[] = [];

  const addChunk = (chunk: string | Buffer | undefined, encoding?: string) => chunks.push(toBuffer(chunk, encoding));

  res.write = (chunk: any, encodingOrCallback?: any, maybeCallback?: any) => {
    const encoding = typeof encodingOrCallback === 'string' ? encodingOrCallback : undefined;
    const callback = typeof maybeCallback === 'function' ? maybeCallback: encodingOrCallback;
    addChunk(chunk, encoding);
    if (typeof callback === 'function') {
      callback();
    }
    return true;
  }

  res.end = (chunk: any, encodingOrCallback?: any, maybeCallback?: any): void => {
    const encoding = typeof encodingOrCallback === 'string' ? encodingOrCallback : undefined;
    const callback = typeof maybeCallback === 'function' ? maybeCallback: encodingOrCallback;
    addChunk(chunk, encoding);
    const body = Buffer.concat(chunks);
    const headers = getHeaders(res);
    const response: MockResponse = {
      body,
      isUTF8: isUTF8(headers),
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      headers,
    }
    res.emit('prefinish');
    res.emit('finish');
    res.emit('__mock_response', response);
    if (typeof callback === 'function') {
      callback();
    }
  }

  return res;
}

export const createMockRequest = (opts: MockRequestOptions): IncomingMessage => {
  const socket = {
    remoteAddress: opts.remoteAddress || '123.123.123.123',
    remotePort: opts.remotePort || 5757,
    encrypted: opts.ssl ? true : false,
  };
  const body = toBuffer(opts.body);
  const contentLength = Buffer.byteLength(body);

  const req = new IncomingMessage(socket as any);

  req.method = (opts.method || 'GET').toUpperCase();
  req.url = opts.path;
  req.headers = keysToLowerCase(opts.headers || {});
  req.rawHeaders = getRawHeaders(opts.headers || {});
  req.httpVersionMajor = 1;
  req.httpVersionMinor = 1;
  req.httpVersion = '1.1';

  if (contentLength > 0 && !req.headers['content-length']) {
    req.headers['content-length'] = contentLength.toString();
    req.rawHeaders.push('content-length')
    req.rawHeaders.push(contentLength.toString())
  }

  req._read = () => {
    if (contentLength > 0) {
      req.push(body);
    }
    req.push(null);
  }
  return req;
}
