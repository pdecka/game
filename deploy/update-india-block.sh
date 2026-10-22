#!/bin/bash
set -euo pipefail

mkdir -p /etc/nginx/geo /var/www/html
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

curl -fsSL "https://www.ipdeny.com/ipblocks/data/aggregated/in-aggregated.zone" -o "$TMP/in4"
curl -fsSL "https://www.ipdeny.com/ipv6/ipaddresses/aggregated/in-aggregated.zone" -o "$TMP/in6"

{
  awk 'NF && $1 !~ /^#/ { print $1, "1;" }' "$TMP/in4"
  awk 'NF && $1 !~ /^#/ { print $1, "1;" }' "$TMP/in6"
} > /etc/nginx/geo/india.conf

cat > /etc/nginx/conf.d/00-geo-india.conf <<'EOF'
geo $block_india {
    default 0;
    127.0.0.1 0;
    ::1 0;
    include /etc/nginx/geo/india.conf;
}
EOF

cat > /var/www/html/region-blocked.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Not available in your region</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center;
      font-family: Inter, system-ui, sans-serif; background: #f7fbf8; color: #0b1f12; }
    main { max-width: 28rem; padding: 2rem; text-align: center; }
    h1 { font-size: 1.5rem; margin: 0 0 .75rem; }
    p { color: #4b6354; line-height: 1.5; }
  </style>
</head>
<body>
  <main>
    <h1>Not available in your region</h1>
    <p>This service is not offered in your country due to local regulations.</p>
  </main>
</body>
</html>
EOF

python3 - <<'PY'
from pathlib import Path
p = Path("/etc/nginx/sites-available/arenabet")
text = p.read_text()
marker = "    client_max_body_size 25M;"
block = """    client_max_body_size 25M;

    error_page 451 /region-blocked.html;
    location = /region-blocked.html {
        root /var/www/html;
        internal;
    }
    if ($block_india) {
        return 451;
    }"""
if "if ($block_india)" not in text:
    if marker not in text:
        raise SystemExit("nginx site marker not found")
    text = text.replace(marker, block, 1)
    p.write_text(text)
PY

nginx -t
systemctl reload nginx
echo "INDIA_BLOCK_OK lines=$(wc -l < /etc/nginx/geo/india.conf)"
