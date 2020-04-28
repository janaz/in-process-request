# in-process-request

A node.js library that executes a http handler function in the current process without having to start a local http server.

[![Build Status](https://travis-ci.org/janaz/in-process-request.svg?branch=master)](https://travis-ci.org/janaz/in-process-request)

It supports the following frameworks
* Express.js v3
* Express.js v4
* Express.js v5
* Connect v3
* Koa v2
* More to come...

It has been tested with the following node versions
* v10
* v12
* v13

## Usage

```sh
$ npm install in-process-request
```

```javascript
const inProcessRequest = require('in-process-request');

const handler = inProcessRequest(app);
handler(requestOptions)
  .then((response) => {
    console.log(response);
    // do something with the response
  });
```

`requestOptions` is an object with the following properties
* `path` (**mandatory**) - The request path with optional query string, for example `'/my/resource/123?full=true'`
* `method` - request method, the default is `'GET'`
* `body` - request body, `string` or `Buffer`
* `headers` - request headers object, for example: `{'conent-type': 'application/json'}`
* `remoteAddress` - IP address of the client making the request
* `remotePort` - IP port of the client connection
* `ssl` - Set to `true` to pretend that SSL connection is used. Defaults to `false`

`response` is an object with the following properties
* `statusCode` - status code of the response
* `statusMessage` - status message of the response
* `headers` - object with response headers
* `body` - `Buffer` containing the body
* `isUTF8` - set to `true` if the response is a utf-8 string. In that case `response.body.toString()` can be used to extract the utf-8 string

### Express.js example

```javascript
const inProcessRequest = require('in-process-request')
const express = require('express');

const myApp = express();
myApp.get('/test', (req, res) => {
  res.json({ok: true, a: req.query.a});
});

const myAppHandler = inProcessRequest(myApp);

const requestOptions = {
  path: '/test',
  method: 'GET',
}

myAppHandler(requestOptions).then(response => {
  console.log('Body', response.body);
  console.log('Headers', response.headers);
  console.log('Status Code', response.statusCode);
  console.log('Status Message', response.statusMessage);
  console.log('Is UTF8 body?', response.isUTF8);
})
```


## Usage in integration tests

### Mocha / Chai

```javascript
const { expect } = require('chai');
const inProcessRequest = require('in-process-request')
const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.set('X-Hello', 'world');
  res.json({ok: true, a: req.query.a})
});

describe('handler', () => {
  it('responds with 200, custom header and query param in JSON body', () => {
    const reqOptions = {
      path: '/test?a=xyz',
      method: 'GET',
    }
    return inProcessRequest(app)(reqOptions).then(response => {
      const json = JSON.parse(response.body.toString())
      expect(json).to.deep.equal({ok: true, a: 'xyz'});
      expect(response.headers['x-hello']).to.equal('world');
      expect(response.statusCode).to.equal(200);
      expect(response.isUTF8).to.be.true;
    });
  });

  it('responds with 200, custom header and query param in JSON body', (done) => {
    const reqOptions = {
      path: '/test?a=xyz',
      method: 'GET',
    }
    inProcessRequest(app)(reqOptions).then(response => {
      const json = JSON.parse(response.body.toString())
      expect(json).to.deep.equal({ok: true, a: 'xyz'});
      expect(response.headers['x-hello']).to.equal('world');
      expect(response.statusCode).to.equal(200);
      expect(response.isUTF8).to.be.true;
      done();
    });
  });

})

```

### Jest
```javascript
const inProcessRequest = require('in-process-request')
const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.set('X-Hello', 'world');
  res.json({ok: true, a: req.query.a})
});

describe('handler', () => {
  it('responds with 200, custom header and query param in JSON body', () => {
    const reqOptions = {
      path: '/test?a=xyz',
      method: 'GET',
    }
    return inProcessRequest(app)(reqOptions).then(response => {
      const json = JSON.parse(response.body.toString())
      expect(json).toEqual({ok: true, a: 'xyz'});
      expect(response.headers['x-hello']).toEequal('world');
      expect(response.statusCode).toEequal(200);
      expect(response.isUTF8).to.be.true;
    });
  });

  it('responds with 200, custom header and query param in JSON body', (done) => {
    const reqOptions = {
      path: '/test?a=xyz',
      method: 'GET',
    }
    inProcessRequest(app)(reqOptions).then(response => {
      const json = JSON.parse(response.body.toString())
      expect(json).toEqual({ok: true, a: 'xyz'});
      expect(response.headers['x-hello']).toEequal('world');
      expect(response.statusCode).toEequal(200);
      expect(response.isUTF8).toBeTrue();
      done();
    });
  });
})

```
