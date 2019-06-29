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

  it('parses JSON body', () => {
    const reqOptions = {
      method: 'GET',
      path: '/reflect',
      headers: {
        'content-type': 'application/json',
        'host': 'www.google.com',
        'origin': 'https://www.google.com',
      },
      ssl: true,
      body: JSON.stringify({hello: "world"})
    };
    return H(reqOptions).then((res) => {
      expect(JSON.parse(res.body.toString())).toEqual({
        body: {
          hello: "world",
        },
        fresh: false,
        host: "www.google.com",
        hostname: "www.google.com",
        ip: "123.123.123.123",
        ips: [],
        origin: "https://www.google.com",
        originalUrl: "/reflect",
        path: "/reflect",
        protocol: "https",
        stale: true,
        subdomains: ["www"],
        url: "/reflect",
      });
    });
  })

  it('parses urlencoded body', () => {
    const reqOptions = {
      method: 'POST',
      path: '/reflect',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: 'hello=world'
    };
    return H(reqOptions).then((res) => {
      expect(JSON.parse(res.body.toString()).body).toEqual({"hello": "world"});
    });
  })

  it('returns static file', () => {
    const reqOptions = {
      method: 'GET',
      path: '/static/file.txt',
    };
    return H(reqOptions).then((res) => {
      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toEqual('text/plain; charset=utf-8');
      expect(res.body.toString()).toEqual('hello world\n');
    });
  })

  it('returns binary static file', () => {
    const reqOptions = {
      method: 'GET',
      path: '/static/file.png',
    };
    return H(reqOptions).then((res) => {
      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toEqual('image/png');
      expect(res.headers['content-length']).toEqual('178');
      expect(res.isUTF8).toEqual(false);
      expect(res.body.toString('base64')).toEqual('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAZElEQVQ4jd2TQQqAMAwEpyV6EP//R19gvLReWgwUK0FBcY4hGZbAhgwLMAORlnQxUynH08lyjwiIGOvgFKwAwhE9Bcd1NjFu8Q2B9/vPJ/iB4N0n1i5EYMu9zZaR0kY1Ig8K6A6mlxIIums73gAAAABJRU5ErkJggg==');
    });
  })

})
