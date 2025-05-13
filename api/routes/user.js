// routes/users.js
const User = require('../models/user'); // Adjust the path as necessary

module.exports = async function (fastify, options) {
    // Endpoint to create a new user
    fastify.post('/api/users', async (request, reply) => {
        const { firstName, lastName, email, walletId } = request.body;

        try {
            const newUser = new User({ firstName, lastName, email, walletId });
            await newUser.save(); // Save the user to the database

            reply.status(201).send({
                status: 'success',
                data: newUser,
            });
        } catch (error) {
            console.error('Error creating user:', error);
            reply.status(500).send({
                status: 'error',
                message: 'Internal Server Error',
            });
        }
    });

    // Endpoint to get user by wallet ID
    fastify.get('/api/users/wallet/:walletId', async (request, reply) => {
        const { walletId } = request.params;

        try {
            const user = await User.findOne({ walletId }); // Use Mongoose to find the user
            if (!user) {
                return reply.status(404).send({ status: 'error', message: 'User not found' });
            }
            reply.send({ status: 'success', data: user });
        } catch (error) {
            console.error('Error fetching user:', error);
            reply.status(500).send({ status: 'error', message: 'Internal Server Error' });
        }
    });
};