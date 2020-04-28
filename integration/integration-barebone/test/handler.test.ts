import handler from '../../../src/handler';
import app = require('../app');

const H = handler(app as any);

describe('handler function', () => {
  it('returns 200', async () => {
    const reqOptions = {
      method: 'GET',
      path: '/any',
    };
    const res = await H(reqOptions)
    expect(res.statusCode).toEqual(200);
  })

  it('returns JSON body', async () => {
    const reqOptions = {
      method: 'GET',
      path: '/any',
      headers: {
        'X-test-header': 'value',
      }
    };
    const res = await H(reqOptions)
    expect(JSON.parse(res.body.toString())).toEqual({
      method: 'GET',
      url: '/any',
      headers: {
        'x-test-header': 'value'
      },
    });
  })
})
