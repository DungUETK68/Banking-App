# 🏦 Banking App (TD Bank)

Một ứng dụng ngân hàng trực tuyến được xây dựng theo kiến trúc Microservices với mô hình Client-Server. Phiên bản này đã được nâng cấp mạnh mẽ với các **nghiệp vụ ngân hàng nâng cao**, giải quyết các bài toán thực tế thường gặp trong các hệ thống tài chính lớn.

## 🌟 Các tính năng nổi bật

Bên cạnh các tính năng cơ bản (Đăng nhập, Quản lý tài khoản, Chuyển tiền, Lịch sử), hệ thống đã tích hợp:

* **Sổ cái kép (Double-entry Ledger) & Audit Trail:** 
  * Mọi biến động tài chính đều được ghi sổ kép và không thể sửa/xóa.
  * Ghi log chi tiết mọi thao tác nhạy cảm của người dùng.
  * Cơ chế Soft-delete bảo vệ dữ liệu lịch sử.
* **Bảo mật & Phân quyền:**
  * Hỗ trợ 3 vai trò: `CUSTOMER`, `TELLER` (Giao dịch viên), `ADMIN` (Quản trị viên).
  * Tích hợp **Xác thực 2 lớp (OTP)** cho các giao dịch quan trọng.
  * Chống tấn công Brute-force & Spam với Rate Limiting (Throttler).
* **Validation & Rule Engine:**
  * Áp dụng Hạn mức giao dịch ngày/lần (ví dụ: tối đa 200 triệu VNĐ/ngày).
* **Đối soát & Giám sát (Reconciliation & Monitor):**
  * Tự động chạy **Job đối soát Sổ cái** vào cuối ngày.
  * Cơ chế **Fraud Detection**: Tự động phát hiện vị trí địa lý bất thường qua IP và đánh cờ (Flag) tài khoản để Admin review.

## 🚀 Công nghệ sử dụng

* **Frontend:** React 18, Vite, TypeScript, Axios, Lucide React (Icons).
* **Backend:** NestJS, TypeScript, TypeORM, JSON Web Token (JWT).
* **Database:** PostgreSQL 15.
* **DevOps:** Docker, Docker Compose.

## 🛠 Yêu cầu hệ thống

Để chạy dự án, máy tính của bạn cần cài đặt sẵn:
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Bắt buộc)
- Git (Để tải code về máy)

## ⚙️ Hướng dẫn Cài đặt & Khởi chạy

1. **Clone dự án về máy:**
   ```bash
   git clone https://github.com/DungUETK68/Simple-Banking-App.git
   cd Simple-Banking-App
   ```

2. **Cấu hình biến môi trường (.env):**
   Tại thư mục gốc của dự án, hãy tạo một file có tên là `.env` và copy nội dung sau vào:
   ```env
   # Database config
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=root
   DB_PASSWORD=rootpassword
   DB_NAME=simple_banking

   # App config
   PORT=3000

   # JWT
   JWT_SECRET=super_secret_jwt_key_example
   JWT_EXPIRATION=15m
   JWT_REFRESH_SECRET=super_secret_refresh_token_example
   JWT_REFRESH_EXPIRATION=7d
   ```

3. **Khởi chạy hệ thống bằng Docker Compose:**
   ```bash
   docker compose up --build -d
   ```

4. **Truy cập Ứng dụng:**
   - **Frontend (Web App):** Mở trình duyệt và vào [http://localhost:5173](http://localhost:5173)
   - **Backend API (NestJS):** Chạy ngầm tại `http://localhost:3000`
   - **Database (PostgreSQL):** Chạy tại cổng `5432` (User: `root`, Password: `rootpassword`, DB: `simple_banking`)

## 🛑 Dừng và Xóa dữ liệu

Khi không sử dụng nữa, bạn có thể tắt các container đi để giải phóng RAM bằng lệnh:
```bash
docker compose down
```

Nếu bạn muốn **xóa trắng** luôn cả Database (reset lại như mới):
```bash
docker compose down -v
```

---
*Phát triển bởi [DungUETK68](https://github.com/DungUETK68)*