// import { ObjectId } from 'mongodb';
// import { registerUser, getUserByEmail, getUserByWalletId } from './controllers/userController.js';
import { UserModel } from './models/user.js';

export default async function routes(fastify, options) {

  // Create an instance of UserModel after MongoDB is ready
  let userModel;

  fastify.after(() => {
    userModel = new UserModel(fastify.mongo.client);
  });

  // Health check route
  fastify.get('/api/health', async (request, reply) => {
    return reply.status(200).send({ status: 'OK' });
  });

  // User registration route
  // Define a route to create a user
  fastify.post('/api/users', async (request, reply) => {
    const { name, email, walletId, firstName, lastName } = request.body;
    try {
      const newUser = await userModel.save({ name, email, walletId, firstName, lastName });
      reply.status(201).send(newUser);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create user' });
    }
  });

  // Define a route to get all users
  fastify.get('/api/users', async (request, reply) => {
    try {
      const users = await userModel.getAll();
      reply.send(users);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to retrieve users' });
    }
  });

  // Optionally, define a route to get a user by ID
  fastify.get('/api/users/:id', async (request, reply) => {
    const userId = request.params.id;
    try {
      const user = await userModel.getById(userId);
      if (user) {
        reply.send(user);
      } else {
        reply.status(404).send({ error: 'User not found' });
      }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to retrieve user' });
    }
  });

  // Optionally, define a route to get a user by ID
  fastify.get('/api/users/:id', async (request, reply) => {
    const userId = request.params.id;
    try {
      const user = await userModel.getByEmail(userId);
      if (user) {
        reply.send(user);
      } else {
        reply.status(404).send({ error: 'User not found' });
      }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to retrieve user' });
    }
  });

  // Optionally, define a route to get a user by ID
  fastify.get('/api/users/:id', async (request, reply) => {
    const userId = request.params.id;
    try {
      const user = await userModel.getBygetByWalletIdId(userId);
      if (user) {
        reply.send(user);
      } else {
        reply.status(404).send({ error: 'User not found' });
      }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to retrieve user' });
    }
  });

  // Add more routes as needed
}
