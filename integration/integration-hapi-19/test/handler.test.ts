import handler from "../../../src/handler"
import app = require("../app")

const appHandler = async () => {
  const myApp = await app()
  return handler(myApp)
}

describe("handler function", () => {
  it("returns 200 for a valid request", async () => {
    const reqOptions = {
      method: "GET",
      path: "/",
    }
    const H = await appHandler()
    const res = await H(reqOptions)
    expect(res.statusCode).toEqual(200)
    expect(res.headers).toEqual({
      "accept-ranges": "bytes",
      "cache-control": "no-cache",
      "content-length": "5",
      "content-type": "text/html; charset=utf-8",
      "set-cookie": ["username=tom; Secure; HttpOnly; SameSite=Strict"],
    })
    expect(res.body.toString()).toEqual("Hello")
  })
})
