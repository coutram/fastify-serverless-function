// import { ObjectId } from 'mongodb';
// import { registerUser, getUserByEmail, getUserByWalletId } from './controllers/userController.js';
import { registerUser, getAllUsers, getAllUserByID, getUserByEmail, getUserByWalletId } from './controllers/userController.js'; // Import the UserController
import UserModel from './models/user.js'; // Use named import

export default async function routes(fastify, options) {

  // Create an instance of UserModel after MongoDB is ready
  let userModel;

  fastify.after(() => {
    userModel = new UserModel(fastify.mongo.client);
  });

  fastify.get('/', async (req, reply) => {
    return reply.status(200).type('text/html').send(html)
  })

  // Health check route
  fastify.get('/api/health', async (request, reply) => {
    return reply.status(200).send({ status: 'OK' });
  });

  fastify.get('/api/user', async (request, reply) => {
    try {
      const users = await userModel.getAll();
      console.log('Received request to create user:', users);
      reply.send(users);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to retrieve users' });
    }
  });

  // User registration route
  // Define a route to create a user
  fastify.post('/api/users', async(request, reply) => registerUser(request, reply));

  // Define a route to get all users
  fastify.get('/api/users', async(request, reply) => getAllUsers(request, reply));

  fastify.get('/api/users/:id', async(request, reply) => getAllUserByID(request, reply));

  // Optionally, define a route to get a user by Email
  fastify.get('/api/users/email/:email', async(request, reply) => getUserByEmail(request, reply));

  // Optionally, define a route to get a user by Wallet
  fastify.get('/api/users/wallet/:walletId', async(request, reply) => getUserByWalletId(request, reply));

  const html = `
  <html>
    <body>
      <h1>Hello World</h1>
    </body>
  </html>
`
  // Add more routes as needed
}

