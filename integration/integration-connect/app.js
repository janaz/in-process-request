const connect = require('connect');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const static = require('serve-static');

const app = connect();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/static", static(path.join(__dirname, 'public')));
app.use("/reflect", (req, res) => {
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

module.exports = app;
