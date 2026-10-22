#!/bin/bash
set -euo pipefail

cat > /etc/pm2.arenabet.config.js <<'EOF'
module.exports = {
  apps: [
    {
      name: 'arenabet-api',
      cwd: '/opt/arenabet/backend',
      script: 'dist/main.js',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'arenabet-web',
      cwd: '/opt/arenabet/frontend',
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

sleep 3
pm2 status
echo WEB:$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/)
echo API:$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/api)
echo NGINX:$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1/)
echo DONE
