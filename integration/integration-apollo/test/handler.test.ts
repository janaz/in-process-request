import handler from '../../../src/handler';
import app = require('../app');

const H = handler(app);

describe('handler function', () => {
  it('responds to a graphql query', async () => {
    const reqOptions = {
      method: 'POST',
      path: '/graphql',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: 'query {books {author}}'
      })
    };
    const res = await H(reqOptions);
    expect(res.statusCode).toEqual(200);
    const json = JSON.parse(res.body.toString())
    expect(json).toEqual({
      data: {
        books: [
          {
            author: "J.K. Rowling",
          }, {
            author: "Michael Crichton",
          }
        ],
      },
    });
  })
})

// curl 'http://localhost:4000/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:4000' --data-binary '{"query":"# Write your query or mutation here\nquery {\n  books {\n    author\n  }\n}"}' --compressed
