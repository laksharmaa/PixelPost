import mongoose from 'mongoose';

const connectDB = async (uri) => {
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000
  });
  console.log('Database connected');
};

export default connectDB;
