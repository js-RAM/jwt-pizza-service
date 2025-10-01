const request = require('supertest');
const app = require('../../service');
const { loadTestUser } = require('./util');

let testUser;
let testUserAuthToken;
let testUserId;

beforeAll(async () => {
    ({ testUser, testUserAuthToken, testUserId } = await loadTestUser());
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