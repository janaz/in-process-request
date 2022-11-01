import {
  IncomingHttpHeaders,
  OutgoingHttpHeaders,
  ServerResponse,
  IncomingMessage,
} from "http"

type Chunk = string | Buffer | undefined
type Callback = (error: Error | null | undefined) => void
interface SocketMock {
  readonly remotePort: number
  readonly remoteAddress: string
  readonly encrypted: boolean
  readonly end: () => void
  readonly destroy: (e?: Error) => void
  readonly readable: boolean
  readonly on: (event: string, handler: () => void) => void
  readonly removeListener: (event: string, handler: () => void) => void
}

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
  body: Buffer
  isUTF8: boolean
  statusCode: number
  statusMessage: string
  headers: OutgoingHttpHeaders
}

interface ObjectWithStringKeys<T> {
  [key: string]: T
}

const keysToLowerCase = <T>(
  headers: ObjectWithStringKeys<T>
): ObjectWithStringKeys<T> => {
  const lowerCaseHeaders: ObjectWithStringKeys<T> = {}
  Object.keys(headers).forEach((k) => {
    lowerCaseHeaders[k.toLowerCase()] = headers[k]
  })
  return lowerCaseHeaders
}

const getRawHeaders = (headers: IncomingHttpHeaders): string[] => {
  const rawHeaders: string[] = []
  Object.entries(headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        rawHeaders.push(key)
        rawHeaders.push(v)
      })
    } else if (typeof value === "string") {
      rawHeaders.push(key)
      rawHeaders.push(value)
    }
  })
  return rawHeaders
}

const toBuffer = (param?: string | Buffer, encoding?: string): Buffer => {
  if (Buffer.isBuffer(param)) {
    return param
  } else if (typeof param === "string") {
    return Buffer.from(param, encoding as BufferEncoding)
  } else {
    return Buffer.alloc(0)
  }
}

const isUTF8 = (headers: OutgoingHttpHeaders): boolean => {
  if (headers["content-encoding"]) {
    return false
  }
  const contentType = (headers["content-type"] as string) || ""
  return contentType.match(/charset=(utf-8|"utf-8")$/i) ? true : false
}

export const createMockResponse = (req: IncomingMessage): ServerResponse => {
  const res = new ServerResponse(req)
  res.shouldKeepAlive = false
  const chunks: Buffer[] = []
  const addChunk = (chunk: Chunk, encoding?: string) =>
    chunks.push(toBuffer(chunk, encoding))
  const headers: OutgoingHttpHeaders = {}

  res.write = (
    chunk: Chunk,
    encodingOrCallback?: string | Callback,
    maybeCallback?: Callback
  ) => {
    const encoding: string | Callback | undefined =
      typeof encodingOrCallback === "string" ? encodingOrCallback : undefined
    const callback: Callback | undefined =
      typeof maybeCallback === "function"
        ? maybeCallback
        : typeof encodingOrCallback === "function"
        ? encodingOrCallback
        : undefined
    addChunk(chunk, encoding)
    if (callback) {
      callback(null)
    }
    return true
  }

  res.setHeader("___internal___", "___internal___")

  const originalSetHeader = res.setHeader.bind(res)
  res.setHeader = (
    name: string,
    value: string | number | string[]
  ): ServerResponse => {
    originalSetHeader(name, value)
    const strVal: string | string[] =
      typeof value === "number" ? String(value) : value
    headers[name.toLowerCase()] = strVal
    return res
  }

  res.end = (
    chunkOrCallback?: Chunk | Callback,
    encodingOrCallback?: string | Callback,
    maybeCallback?: Callback
  ): ServerResponse => {
    let encoding: string | undefined = undefined
    let chunk: Chunk | undefined = undefined
    let callback: Callback | undefined =
      typeof chunkOrCallback === "function" ? chunkOrCallback : undefined
    if (!callback) {
      chunk = chunkOrCallback as Chunk | undefined
      callback =
        typeof encodingOrCallback === "function"
          ? encodingOrCallback
          : undefined
    }
    if (!callback) {
      encoding = encodingOrCallback as string | undefined
      callback = maybeCallback
    }
    addChunk(chunk, encoding)
    const body = Buffer.concat(chunks)
    const response: MockResponse = {
      body,
      isUTF8: isUTF8(headers),
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      headers,
    }
    res.emit("prefinish")
    res.emit("finish")
    res.emit("__mock_response", response)
    if (callback) {
      callback(null)
    }
    return res
  }

  return res
}

export const createMockRequest = (
  opts: MockRequestOptions
): IncomingMessage => {
  const socket: SocketMock = {
    remoteAddress: opts.remoteAddress || "123.123.123.123",
    remotePort: opts.remotePort || 5757,
    encrypted: opts.ssl ? true : false,
    end: () => {},
    destroy: () => {},
    readable: true,
    on: () => undefined,
    removeListener: () => undefined,
  }
  const body = toBuffer(opts.body)
  const contentLength = Buffer.byteLength(body)

  const req = new IncomingMessage(socket as any)

  req.method = (opts.method || "GET").toUpperCase()
  req.url = opts.path
  req.headers = keysToLowerCase(opts.headers || {})
  req.rawHeaders = getRawHeaders(opts.headers || {})
  req.httpVersionMajor = 1
  req.httpVersionMinor = 1
  req.httpVersion = "1.1"

  if (contentLength > 0 && !req.headers["content-length"]) {
    req.headers["content-length"] = contentLength.toString()
    req.rawHeaders.push("content-length")
    req.rawHeaders.push(contentLength.toString())
  }

  req._read = () => {
    if (contentLength > 0) {
      req.push(body)
    }
    req.push(null)
  }
  return req
}
