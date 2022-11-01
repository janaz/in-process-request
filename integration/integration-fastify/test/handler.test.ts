import handler from "../../../src/handler"
import app from "../app"

const appHandler = async () => {
  const myApp: any = await app({})
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
    expect(res.body.toString()).toEqual('{"hello":"world"}')
    expect(res.headers).toEqual({
      "content-length": "17",
      "content-type": "application/json; charset=utf-8",
      "set-cookie": ["foo=bar", "bar=foo"],
    })
  })
  describe("static content", () => {
    it("returns a png file", async () => {
      const reqOptions = {
        method: "GET",
        path: "/public/file.png",
      }
      const H = await appHandler()
      const res = await H(reqOptions)
      expect(res.statusCode).toEqual(200)
      expect(Buffer.byteLength(res.body)).toEqual(178)
      expect(res.headers["content-length"]).toEqual("178")
      expect(res.headers["content-type"]).toEqual("image/png")
    })
    it("returns a html file", async () => {
      const reqOptions = {
        method: "GET",
        path: "/public/file.html",
      }
      const H = await appHandler()
      const res = await H(reqOptions)
      expect(res.statusCode).toEqual(200)
      expect(Buffer.byteLength(res.body)).toEqual(98)
      expect(res.headers["content-length"]).toEqual("98")
      expect(res.headers["content-type"]).toEqual("text/html; charset=UTF-8")
    })
  })
})
