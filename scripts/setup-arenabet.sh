#!/bin/bash
set -euo pipefail

APP_DIR=/opt/arenabet
DOMAIN=arenabet.poker
REPO=https://github.com/pdecka/game.git
export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get install -y nginx postgresql redis-server curl build-essential ufw git openssl ca-certificates

if ! command -v node >/dev/null 2>&1 || ! node -v | grep -qE 'v2[0-9]'; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

npm install -g pm2

systemctl enable --now postgresql redis-server nginx

DB_PASS=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)
JWT=$(openssl rand -hex 32)
JWT_R=$(openssl rand -hex 32)

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='arenabet'" | grep -q 1; then
  sudo -u postgres psql -c "CREATE USER arenabet WITH PASSWORD '${DB_PASS}';"
else
  sudo -u postgres psql -c "ALTER USER arenabet WITH PASSWORD '${DB_PASS}';"
fi
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='arenabet'" | grep -q 1; then
  sudo -u postgres psql -c "CREATE DATABASE arenabet OWNER arenabet;"
fi
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE arenabet TO arenabet;"

mkdir -p "$APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch --all
  git -C "$APP_DIR" reset --hard origin/main
else
  rm -rf "$APP_DIR"
  git clone "$REPO" "$APP_DIR"
fi

cat > "$APP_DIR/backend/.env" <<EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://arenabet:${DB_PASS}@127.0.0.1:5432/arenabet
JWT_SECRET=${JWT}
JWT_REFRESH_SECRET=${JWT_R}
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://${DOMAIN},https://www.${DOMAIN},http://${DOMAIN},http://www.${DOMAIN}
EOF

cat > "$APP_DIR/frontend/.env.production" <<EOF
NEXT_PUBLIC_API_URL=/api
EOF

cd "$APP_DIR"
npm run install:all
npm run build:shared
npm --prefix backend run build
npm --prefix backend exec prisma migrate deploy
npm --prefix frontend run build

cat > /etc/pm2.arenabet.config.js <<EOF
module.exports = {
  apps: [
    {
      name: 'arenabet-api',
      cwd: '${APP_DIR}/backend',
      script: 'dist/main.js',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'arenabet-web',
      cwd: '${APP_DIR}/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000 -H 127.0.0.1',
      env: { NODE_ENV: 'production', PORT: '3000' },
    },
  ],
};
EOF

pm2 delete arenabet-api arenabet-web >/dev/null 2>&1 || true
pm2 start /etc/pm2.arenabet.config.js
pm2 save
pm2 startup systemd -u root --hp /root | tail -n 1 | bash || true

cat > /etc/nginx/sites-available/arenabet <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name arenabet.poker www.arenabet.poker _;

    client_max_body_size 25M;

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /uploads {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX

ln -sfn /etc/nginx/sites-available/arenabet /etc/nginx/sites-enabled/arenabet
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo SETUP_DONE
pm2 status
curl -s -o /dev/null -w "WEB:%{http_code}\n" http://127.0.0.1:3000/ || true
curl -s -o /dev/null -w "API:%{http_code}\n" http://127.0.0.1:3001/api || true
curl -s -o /dev/null -w "NGINX:%{http_code}\n" http://127.0.0.1/ || true
