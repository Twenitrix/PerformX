#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-performx-app.duckdns.org}"
CLOUDFRONT_HOST="${2:-dyfjpjuaxaevz.cloudfront.net}"

echo "=== Configuring HTTPS for ${DOMAIN} via Caddy ==="

sudo apt-get update -y
sudo apt-get install -y caddy

sudo tee /etc/caddy/Caddyfile > /dev/null <<EOF
${DOMAIN} {
    handle /api/* {
        reverse_proxy localhost:8080
    }
    handle {
        reverse_proxy https://${CLOUDFRONT_HOST} {
            header_up Host ${CLOUDFRONT_HOST}
        }
    }
}
EOF

sudo systemctl enable caddy
sudo systemctl restart caddy
sleep 3
sudo systemctl status caddy --no-pager
echo ""
echo "=== Live at https://${DOMAIN} ==="
