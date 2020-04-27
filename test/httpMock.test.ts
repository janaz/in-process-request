import { MockResponse, createMockResponse, createMockRequest } from '../src/httpMock';

describe('createMockResponse', () => {
  describe('utf-8', () => {
    const utfExampleFor = (contentTypeHeader: string, expectedValue: boolean) => {
      it(`marks (${expectedValue}) response as utf-8 when content-type is ${contentTypeHeader}`, (done) => {
        const res = createMockResponse({} as any);
        res.setHeader('content-type', contentTypeHeader)
        res.once('__mock_response', (response: MockResponse) => {
          expect(response.isUTF8).toEqual(expectedValue);
          done();
        });
        res.end();
      })
    };

    utfExampleFor('text/html;charset=utf-8', true);
    utfExampleFor('text/html;charset=UTF-8', true);
    utfExampleFor('Text/HTML;Charset="utf-8"', true);
    utfExampleFor('text/html; charset="utf-8"', true);
    utfExampleFor('text/html; charset=utf-81', false);
    utfExampleFor('text/html; charset="utf-9"', false);

    it("doesn't mark response as utf-8 when content-endoding is set", (done) => {
      const res = createMockResponse({} as any);
      res.setHeader('content-type', 'text/html;charset=utf-8')
      res.setHeader('content-encoding', 'gzip')
      res.once('__mock_response', (response: MockResponse) => {
        expect(response.isUTF8).toEqual(false);
        done();
      });
      res.end();
    })
  });

})
