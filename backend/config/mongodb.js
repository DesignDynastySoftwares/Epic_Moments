// import mongoose from "mongoose";

// const connectDB = async () => {

//     mongoose.connection.on('connected',() => {
//         console.log("DB Connected");
//     })

//     await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`)

// }

// export default connectDB;


import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// DNS fix (keep it)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const getMongoUrl = () => process.env.MONGO_URI || process.env.MONGODB_URI;

const getDatabaseName = (url) => {
  const dbNameFromEnv = process.env.DB_NAME || process.env.MONGO_DB_NAME;
  if (dbNameFromEnv) return dbNameFromEnv;

  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\/+/, "") || "test";
  } catch {
    return "test";
  }
};

const connectDB = async () => {
  try {
    const url = getMongoUrl();

    if (!url) {
      throw new Error("MongoDB connection string is not defined. Set MONGO_URI or MONGODB_URI in .env");
    }

    const dbName = getDatabaseName(url);

    console.log("MongoDB URL =>", url.replace(/\/\/([^:@]+):([^@]+)@/, "//***:***@"));
    console.log("MongoDB Database =>", dbName);

    await mongoose.connect(url, { dbName });

    console.log("DB Connected ✅");
  } catch (error) {
    console.log("Connection Failed ❌");
    console.log(error.message);
    process.exit(1);
  }
};

export default connectDB;