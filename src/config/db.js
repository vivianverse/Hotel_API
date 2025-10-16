require('mongodb');
const mongoose = require('mongoose');

// Connect to MongoDB using Mongoose
async function connectDB() {
  const uri = process.env.MONGO_URI;
  
  if (!uri) {
    throw new Error('MONGO_URI missing in .env');
  }
  
  try {
    
    await mongoose.connect(uri, {
      useNewUrlParser: true, 
      useUnifiedTopology: true, 
    });
    console.log('MongoDB connected successfully!');
  } catch (err) {
    
    console.error('Error connecting to MongoDB:', err);
    
    throw err;
  }
}

module.exports = { connectDB };


