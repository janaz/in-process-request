import { RequestListener } from "http"

import {
  MockResponse,
  MockRequestOptions,
  createMockRequest,
  createMockResponse,
} from "./httpMock"
import { HapiListener } from "./hapiListener"
import nestHandler from "./nestHandler"
import fastifyHandler from "./fastifyHandler"
import fastifyV4Handler from "./fastifyV4Handler"

declare namespace handler {
  type InProcessRequestOptions = MockRequestOptions
  type InProcessResponse = MockResponse
}

const handler = (app: RequestListener) => (reqOptions: MockRequestOptions) => {
  return new Promise<MockResponse>((resolve) => {
    const req = createMockRequest(reqOptions)
    const res = createMockResponse(req)
    res.once("__mock_response", resolve)
    app(req, res)
  })
}

handler.HapiListener = HapiListener
handler.nestHandler = nestHandler
handler.fastifyHandler = fastifyHandler
handler.fastifyV4Handler = fastifyV4Handler

export = handler
