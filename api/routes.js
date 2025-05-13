import UserModel from './models/user.js'; // Use named import

export default async function routes(fastify, options) {

  // Create an instance of UserModel after MongoDB is ready
  let userModel;

  fastify.after(() => {
    userModel = new UserModel(fastify.mongo.client);
  });

  fastify.get('/', async (request, reply) => {
    return reply.status(200).type('text/html').send(html)
  })

  // Health check route
  fastify.get('/api/health', async (request, reply) => {
    return reply.status(200).send({ status: 'OK' });
  });

  // User registration route
  // Define a route to create a user
  fastify.post('/api/users', async(request, reply) => {
    const { name, email, walletId, firstName, lastName } = request.body;
    try {
      const newUser = await userModel.save({ name, email, walletId, firstName, lastName });
      reply.status(201).send(newUser);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create user' });
    }
  });

  // Define a route to get all users
  fastify.get('/api/users', async(request, reply) => {
    try {
      const users = await userModel.getAll();
      reply.send(users.toArray());
    } catch (error) {    
      reply.status(500).send({ error: 'Failed to retrieve users' });
    }
  });

  fastify.get('/api/users/:id', async(request, reply) => {
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

  // Optionally, define a route to get a user by Email
  fastify.get('/api/users/email/:email', async(request, reply) => {
    const { email } = request.params;

    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        return reply.status(200).send({ });
      }
      reply.send(user);
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Optionally, define a route to get a user by Wallet
  fastify.get('/api/users/wallet/:walletId', async(request, reply) => {
    const { walletId } = request.params;

    try {
      const user = await userModel.getByWalletId({ walletId });
      reply.send({
        status: 'success',
        data: user,
    });
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
    
  });

  const html = `
  <html>
    <body>
      <h1>Hello World</h1>
    </body>
  </html>
`
}

