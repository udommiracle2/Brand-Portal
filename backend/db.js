const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

let client;
let db;

async function connectDB() {
  if (db) return db;

  if (!uri || !uri.trim()) {
    throw new Error(
      "Missing MONGODB_URI. Set it in backend/.env to your MongoDB Atlas connection string."
    );
  }

  client = new MongoClient(uri);
  await client.connect();

  db = client.db(process.env.MONGODB_DB_NAME || "brand_portal");

  // Indexes are safe to call every startup — no-ops if they already exist.
  await db.collection("brands").createIndex({ email: 1 }, { unique: true });
  await db.collection("products").createIndex({ brandId: 1 });
  await db.collection("products").createIndex({ brandId: 1, name: 1 });

  console.log(`Connected to MongoDB Atlas (database: ${db.databaseName})`);
  return db;
}

function getDB() {
  if (!db) {
    throw new Error("Database not connected yet. connectDB() must run before handling requests.");
  }
  return db;
}

async function closeDB() {
  if (client) await client.close();
}

module.exports = { connectDB, getDB, closeDB };
