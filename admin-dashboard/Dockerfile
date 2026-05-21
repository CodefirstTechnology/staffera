# ==========================================
# Stage 1: Build Environment
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy configuration and source files
COPY vite.config.ts tsconfig*.json index.html ./
COPY public ./public/
COPY src ./src/

# Compile TypeScript and build production bundle
RUN npm run build

# ==========================================
# Stage 2: Production Web Server
# ==========================================
FROM nginx:alpine

# Copy custom Nginx configuration for Vite single page application router fallback
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Copy static built assets from builder
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
