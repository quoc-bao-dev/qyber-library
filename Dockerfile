# Sử dụng Node.js làm base image
FROM node:18 AS builder

# Set thư mục làm việc
WORKDIR /app

# Sao chép tệp package.json và yarn.lock
COPY package.json yarn.lock ./

# Cài đặt dependencies
RUN yarn install --frozen-lockfile

# Sao chép toàn bộ mã nguồn
COPY . .

# Build project
RUN yarn build

# Sử dụng nginx làm image cho production
FROM nginx:alpine

# Copy file từ bước build vào nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy file cấu hình nginx (nếu có)
#COPY nginx.conf /etc/nginx/nginx.conf

# Expose cổng 80
EXPOSE 80

# Khởi chạy nginx
CMD ["nginx", "-g", "daemon off;"]
