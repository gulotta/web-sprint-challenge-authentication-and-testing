const request = require('supertest')
const db = require('../data/dbConfig')
const server = require('./server')
const jokes = require("./jokes/jokes-data")
const bcrypt = require('bcryptjs')
const {BCRYPT_ROUNDS} = require('./../config')

const noUser = {username: "", password: "abcd"}
const noPass = {username: "foo", password: ""}

const user1 = {username: "foo", password: "abcd"}

beforeEach(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

afterAll(async () => {
  await db.destroy()
})

test("sanity", () => {
  expect(true).toBe(true)
});

test("Correct ENV", () => {
  expect(process.env.NODE_ENV).toBe('testing')
})

describe("[POST] registration", () => {
  it('Correct error when no username is entered', async () => {
    const res = await request(server)
    .post("/api/auth/register")
    .send(noUser)
    expect(res.body.message).toBe("username and password required")
  })
  it("Correct error when no password is entered", async () => {
    const res = await request(server)
    .post("/api/auth/register")
    .send(noPass)
    expect(res.body.message).toBe("username and password required")
  })
  it("Registers new user when username and password are correct", async () => {
    await request(server)
    .post("/api/auth/register")
    .send(user1)
    const [user] = await db('users').where({username: user1.username})
    expect(user).toMatchObject({username: "foo"})
  })
})

describe("[POST] login", () => {
  beforeEach(async () => {
    const hash = bcrypt.hashSync(user1.password, BCRYPT_ROUNDS)
    await db("users").insert({
      username: user1.username,
      password: hash,
    })
  })
  it("User can login with correct credentials", async () => {
    const res = await request(server)
    .post("/api/auth/login")
    .send(user1)
    expect(res.body.message).toBe("Welcome, foo!")
  })
  it("User cannot login without a password", async () => {
    const res = await request(server)
    .post("/api/auth/login")
    .send(noPass)
    expect(res.body.message).toBe("username and password required")
  })
})

describe("[GET] Jokes", () => {
  beforeEach(async () => {
    const hash = bcrypt.hashSync(user1.password, BCRYPT_ROUNDS)
    await db("users").insert({
      username: user1.username,
      password: hash
    })
  })
  it("No token, no jokes", async () => {
    const res = await request(server).get("/api/jokes")
    expect(res.body.message).toBe("token required")
  })
  it("With a token, you get jokes", async () => {
    let res = (await request(server).post("/api/auth/login")).set(user1)
    res = await request(server)
    .get("/api/jokes")
    .set("Authorization", res.body.token)
    expect(res.body).toMatchObject(jokes)
  })
})






