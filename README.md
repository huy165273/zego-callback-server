# Zego Audio Callback Server

Server để nhận callback từ đối tác và lưu vào MongoDB.

## Cài đặt

```bash
npm install
```

## Chạy server

```bash
npm start
```

Server sẽ chạy trên port 3000 (hoặc PORT từ biến môi trường).

## API Endpoints

### POST /callback/audio/results

Nhận callback từ đối tác và lưu vào database.

**Request Body:**

```json
{
  "requestId": "6a9cb980346dfea41111656a514e9109",
  "btId": "1604311839040",
  "message": "Normal",
  "riskLevel": "PASS"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Audio result saved successfully",
  "id": "..."
}
```

### GET /health

Kiểm tra trạng thái server.

## Database

- MongoDB URI: Đã được cấu hình sẵn
- Database: audio-moderation-results
- Collection: audioresults
