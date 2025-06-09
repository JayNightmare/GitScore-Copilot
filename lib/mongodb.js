/**
 * MongoDB connection utility for caching repository scores
 * Handles connection lifecycle and provides simple CRUD operations
 */

const { MongoClient } = require('mongodb');

let client;
let db;

/**
 * Initialize MongoDB connection
 */
async function connectToDatabase() {
  if (db) return db;
  
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI not found, caching disabled');
    return null;
  }
  
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db('GitData');
    
    // Create TTL index for automatic cache expiration (24 hours)
    await db.collection('scores').createIndex(
      { "createdAt": 1 },
      { expireAfterSeconds: 86400 }
    );
    
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return null;
  }
}

/**
 * Get cached score for a repository
 */
async function getCachedScore(owner, repo) {
  try {
    const database = await connectToDatabase();
    if (!database) return null;
    
    const cached = await database.collection('scores').findOne({
      owner: owner.toLowerCase(),
      repo: repo.toLowerCase()
    });
    
    return cached;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
}

/**
 * Cache repository score
 */
async function cacheScore(owner, repo, scoreData) {
  try {
    const database = await connectToDatabase();
    if (!database) return false;
    
    await database.collection('scores').replaceOne(
      {
        owner: owner.toLowerCase(),
        repo: repo.toLowerCase()
      },
      {
        owner: owner.toLowerCase(),
        repo: repo.toLowerCase(),
        ...scoreData,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { upsert: true }
    );
    
    return true;
  } catch (error) {
    console.error('Cache storage error:', error);
    return false;
  }
}

/**
 * Close database connection
 */
async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = {
  getCachedScore,
  cacheScore,
  closeConnection
};
