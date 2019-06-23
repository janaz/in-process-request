import handler from '../../../src/handler';
import app = require('../app');

const H = handler(app as any);

describe('handler function', () => {
  it('returns 404 if not found', () => {
    const reqOptions = {
      method: 'GET',
      path: '/notfound',
    };
    return H(reqOptions).then((res) => {
      expect(res.statusCode).toEqual(404);
    });
  })
})
