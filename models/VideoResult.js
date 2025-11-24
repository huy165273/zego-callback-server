const mongoose = require('mongoose');

const videoResultSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    index: true
  },
  btId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  riskLevel: {
    type: String,
    required: true
  },
  receivedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VideoResult', videoResultSchema);