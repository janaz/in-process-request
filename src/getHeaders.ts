import { OutgoingHttpHeaders } from 'http';

const getHeadersLegacy = (res: any): OutgoingHttpHeaders => {
  // In node 6 the headers are stored in `this._headers`
  return res._headers || {};
}

export default (res: any): OutgoingHttpHeaders => {
  if (typeof res.getHeaders === 'function') {
    return res.getHeaders();
  } else {
    return getHeadersLegacy(res);
  }
}
