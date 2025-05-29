const dotenv = require("dotenv")
const mongoose= require("mongoose")

dotenv.config(); // Load environment variables

const connectDb = async () => {
  try {
    const mongoUrl = process.env.MONGO_URI;

    if (!mongoUrl) {
      throw new Error("MongoDb_URL is not defined in the environment variables.");
    }
    await mongoose.connect(process.env.MONGO_URI); // No need for deprecated options

    console.log("✅ Connected to the database");
  } catch (error) {
    console.error("❌ Error connecting to the database:", error.message);
    process.exit(1); // Exit process if connection fails
  }
};

module.exports=  connectDb;
