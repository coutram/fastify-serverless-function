import User from '../models/user.js';

export const registerUser = async (userModel) => async (req, reply) => {
  const { name, email, walletId, firstName, lastName } = req.body;
  try {
    const newUser = await userModel.save({ name, email, walletId, firstName, lastName });
    reply.status(201).send(newUser);
  } catch (error) {
    reply.status(500).send({ error: 'Failed to create user' });
  }
};

export const getAllUsers = async (userModel) => async (req, reply) => {
  try {
    const users = await userModel.getAll();
    reply.send(users);
  } catch (error) {    
    reply.status(500).send({ error: 'Failed to retrieve users' });
  }
};

// Optionally, define a route to get a user by ID
export const getAllUserByID = async (userModel) => async (req, reply) => {
  const userId = req.params.id;
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
};

export const getUserByEmail = async (userModel) => async (req, reply) => {
  const { email } = req.params;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return reply.status(200).send({ });
    }
    reply.send(user);
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
};

export const getUserByWalletId = async (userModel) => async (req, reply) => {
  const { walletId } = req.params;

  try {
    const user = await User.findOne({ walletId });
    if (!user) {
      return reply.status(200).send({  });
    }
    reply.send(user);
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
};

// You can add more controller functions as needed
