import polka from 'polka';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import serveStatic from 'serve-static';
import { OutgoingMessage } from 'http';

const app = polka();

app.use(cookieParser() as any);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/static", serveStatic(path.join(__dirname, 'public')) as any);
app.use("/reflect", (req: any, res: OutgoingMessage) => {
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify({
      body: req.body,
      cookies: req.cookies,
      fresh: req.fresh,
      hostname: req.hostname,
      method: req.method,
      params: req.params,
      protocol: req.protocol,
      query: req.query,
      secure: req.secure,
      signedCookies: req.signedCookies,
      stale: req.stale,
      subdomains: req.subdomains,
      xhr: req.xhr,
      ip: req.ip,
      ips: req.ips,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      path: req.path,
      url: req.url,
      xForwardedFor: req.headers['x-forwarded-for'],
  }))
});

module.exports = app.handler.bind(app);
