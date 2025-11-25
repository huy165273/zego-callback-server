const mongoose = require('mongoose');

const videoResultSchema = new mongoose.Schema({
  requestId: {
    type: String,
    index: true
  },
  btId: {
    type: String
  },
  riskLevel: {
    type: String
  },
  // Lưu toàn bộ raw data từ request
  rawData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  receivedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  strict: false // Cho phép lưu bất kỳ trường nào
});

module.exports = mongoose.model('VideoResult', videoResultSchema);