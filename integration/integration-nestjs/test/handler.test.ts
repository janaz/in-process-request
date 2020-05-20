import handler from '../../../src/handler';
import app from '../src/main';

const appHandler = async () => {
  const myApp = await app();
  return handler(myApp);
}

describe('handler function', () => {
  it('returns 200 for a valid request', async () => {
    const reqOptions = {
      method: 'GET',
      path: '/',
    };
    const H = await appHandler()
    const res = await H(reqOptions);
    expect(res.statusCode).toEqual(200);
    expect(res.headers).toEqual({
      "content-length": "32",
      "content-type": "text/html; charset=utf-8",
      "etag": "W/\"20-PMGptxsAPebYdga8Dk03oBZhGZw\"",
      "x-powered-by": "Express",
    });
    expect(res.body.toString()).toEqual("<html><body>Hello</body></html>\n");
  })

})
