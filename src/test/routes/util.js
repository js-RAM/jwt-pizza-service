const request = require('supertest');
const app = require('../../service');
const { Role, DB } = require('../../database/database.js');

function generateUser() {
    return {
        name: Math.random().toString(36).substring(2, 12),
        email: Math.random().toString(36).substring(2, 12) + '@test.com',
        password: Math.random().toString(36).substring(2, 12)
    }
}

async function loadTestUser() {
    const testUser = generateUser();
    const registerRes = await request(app).post('/api/auth').send(testUser);
    const testUserAuthToken = registerRes.body.token;
    const testUserId = registerRes.body.user.id;
    return { testUser, testUserAuthToken, testUserId }
}

async function loadAdminUser() {
    const testUser = {...generateUser(), roles: [{ role: Role.Admin }]};
    await DB.addUser(testUser);
    const loginRes = await request(app).put('/api/auth').send(testUser);
    const adminUserAuthToken = loginRes.body.token;
    const adminUserId = loginRes.body.user.id;
    return { adminUser: testUser, adminUserAuthToken, adminUserId };
}

module.exports = { loadTestUser, loadAdminUser, }