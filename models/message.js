import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  to: String,
  body: String,
  dateSent: Date,
  sid: String
});

const Message = mongoose.model('Message', messageSchema);

export default Message;