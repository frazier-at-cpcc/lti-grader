const { MongoClient } = require('mongodb');

class Database {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = await MongoClient.connect(process.env.MONGODB_URI);
      this.db = this.client.db();
      console.log('Connected to MongoDB');
      return this.db;
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      throw err;
    }
  }

  async setupCollections() {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const grades = this.db.collection('grades');
    await grades.createIndex({ email: 1, activityId: 1 });
    return { grades };
  }

  getDb() {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}

module.exports = new Database();
