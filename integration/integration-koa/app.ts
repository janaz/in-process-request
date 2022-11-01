import Koa from "koa"
import serve from "koa-static"
import mount from "koa-mount"
import Router from "koa-router"
import bodyParser from "koa-bodyparser"
import path from "path"

const app = new Koa()

app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set("X-Response-Time", `${ms}ms`)
})

app.use(mount("/static", serve(path.join(__dirname, "public"))))

app.use(bodyParser())

const router = new Router()

router.all("/reflect", (ctx) => {
  ctx.body = {
    body: ctx.request.body,
    ip: ctx.request.ip,
    ips: ctx.request.ips,
    fresh: ctx.request.fresh,
    stale: ctx.request.stale,
    host: ctx.request.host,
    hostname: ctx.request.hostname,
    origin: ctx.request.origin,
    originalUrl: ctx.request.originalUrl,
    path: ctx.request.path,
    protocol: ctx.request.protocol,
    subdomains: ctx.request.subdomains,
    url: ctx.request.url,
  }
})

app.use(router.routes())

module.exports = app.callback()
