import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' }); // Load environment variables from .env.test

import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyMongodb from '@fastify/mongodb';
import supertest from 'supertest';
import app from '../api/index.js'; // Import the Fastify app
import routes from '../api/routes.js';

describe('User API', () => {
  let server;

  beforeAll(async () => {
    // Create a new Fastify instance for testing
    server = Fastify();

    // Register the MongoDB plugin with the test instance
    await server.register(fastifyMongodb, {
      forceClose: true,
      url: process.env.MONGO_URL
    });

    // Register the routes from your app
    server.register(routes); // Register the main app routes

    // Ensure the server is ready
    await server.ready();
  });

  afterAll(async () => {
    await server.mongo.client.close(); // Close the MongoDB connection
    await server.close(); // Close the Fastify server
  });

  it('should create a new user', async () => {
    const response = await supertest(server.server)
      .post('/api/users')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        walletId: 'wallet123',
        firstName: 'Test',
        lastName: 'User',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test User');
  });

  it('should retrieve all users', async () => {
    const response = await supertest(server.server).get('/api/users');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should retrieve a user by ID', async () => {
    // First, create a user to retrieve
    const createResponse = await supertest(server.server)
      .post('/api/users')
      .send({
        name: 'Another User',
        email: 'another@example.com',
        walletId: 'wallet456',
        firstName: 'Another',
        lastName: 'User',
      });

    const userId = createResponse.body.id;

    // Now retrieve the user by ID
    const response = await supertest(server.server).get(`/api/users/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', userId);
  });
});
