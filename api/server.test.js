
const request = require('supertest');
const db = require('../data/dbConfig');
const server = require('./server');

const user1 = {
  username: 'iron-man',
  password: 'iamironman34',
}

const user2 = {
  username: 'black-widow',
  password: 'ihaveredhair77',
}

test("sanity", () => {
  expect(true).toBe(true);
});

beforeAll(async ()=>{
    await db.migrate.rollback()
    await db.migrate.latest()
})
beforeEach(async () => {
  await db('users').truncate();
})
afterAll(async ()=>{
    await db.destroy()
})

describe('server', () => {
  describe('Register', () => {
    it("Rejects incorrect info with 400", async () => {
      let res;
      res = await request(server).post('/api/auth/register').send({});
      expect(res.status).toBe(400);
    })
    it("Responds with 201 on success", async () => {
      let res;
      res = await request(server).post('/api/auth/register').send(user1);
      expect(res.status).toBe(201);
    })
    it ("Rejects duplicate username", async () => {
      let res;
      await request(server).post('/api/auth/register').send(user1);
      res = await request(server).post('/api/auth/register').send(user1);
      expect(res.status).toBe(400);
    })
  })

  describe('Login', () => {
    it("Returns token on login", async () => {
      let res;
      await request(server).post('/api/auth/register').send(user1);
      res = await request(server).post('/api/auth/login').send(user1);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe(`welcome, ${user1.username}`);
      expect(res.body.token).toBeTruthy();
    })
    it("Rejects invalid login with 401", async () => {
      let res;
      await request(server).post('/api/auth/register').send(user1);
      res = await request(server).post('/api/auth/login').send(user2);
      expect(res.status).toBe(401);
    })
  })
  
  describe('Get Jokes', () => {
    it("Returns jokes when using a valid token", async () => {
      let res;
      await request(server).post('/api/auth/register').send(user1);
      res = await request(server).post('/api/auth/login').send(user1);
      const token = res.body.token;
      res = await request(server).get('/api/jokes').set({'Authorization': token})
      expect(res.status).toBe(200);
    })
    it("Rejects invalid token with 401", async () => {
      let res;
      res = await request(server).get('/api/jokes').set({'Authorization': 'NOT A TOKEN LOL'})
      expect(res.status).toBe(401);
    })
  })
});
