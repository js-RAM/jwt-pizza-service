const request = require('supertest');
const app = require('../../service');
const { loadTestUser, loadAdminUser } = require('./util');
const { DB } = require('../../database/database.js');

let testUser;
let testUserAuthToken;
let adminUser;
let adminUserAuthToken;
let testUserId;
let testFranchise;
let testStore;

beforeAll(async () => {
    ({ testUser, testUserAuthToken, testUserId } = await loadTestUser());
    ({ adminUser, adminUserAuthToken } = await loadAdminUser());
    testFranchise = await DB.createFranchise({ 
        name: Math.random().toString(36).substring(2, 12),
        admins: [{
            email: testUser.email
        }]
    })
    testStore = await DB.createStore(testFranchise.id, {
        name: Math.random().toString(36).substring(2, 12)
    })
});

test("get-franchises", async () => {
    const res = await request(app).get('/api/franchise');
    expect(res.status).toBe(200);
    expect(res.body.franchises).toBeDefined();
});

test('get-franchises-user', async () => {
    const res = await request(app).get(`/api/franchise/${testUserId}`).set("Authorization", `Bearer ${testUserAuthToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe(testFranchise.name);
});

test('create-franchise', async () => {
    const name = Math.random().toString(36).substring(2, 12);
    const res = await request(app).post("/api/franchise").send({name, admins: [{ email: testUser.email }]}).set("Authorization", `Bearer ${adminUserAuthToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.name).toBe(name);
    expect(res.body.admins[0]).toHaveProperty('name', testUser.name);
});

test('create-franchise-failed', async () =>{
    const res = await request(app).post("/api/franchise").set("Authorization", `Bearer ${testUserAuthToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('unable to create a franchise');
});

test('create-store', async () => {
    const name = Math.random().toString(36).substring(2, 12);
    const res = await request(app).post(`/api/franchise/${testFranchise.id}/store`).send({ name }).set("Authorization", `Bearer ${testUserAuthToken}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(name);
});

test('delete-store', async () => {
    const res = await request(app).delete(`/api/franchise/${testFranchise.id}/store/${testStore.id}`).set("Authorization", `Bearer ${testUserAuthToken}`);
    expect(res.status).toBe(200);
})

test('delete-franchise', async () => {
    const res = await request(app).delete(`/api/franchise/${testFranchise.id}`).set("Authorization", `Bearer ${testUserAuthToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('franchise deleted');
})
