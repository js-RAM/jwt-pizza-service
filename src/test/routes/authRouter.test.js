const request = require('supertest');
const app = require('../../service');
const { loadTestUser } = require('./util');

let testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
const badUser = { name: 'invalid', password: 'invalid' }
let testUserAuthToken;

beforeAll(async () => {
    ({ testUser, testUserAuthToken } = await loadTestUser());
});

test('login', async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);

  const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
  expect(loginRes.body.user).toMatchObject(user);
});

test('login-failed', async () => {
  failedUser = { ...badUser, email: "invalid@email" };
  const loginRes = await request(app).put('/api/auth').send(failedUser);
  expect(loginRes.status).toBe(404);
});

test('register', async () => {
  const registerRes = await request(app).post('/api/auth').send(testUser);
  expect(registerRes.status).toBe(200);
  expect(registerRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);

  const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
  expect(registerRes.body.user).toMatchObject(user);
});

test('register-failed', async () => {
  const registerRes = await request(app).post('/api/auth').send(badUser);
  expect(registerRes.status).toBe(400)
});

test('logout', async () => {
  const logoutRes = await request(app).delete('/api/auth').set("Authorization", `Bearer ${testUserAuthToken}`);
  expect(logoutRes.status).toBe(200);
});

test('logout-failed', async () => {
  const logoutRes = await request(app).delete('/api/auth');
  expect(logoutRes.status).toBe(401);
});
