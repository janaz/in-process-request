import express from "express"
import path from "path"
import cookieParser from "cookie-parser"
import compression from "compression"

const app = express()

app.use(cookieParser())
app.use(express.json() as any)
app.use(express.urlencoded({ extended: false }) as any)

app.use(
  "/static",
  compression(),
  express.static(path.join(__dirname, "public"))
)

app.use("/reflect", (req, res) => {
  res.json({
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
    xForwardedFor: req.get("x-forwarded-for"),
  })
})

module.exports = app
