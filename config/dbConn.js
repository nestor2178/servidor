import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
   //console.log('Conectado a la base de datos');
  } catch (err) {
    console.log(err);
  }
};

export default connectDB;
