import mongoose from 'mongoose';

const connectDB = async (url) => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000,  // Increase connection timeout for CosmosDB
      socketTimeoutMS: 45000,   // Adjust socket timeout as well
    });
    console.log('CosmosDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);  // Exit process if unable to connect to prevent app from running in a broken state
  }
};

export default connectDB;
