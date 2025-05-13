export default class UserModel {
  constructor(mongoClient) {
    this.collection = mongoClient.db().collection('users');
  }

  // Define the user fields
  createUserData(name, email, walletId, firstName, lastName) {
    return {
      name,
      email,
      walletId,
      firstName,
      lastName,
      createdAt: new Date(),
    };
  }

  // Save a new user to the database
  async save(userData) {
    const newUser = this.createUserData(userData.name, userData.email, userData.walletId, userData.firstName, userData.lastName);
    const result = await this.collection.insertOne(newUser);
    return { id: result.insertedId, ...newUser };
  }

  // Get all users from the database
  async getAll() {
    return await this.collection.find().toArray();
  }

  // Optionally, you can add methods to find a user by ID or email
  async getById(userId) {
    return await this.collection.findOne({ _id: userId });
  }

  async getByEmail(email) {
    return await this.collection.findOne({ email });
  }

  async getByWalletId(walletId) {
    return await this.collection.findOne({ walletId });
  }

  // You can add more methods for other operations (e.g., findUserById, updateUser, deleteUser)
}