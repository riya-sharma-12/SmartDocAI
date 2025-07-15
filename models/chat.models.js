const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  file: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
  history: [
    {
      sender: { type: String, enum: ['user', 'ai'], required: true },
      message: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model('Chat', chatSchema);
