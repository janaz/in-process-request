# in-process-request

A node.js library that executes a http handler function in the current process without having to start a local http server.

[![Build Status](https://travis-ci.org/janaz/in-process-request.svg?branch=master)](https://travis-ci.org/janaz/in-process-request)

It supports the following frameworks
* Express.js v3
* Express.js v4
* Express.js v5
* Apollo Server v2
* Hapi v19
* Hapi v20
* NestJS v7
* Connect v3
* Koa v2
* Polka
* More to come...

It has been tested with the following node versions
* v10
* v12
* v14
* v15

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

### Koa example

```javascript
const inProcessRequest = require('in-process-request')
const Koa = require('koa');
const serve = require('koa-static');
const mount = require('koa-mount');
const Router = require('koa-router');

const koa = new Koa();

const router = new Router();

router.get('/test', ctx => {
  ctx.body = "Hello"
});

koa.use(router.routes());

// koa.callback() returns the requestListener functions
const myApp = koa.callback();

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

### Hapi example

In order to get access to the `requestListener` function in Hapi we need to use custom `listener` object. The `in-process-request` module comes with a helper class `HapiListener` that makes it easy. An instance of this class is used as the listener and the `handler` property of that instance provides the request listener function.

```javascript
const inProcessRequest = require('in-process-request')
const Hapi = require('@hapi/hapi');

// create custom listener for Hapi
const myListener = new inProcessRequest.HapiListener()

// Pass the custom listener to Hapi.server
const server = Hapi.server({
  listener: myListener
});

server.route({
  method: 'GET',
  path: '/',
  handler: (_request: any, _h: any) => {
      return 'Hello World!';
  }
});

const waitForServer = async () => {
  //wait for the server to initialize
  await server.start()
  // return the request listener function
  return myListener.handler
}

waitForServer().then((myApp) => {
  // The server is initialized and we have access to the request handler - myApp
  const myAppHandler = inProcessRequest(myApp);

  const requestOptions = {
    path: '/',
    method: 'GET',
  }

  myAppHandler(requestOptions).then(response => {
    console.log('Body', response.body);
    console.log('Headers', response.headers);
    console.log('Status Code', response.statusCode);
    console.log('Status Message', response.statusMessage);
    console.log('Is UTF8 body?', response.isUTF8);
  })
})
```

### NestJS example

This library provides a handy adapter for retrieving the underlying Express instance, which is needed for using this library to send requests to NestJS app.

```typescript
import inProcessRequest from 'in-process-request'

import { NestFactory } from '@nestjs/core';
import { Module, Get, Controller } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
// import nestHandler from '../../../src/nestHandler'

@Controller()
class AppController {
  @Get()
  render() {
    return { hello: 'world' };
  }
}

@Module({
  imports: [],
  controllers: [AppController],
})
class AppModule {}

const getApp = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  return await inProcessRequest.nestHandler(app);
}

getApp().then((myApp) => {
  // The server is initialized and we have access to the request handler - myApp
  const myAppHandler = inProcessRequest(myApp);

  const requestOptions = {
    path: '/',
    method: 'GET',
  }

  myAppHandler(requestOptions).then(response => {
    console.log('Body', response.body);
    console.log('Headers', response.headers);
    console.log('Status Code', response.statusCode);
    console.log('Status Message', response.statusMessage);
    console.log('Is UTF8 body?', response.isUTF8);
  })
})
```

### Polka example

```javascript
const inProcessRequest = require('in-process-request')
const polka = require('polka');

const myApp = polka();
myApp.get('/test', (req, res) => {
  res.json({ok: true, a: req.query.a});
});

const myAppHandler = inProcessRequest(myApp.handler.bind(myApp));

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
