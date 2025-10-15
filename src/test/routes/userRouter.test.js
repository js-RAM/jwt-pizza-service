const request = require('supertest');
const app = require('../../service');
const { loadTestUser, loadAdminUser } = require('./util');

let testUser;
let testUserAuthToken;
let testUserId;
let adminUserAuthToken;

beforeAll(async () => {
    ({ testUser, testUserAuthToken, testUserId } = await loadTestUser());
    ({ adminUserAuthToken } = await loadAdminUser());
});

test("get-me", async () => {
    const res = await request(app).get("/api/user/me").set("Authorization", `Bearer ${testUserAuthToken}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(testUser.name);
});

test("update-user", async () => {
    const name = Math.random().toString(36).substring(2, 12);
    const res = await request(app).put(`/api/user/${testUserId}`).send({ name, password: testUser.password }).set("Authorization", `Bearer ${testUserAuthToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe(name);
    expect(res.body.user.email).toBe(testUser.email);
})

test('list users unauthorized', async () => {
  const listUsersRes = await request(app).get('/api/user');
  expect(listUsersRes.status).toBe(401);
});

test('list users', async () => {
  const listUsersRes = await request(app)
    .get('/api/user')
    .set('Authorization', 'Bearer ' + adminUserAuthToken);
  expect(listUsersRes.status).toBe(200);
  expect(Array.isArray(listUsersRes.body.users)).toBe(true);
  expect(listUsersRes.body.users.length > 0).toBe(true);
});

test('list users not admin', async () => {
    const listUsersRes = await request(app)
        .get('/api/user')
        .set('Authorization', 'Bearer ' + testUserAuthToken);
    expect(listUsersRes.status).toBe(403);
});

test('delete user', async () => {
    let authToken, userId;
    ({ testUserAuthToken: authToken, testUserId: userId } = await loadTestUser());
    const deleteUserRes = await request(app)
        .delete(`/api/user/${userId}`)
        .set('Authorization', 'Bearer ' + adminUserAuthToken);
    expect(deleteUserRes.status).toBe(200);
    const res = await request(app).get("/api/user/me").set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(401);
});