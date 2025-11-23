const express = require('express');
const mongoose = require('mongoose');
const AudioResult = require('./models/AudioResult');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection URI
const MONGODB_URI = 'mongodb+srv://kienpham1392004:1392004kien@cluster0.byk8u.mongodb.net/audio-moderation-results?retryWrites=true&w=majority&appName=Cluster0';

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// POST endpoint to receive audio callbacks
app.post('/callback/audio/results', async (req, res) => {
  try {
    const { requestId, btId, message, riskLevel } = req.body;

    // Validate required fields
    if (!requestId || !btId || !message || !riskLevel) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['requestId', 'btId', 'message', 'riskLevel']
      });
    }

    // Create and save the audio result
    const audioResult = new AudioResult({
      requestId,
      btId,
      message,
      riskLevel
    });

    await audioResult.save();

    console.log('Audio result saved:', audioResult._id);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Audio result saved successfully',
      id: audioResult._id
    });

  } catch (error) {
    console.error('Error saving audio result:', error);
    res.status(500).json({
      error: 'Failed to save audio result',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Callback endpoint: http://localhost:${PORT}/callback/audio/results`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
