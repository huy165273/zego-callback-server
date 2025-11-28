# Zego Callback Server

Server để nhận callback từ đối tác ZEGO cho audio và video moderation. Server chỉ log các callback nhận được, không lưu vào database.

## Tính năng

- ✅ Nhận callback từ ZEGO audio moderation
- ✅ Nhận callback từ ZEGO video moderation
- ✅ Log chi tiết tất cả callback
- ✅ Health check endpoint
- ✅ Hỗ trợ triển khai Docker với domain tùy chỉnh

## Cài đặt và Chạy Local

### Yêu cầu
- Node.js 18+ hoặc Docker

### Cài đặt dependencies

```bash
npm install
```

### Chạy server

```bash
npm start
```

Server sẽ chạy trên port 3000 (hoặc PORT từ biến môi trường).

## API Endpoints

### POST /callback/audio/results

Nhận callback từ ZEGO audio moderation và log thông tin.

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
  "message": "Audio callback received successfully"
}
```

### POST /callback/video/results

Nhận callback từ ZEGO video moderation và log thông tin.

### GET /health

Kiểm tra trạng thái server.

```json
{
  "status": "ok",
  "timestamp": "2025-11-28T10:30:00.000Z"
}
```

## Triển khai lên Render (Khuyến nghị - Đơn giản nhất)

### Tại sao chọn Render?
- ✅ Miễn phí (Free tier)
- ✅ Tự động SSL/HTTPS
- ✅ Tự động deploy khi push code
- ✅ Không cần quản lý server
- ✅ Có subdomain miễn phí hoặc dùng custom domain

### Bước 1: Push code lên GitHub

Nếu chưa có Git repository:

```bash
# Khởi tạo Git (nếu chưa có)
git init

# Add tất cả files
git add .

# Commit
git commit -m "Initial commit"

# Tạo repo trên GitHub và push
git remote add origin https://github.com/username/zego-callback-server.git
git branch -M main
git push -u origin main
```

### Bước 2: Deploy lên Render

1. **Đăng ký/Đăng nhập Render**
   - Truy cập https://render.com
   - Đăng nhập bằng GitHub account

2. **Tạo Web Service mới**
   - Click "New +" → "Web Service"
   - Connect GitHub repository của bạn
   - Chọn repository `zego-callback-server`

3. **Cấu hình Service**
   ```
   Name: zego-callback-server (hoặc tên bạn muốn)
   Region: Singapore (gần Việt Nam nhất)
   Branch: main
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

4. **Environment Variables** (Tùy chọn)
   ```
   NODE_ENV = production
   PORT = 3000
   ```

5. **Click "Create Web Service"**
   - Render sẽ tự động build và deploy
   - Sau vài phút, service sẽ online với URL: `https://zego-callback-server.onrender.com`

### Bước 3: Sử dụng Custom Domain (Tùy chọn)

Nếu bạn muốn dùng domain riêng thay vì `.onrender.com`:

1. **Trong Render Dashboard:**
   - Vào Settings của Web Service
   - Scroll xuống "Custom Domain"
   - Click "Add Custom Domain"
   - Nhập domain của bạn: `callback.your-domain.com`

2. **Cấu hình DNS:**
   - Vào trang quản lý DNS của domain (Cloudflare, GoDaddy, v.v.)
   - Tạo CNAME record:
     ```
     Type: CNAME
     Name: callback
     Value: zego-callback-server.onrender.com
     ```
   - Đợi DNS propagate (5-30 phút)

3. **SSL tự động:**
   - Render tự động cấp SSL certificate miễn phí
   - HTTPS sẽ hoạt động ngay

### Bước 4: Cấu hình ZEGO Console

Sau khi deploy xong, cập nhật callback URLs trong ZEGO Console:

**Nếu dùng Render subdomain:**
- Audio Callback: `https://zego-callback-server.onrender.com/callback/audio/results`
- Video Callback: `https://zego-callback-server.onrender.com/callback/video/results`

**Nếu dùng custom domain:**
- Audio Callback: `https://callback.your-domain.com/callback/audio/results`
- Video Callback: `https://callback.your-domain.com/callback/video/results`

### Bước 5: Xem Logs

**Trong Render Dashboard:**
- Vào tab "Logs" của Web Service
- Logs sẽ hiển thị realtime
- Tất cả console.log sẽ xuất hiện ở đây

**Hoặc dùng Render CLI:**
```bash
# Cài đặt Render CLI
npm install -g @render-cli/cli

# Login
render login

# Xem logs
render logs zego-callback-server
```

### Bước 6: Test và Kiểm tra

```bash
# Test health check
curl https://zego-callback-server.onrender.com/health

# Test audio callback
curl -X POST https://zego-callback-server.onrender.com/callback/audio/results \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "test123",
    "btId": "bt123",
    "message": "Normal",
    "riskLevel": "PASS"
  }'

# Kiểm tra logs trong Render Dashboard để xem output
```

### Auto Deploy

Mỗi khi bạn push code mới lên GitHub, Render sẽ tự động:
1. Phát hiện thay đổi
2. Build lại
3. Deploy phiên bản mới
4. Zero downtime

```bash
# Sửa code, sau đó:
git add .
git commit -m "Update feature"
git push

# Render tự động deploy trong vài phút
```

### Lưu ý quan trọng với Free Tier

⚠️ **Free tier của Render có giới hạn:**
- Service sẽ "ngủ" (spin down) sau 15 phút không có traffic
- Lần request đầu tiên sau khi ngủ sẽ mất 30-60 giây để "thức dậy"
- Giải pháp: Nâng lên Paid plan ($7/tháng) để luôn online 24/7

**Workaround cho Free tier:**
Tạo cron job ping server mỗi 10 phút để giữ cho service không ngủ:
- Dùng cron-job.org hoặc UptimeRobot
- Ping endpoint: `https://zego-callback-server.onrender.com/health`

### Troubleshooting

**Service không start:**
- Kiểm tra Logs trong Render Dashboard
- Đảm bảo `package.json` có đúng scripts: `"start": "node server.js"`

**Không nhận được callback:**
- Kiểm tra URL trong ZEGO Console có đúng không
- Xem Logs để confirm request có đến server không
- Test bằng curl từ máy local

**Domain không hoạt động:**
- Kiểm tra CNAME record: `nslookup callback.your-domain.com`
- Đợi thêm thời gian cho DNS propagate
- Xóa cache DNS: `ipconfig /flushdns` (Windows) hoặc `sudo dscacheutil -flushcache` (Mac)

---

## Triển khai Docker với Domain (Nâng cao)

### Bước 1: Chuẩn bị VPS/Server

Đảm bảo server của bạn đã cài đặt:
- Docker
- Docker Compose

```bash
# Cài đặt Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài đặt Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### Bước 2: Cấu hình DNS

Trỏ domain của bạn về IP server:
- Tạo A record trỏ `callback.your-domain.com` về IP server của bạn
- Đợi DNS propagate (5-30 phút)

### Bước 3: Cài đặt Traefik (Reverse Proxy + SSL)

Tạo file `docker-compose.traefik.yml`:

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    networks:
      - traefik-network
    ports:
      - "80:80"
      - "443:443"
    environment:
      - CF_API_EMAIL=your-email@example.com  # Nếu dùng Cloudflare
      - CF_DNS_API_TOKEN=your-cloudflare-token  # Nếu dùng Cloudflare
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik-data/traefik.yml:/traefik.yml:ro
      - ./traefik-data/acme.json:/acme.json
      - ./traefik-data/config.yml:/config.yml:ro
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.entrypoints=http"
      - "traefik.http.routers.traefik.rule=Host(`traefik.your-domain.com`)"
      - "traefik.http.middlewares.traefik-auth.basicauth.users=admin:$$apr1$$..."
      - "traefik.http.middlewares.traefik-https-redirect.redirectscheme.scheme=https"
      - "traefik.http.middlewares.sslheader.headers.customrequestheaders.X-Forwarded-Proto=https"
      - "traefik.http.routers.traefik.middlewares=traefik-https-redirect"
      - "traefik.http.routers.traefik-secure.entrypoints=https"
      - "traefik.http.routers.traefik-secure.rule=Host(`traefik.your-domain.com`)"
      - "traefik.http.routers.traefik-secure.middlewares=traefik-auth"
      - "traefik.http.routers.traefik-secure.tls=true"
      - "traefik.http.routers.traefik-secure.tls.certresolver=cloudflare"
      - "traefik.http.routers.traefik-secure.tls.domains[0].main=your-domain.com"
      - "traefik.http.routers.traefik-secure.tls.domains[0].sans=*.your-domain.com"
      - "traefik.http.routers.traefik-secure.service=api@internal"

networks:
  traefik-network:
    external: true
```

Tạo thư mục và file cấu hình Traefik:

```bash
mkdir -p traefik-data
cd traefik-data
```

Tạo file `traefik.yml`:

```yaml
api:
  dashboard: true
  debug: true

entryPoints:
  http:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: https
          scheme: https
  https:
    address: ":443"

serversTransport:
  insecureSkipVerify: true

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
  file:
    filename: /config.yml

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: acme.json
      httpChallenge:
        entryPoint: http
```

Tạo file `acme.json` với quyền đúng:

```bash
touch acme.json
chmod 600 acme.json
```

Tạo file `config.yml`:

```yaml
http:
  middlewares:
    secureHeaders:
      headers:
        sslRedirect: true
        forceSTSHeader: true
        stsIncludeSubdomains: true
        stsPreload: true
        stsSeconds: 31536000
```

Tạo Docker network:

```bash
docker network create traefik-network
```

Khởi động Traefik:

```bash
docker-compose -f docker-compose.traefik.yml up -d
```

### Bước 4: Cấu hình và Deploy App

Sửa file `docker-compose.yml` trong project, thay `your-domain.com` bằng domain thực của bạn:

```yaml
version: '3.8'

services:
  zego-callback-server:
    build: .
    container_name: zego-callback-server
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.zego-callback.rule=Host(`callback.your-domain.com`)"
      - "traefik.http.routers.zego-callback.entrypoints=websecure"
      - "traefik.http.routers.zego-callback.tls.certresolver=letsencrypt"
      - "traefik.http.services.zego-callback.loadbalancer.server.port=3000"
    networks:
      - traefik-network

networks:
  traefik-network:
    external: true
```

### Bước 5: Build và Deploy

```bash
# Clone hoặc upload code lên server
cd /path/to/zego-audio-callback-server

# Build và chạy container
docker-compose up -d --build

# Xem logs
docker-compose logs -f
```

### Bước 6: Kiểm tra

Truy cập các URL sau để kiểm tra:

- Health check: `https://callback.your-domain.com/health`
- Test callback:

```bash
curl -X POST https://callback.your-domain.com/callback/audio/results \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "test123",
    "btId": "bt123",
    "message": "Normal",
    "riskLevel": "PASS"
  }'
```

### Xem Logs

```bash
# Xem logs realtime
docker-compose logs -f

# Xem logs của container cụ thể
docker logs -f zego-callback-server

# Xem 100 dòng log cuối
docker-compose logs --tail=100
```

### Quản lý Container

```bash
# Dừng container
docker-compose down

# Khởi động lại
docker-compose restart

# Rebuild và restart
docker-compose up -d --build

# Xóa container và volumes
docker-compose down -v
```

## Cấu hình ZEGO

Trong ZEGO Console, cấu hình callback URL:

- **Audio Callback URL**: `https://callback.your-domain.com/callback/audio/results`
- **Video Callback URL**: `https://callback.your-domain.com/callback/video/results`

## Bảo mật

### Khuyến nghị:

1. **Firewall**: Chỉ mở port 80, 443 và SSH
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **Rate Limiting**: Thêm middleware rate limiting nếu cần
3. **Authentication**: Thêm API key authentication nếu cần
4. **HTTPS**: Traefik tự động cấu hình Let's Encrypt SSL

## Troubleshooting

### SSL không hoạt động
- Kiểm tra DNS đã trỏ đúng chưa: `nslookup callback.your-domain.com`
- Kiểm tra Traefik logs: `docker logs traefik`
- Kiểm tra file acme.json có quyền 600

### Container không start
```bash
# Kiểm tra logs
docker-compose logs

# Kiểm tra network
docker network ls
docker network inspect traefik-network
```

### Không nhận được callback
- Kiểm tra firewall
- Kiểm tra logs của container
- Test endpoint bằng curl từ bên ngoài
- Kiểm tra cấu hình trong ZEGO Console

## License

ISC
