

import mongoose from 'mongoose';
const userverificationSchema = new mongoose.Schema({
    UserID : String,
     createdAt :Date,
    expiredAt :Date      
  });
  const Userverification = mongoose.model('Userverification', userverificationSchema);

export default Userverification;