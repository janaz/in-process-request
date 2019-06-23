import { OutgoingHttpHeaders } from 'http';

const getHeadersLegacy = (res: any): OutgoingHttpHeaders => {
  const headers = res[Symbol('outHeadersKey')];
  const ret = Object.create(null);
  if (headers) {
    const keys = Object.keys(headers);
    for (var i = 0; i < keys.length; ++i) {
      const key = keys[i];
      const val = headers[key][1];
      ret[key] = val;
    }
  }
  return ret;
}

export default (res: any): OutgoingHttpHeaders => {
  if (typeof res.getHeaders === 'function') {
    return res.getHeaders();
  } else {
    return getHeadersLegacy(res);
  }
}
