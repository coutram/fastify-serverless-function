const supertest = require('supertest');
const createServer = require('../api'); // Adjust the path as necessary

describe('User API', () => {
    let server;
    let userId;

    beforeAll(async () => {
        server = createServer(); // Create a new Fastify server instance
        await server.ready(); // Ensure the server is ready before running tests
    });

    afterAll(async () => {
        await server.close(); // Close the server after tests
    });

    beforeEach(async () => {
        // Create a user in the database before each test
        const response = await supertest(server).post('/api/users').send({
            name: 'Test User',
            email: 'test@example.com',
            walletId: 'testWalletId',
        });
        userId = response.body.data.id; // Assuming the response contains the user ID
    });

    afterEach(async () => {
        // Cleanup: Delete the test user after each test
        await supertest(server).delete(`/api/users/${userId}`);
    });

    it('should create a new user', async () => {
        const response = await supertest(server).post('/api/users').send({
            name: 'New User',
            email: 'newuser@example.com',
            walletId: 'newWalletId',
        });

        expect(response.status).toBe(201); // Assuming 201 is the status for created
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.name).toBe('New User');
    });

    it('should retrieve all users', async () => {
        const response = await supertest(server).get('/api/users');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should retrieve a user by ID', async () => {
        const response = await supertest(server).get(`/api/users/${userId}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('id', userId);
        expect(response.body.data.name).toBe('Test User'); // Check the name of the user
    });
});
