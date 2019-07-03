import { RequestListener} from 'http';

import { MockResponse, MockRequestOptions, createMockRequest, createMockResponse} from './httpMock';

declare namespace handler {
  type InProcessRequestOptions = MockRequestOptions;
  type InProcessResponse = MockResponse;
}

const handler = (app: RequestListener) => (reqOptions: MockRequestOptions) => {
  return new Promise<MockResponse>((resolve) => {
    const req = createMockRequest(reqOptions);
    const res = createMockResponse(req);
    res.once('_response', resolve);
    app(req, res);
  });
}

handler.default = handler;

export = handler;
