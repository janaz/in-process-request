import { OutgoingHttpHeaders } from 'http';

interface ObjectLikeServerResponse {
  // Old Node versions didn't have getHeaders() method
  _headers?: OutgoingHttpHeaders
  getHeaders?: () => OutgoingHttpHeaders
}

const getHeadersLegacy = (res: ObjectLikeServerResponse): OutgoingHttpHeaders => {
  // In node 6 the headers are stored in `this._headers`
  return res._headers || {};
}

const fixHeaders = (headers: OutgoingHttpHeaders): OutgoingHttpHeaders => {
  const headersCopy: OutgoingHttpHeaders = {};
  Object.keys(headers).forEach(k => {
    if (typeof headers[k] === 'number') {
      headersCopy[k] = (headers[k] as number).toString();
    } else {
      headersCopy[k] = headers[k];
    }
  });
  return headersCopy;
};

export default (res: ObjectLikeServerResponse): OutgoingHttpHeaders => {
  let headers;
  if (typeof res.getHeaders === 'function') {
    headers = res.getHeaders();
  } else {
    headers = getHeadersLegacy(res);
  }
  return fixHeaders(headers);
}
