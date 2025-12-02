const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// POST endpoint to receive audio callbacks
app.post('/callback/audio/results', async (req, res) => {
  try {
    // Log toàn bộ request body
    console.log('\n=== Received Audio Callback ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('================================\n');

    const { requestId, btId, message, riskLevel } = req.body;

    // Log các trường quan trọng
    console.log('Audio Callback Details:');
    console.log('- RequestId:', requestId);
    console.log('- BtId:', btId);
    console.log('- Message:', message);
    console.log('- RiskLevel:', riskLevel);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Audio callback received successfully'
    });

  } catch (error) {
    console.error('Error processing audio callback:', error);
    res.status(500).json({
      error: 'Failed to process audio callback',
      details: error.message
    });
  }
});

// POST endpoint to receive video callbacks
app.post('/callback/video/results', async (req, res) => {
  try {
    // Log toàn bộ request body
    console.log('\n=== Received Video Callback ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('================================\n');

    const { requestId, btId, riskLevel } = req.body;

    // Log các trường quan trọng
    console.log('Video Callback Details:');
    console.log('- RequestId:', requestId);
    console.log('- BtId:', btId);
    console.log('- RiskLevel:', riskLevel);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Video callback received successfully'
    });

  } catch (error) {
    console.error('Error processing video callback:', error);
    res.status(500).json({
      error: 'Failed to process video callback',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      formatted: formatUptime(uptime)
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    },
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Audio Results callback endpoint: http://localhost:${PORT}/callback/audio/results`);
  console.log(`Video Results callback endpoint: http://localhost:${PORT}/callback/video/results`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});
