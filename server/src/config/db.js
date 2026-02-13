const mongoose = require('mongoose');

async function connectDB(mongoUri) {
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
  };

  try {
    await mongoose.connect(mongoUri, options);
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('🔧 Connection URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    // Fallback to local MongoDB for development
    if (mongoUri.includes('mongodb+srv://')) {
      console.log('🔄 Trying fallback to local MongoDB...');
      try {
        await mongoose.connect('mongodb://localhost:27017/MERNTASK', options);
        console.log('✅ Connected to local MongoDB successfully');
        console.log('📊 Database:', mongoose.connection.name);
      } catch (localErr) {
        console.error('❌ Local MongoDB also failed:', localErr.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
}

module.exports = connectDB;

