const mongoose = require("mongoose");

function buildMongoUri(rawUri, dbName) {
  const parsedUri = new URL(rawUri);
  const hasDatabaseInPath = parsedUri.pathname && parsedUri.pathname !== "/";

  if (!hasDatabaseInPath && dbName) {
    parsedUri.pathname = `/${dbName}`;
  }

  return parsedUri.toString();
}

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  const mongoDbName = process.env.MONGO_DB_NAME || "ngl";

  if (!mongoUri) {
    throw new Error("MONGO_URI environment variable is required.");
  }

  const resolvedMongoUri = buildMongoUri(mongoUri, mongoDbName);
  const connection = await mongoose.connect(resolvedMongoUri);
  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
}

module.exports = connectDB;
