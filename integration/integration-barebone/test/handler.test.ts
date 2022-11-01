import handler from "../../../src/handler"
import app = require("../app")

const H = (cb?: () => void) => handler(app(cb) as any)

describe("handler function", () => {
  it("returns 200", async () => {
    const reqOptions = {
      method: "GET",
      path: "/any",
    }
    const res = await H()(reqOptions)
    expect(res.statusCode).toEqual(200)
  })

  it("returns JSON body", async () => {
    const reqOptions = {
      method: "GET",
      path: "/any",
      headers: {
        "X-test-header": "value",
      },
    }
    const res = await H()(reqOptions)
    expect(JSON.parse(res.body.toString())).toEqual({
      method: "GET",
      url: "/any",
      headers: {
        "x-test-header": "value",
      },
    })
  })

  it("write and end methods call callback", async () => {
    const reqOptions = {
      method: "GET",
      path: "/any",
    }
    let x = 0
    const cb = () => {
      x = x + 1
    }
    const res = await H(cb)(reqOptions)

    expect(JSON.parse(res.body.toString())).toEqual({
      method: "GET",
      url: "/any",
      headers: {},
    })

    expect(x).toEqual(2)
  })
})
