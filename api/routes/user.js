// routes/users.js
import User from '../models/user.js'

export default async function(fastify, options) {
    // Endpoint to create a new user
    fastify.post('/api/users', async (request, reply) => {
        console.log('Received request body:', JSON.stringify(request.body, null, 2));
        const { firstName, lastName, email, walletId, role, interests, socialLinks } = request.body;

        try {
            // Convert Uint8Array to hex string if needed
            let walletAddress;
            if (walletId?.data) {
                walletAddress = Array.from(walletId.data)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            } else if (typeof walletId === 'string') {
                walletAddress = walletId;
            } else {
                throw new Error('Invalid wallet ID format');
            }

            console.log('Validating walletId:', walletAddress);
            if (!walletAddress || walletAddress.trim() === '') {
                console.error('Invalid walletId:', walletAddress);
                throw new Error('Wallet ID is required and must be a non-empty string');
            }

            console.log('Creating user with walletId:', walletAddress);

            const newUser = new User({ 
                firstName, 
                lastName, 
                email, 
                walletId: walletAddress.trim(), 
                role,
                interests: interests || [],
                socialLinks: {
                    twitter: socialLinks?.twitter || '',
                    instagram: socialLinks?.instagram || '',
                    tiktok: socialLinks?.tiktok || '',
                    youtube: socialLinks?.youtube || ''
                }
            });
            
            console.log('New user object:', JSON.stringify(newUser, null, 2));
            await newUser.save(); // Save the user to the database

            reply.status(201).send({
                status: 'success',
                data: newUser,
            });
        } catch (error) {
            console.error('Error creating user:', error);
            reply.status(500).send({
                status: 'error',
                message: error.message || 'Internal Server Error',
            });
        }
    });

    // Endpoint to update user
    fastify.put('/api/users/:id', async (request, reply) => {
        const { id } = request.params;
        const updateData = request.body;

        try {
            // If interests or socialLinks are provided, ensure they're properly structured
            if (updateData.interests) {
                updateData.interests = Array.isArray(updateData.interests) ? updateData.interests : [];
            }
            if (updateData.socialLinks) {
                updateData.socialLinks = {
                    twitter: updateData.socialLinks.twitter || '',
                    instagram: updateData.socialLinks.instagram || '',
                    tiktok: updateData.socialLinks.tiktok || '',
                    youtube: updateData.socialLinks.youtube || ''
                };
            }

            const user = await User.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!user) {
                return reply.status(404).send({
                    status: 'error',
                    message: 'User not found'
                });
            }

            reply.send({
                status: 'success',
                data: user
            });
        } catch (error) {
            console.error('Error updating user:', error);
            reply.status(500).send({
                status: 'error',
                message: error.message || 'Internal Server Error'
            });
        }
    });

    // Endpoint to get user by wallet ID
    fastify.get('/api/users/wallet/:walletId', async (request, reply) => {
        const { walletId } = request.params;
        console.log('Backend: Received wallet ID:', walletId);

        try {
            const user = await User.findOne({ walletId }); // Use Mongoose to find the user
            console.log('Backend: Found user:', user);

            if (!user) {
                console.log('Backend: No user found for wallet:', walletId);
                return reply.status(200).send({ 
                    status: 'error', 
                    message: 'User not found', 
                    data: null 
                });
            }

            reply.send({ 
                status: 'success', 
                data: user 
            });
        } catch (error) {
            console.error('Backend: Error fetching user:', error);
            reply.status(500).send({ 
                status: 'error', 
                message: 'Internal Server Error',
                error: error.message 
            });
        }
    });

    // Get all users
    fastify.get('/api/users', async (request, reply) => {
        try {
            const users = await User.find();
            reply.send({
                status: 'success',
                data: users
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            reply.status(500).send({
                status: 'error',
                message: 'Internal Server Error'
            });
        }
    });

    // Get user by ID
    fastify.get('/api/users/:id', async (request, reply) => {
        try {
            const user = await User.findById(request.params.id);
            if (!user) {
                return reply.status(404).send({
                    status: 'error',
                    message: 'User not found'
                });
            }
            reply.send({
                status: 'success',
                data: user
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            reply.status(500).send({
                status: 'error',
                message: 'Internal Server Error'
            });
        }
    });

    // Delete user
    fastify.delete('/api/users/:id', async (request, reply) => {
        try {
            const user = await User.findByIdAndDelete(request.params.id);
            if (!user) {
                return reply.status(404).send({
                    status: 'error',
                    message: 'User not found'
                });
            }
            reply.send({
                status: 'success',
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            reply.status(500).send({
                status: 'error',
                message: 'Internal Server Error'
            });
        }
    });

    // Update user's walletId
    fastify.put('/api/users/:id/wallet', async (request, reply) => {
        const { id } = request.params;
        const { walletId } = request.body;

        try {
            // Check if another user already has this walletId
            const existingUser = await User.findOne({ walletId });
            if (existingUser && existingUser._id.toString() !== id) {
                return reply.status(400).send({
                    status: 'error',
                    message: 'Another user already has this wallet ID'
                });
            }

            const user = await User.findByIdAndUpdate(
                id,
                { $set: { walletId } },
                { new: true, runValidators: true }
            );

            if (!user) {
                return reply.status(404).send({
                    status: 'error',
                    message: 'User not found'
                });
            }

            reply.send({
                status: 'success',
                data: user
            });
        } catch (error) {
            console.error('Error updating user walletId:', error);
            reply.status(500).send({
                status: 'error',
                message: error.message || 'Internal Server Error'
            });
        }
    });
};