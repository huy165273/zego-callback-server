const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Tạo thư mục logs nếu chưa có
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Helper function to save callback to file
function saveCallbackToFile(type, requestId, data) {
  try {
    const filename = `${type}_${requestId}.json`;
    const filepath = path.join(logsDir, filename);

    const logData = {
      timestamp: new Date().toISOString(),
      type: type,
      requestId: requestId,
      data: data
    };

    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2), 'utf8');
    console.log(`✓ Saved to file: ${filename}`);
    return filename;
  } catch (error) {
    console.error('Error saving to file:', error);
    return null;
  }
}

// POST endpoint to receive audio callbacks
app.post('/callback/audio/results', async (req, res) => {
  try {
    const timestamp = new Date().toISOString();

    // Log toàn bộ request body
    console.log('\n=== Received Audio Callback ===');
    console.log('Timestamp:', timestamp);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('================================\n');

    const { requestId, btId, message, riskLevel } = req.body;

    // Log các trường quan trọng
    console.log('Audio Callback Details:');
    console.log('- RequestId:', requestId);
    console.log('- BtId:', btId);
    console.log('- Message:', message);
    console.log('- RiskLevel:', riskLevel);

    // Lưu vào file
    const filename = saveCallbackToFile('audio', requestId, req.body);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Audio callback received successfully',
      savedToFile: filename
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
    const timestamp = new Date().toISOString();

    // Log toàn bộ request body
    console.log('\n=== Received Video Callback ===');
    console.log('Timestamp:', timestamp);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('================================\n');

    const { requestId, btId, riskLevel } = req.body;

    // Log các trường quan trọng
    console.log('Video Callback Details:');
    console.log('- RequestId:', requestId);
    console.log('- BtId:', btId);
    console.log('- RiskLevel:', riskLevel);

    // Lưu toàn bộ response vào file
    const filename = saveCallbackToFile('video', requestId, req.body);

    console.log(`Full data saved to: logs/${filename}`);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Video callback received successfully',
      savedToFile: filename
    });

  } catch (error) {
    console.error('Error processing video callback:', error);
    res.status(500).json({
      error: 'Failed to process video callback',
      details: error.message
    });
  }
});

// API endpoint to list all log files
app.get('/api/logs', (req, res) => {
  try {
    const files = fs.readdirSync(logsDir);
    const logFiles = files.filter(f => f.endsWith('.json'));

    const filesWithInfo = logFiles.map(filename => {
      const filepath = path.join(logsDir, filename);
      const stats = fs.statSync(filepath);
      return {
        filename,
        size: `${Math.round(stats.size / 1024)}KB`,
        created: stats.birthtime,
        modified: stats.mtime
      };
    }).sort((a, b) => b.modified - a.modified); // Sort by newest first

    res.status(200).json({
      success: true,
      count: filesWithInfo.length,
      files: filesWithInfo
    });
  } catch (error) {
    console.error('Error reading logs directory:', error);
    res.status(500).json({
      error: 'Failed to read logs',
      details: error.message
    });
  }
});

// API endpoint to get specific log file
app.get('/api/logs/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(logsDir, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        error: 'Log file not found'
      });
    }

    const data = fs.readFileSync(filepath, 'utf8');
    const jsonData = JSON.parse(data);

    res.status(200).json(jsonData);
  } catch (error) {
    console.error('Error reading log file:', error);
    res.status(500).json({
      error: 'Failed to read log file',
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
