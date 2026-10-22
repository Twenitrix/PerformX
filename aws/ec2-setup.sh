#!/usr/bin/env bash
set -euo pipefail

echo "=== PerformX AWS EC2 Setup & Deployment Script ==="

# 1. Install Java 21, Maven, and Git
sudo apt-get update -y
sudo apt-get install -y openjdk-21-jdk maven git curl

java -version
mvn -version

# 2. Build the Spring Boot Backend
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/../performx-backend" && pwd)"

cd "${BACKEND_DIR}"
echo "Building PerformX backend JAR..."
mvn clean package -DskipTests

# 3. Create environment configuration file if not exists
ENV_FILE="/etc/performx.env"
if [ ! -f "${ENV_FILE}" ]; then
  RAND_SECRET=$(openssl rand -base64 48 | tr -d '\n')
  sudo tee "${ENV_FILE}" > /dev/null <<EOF
SPRING_PROFILES_ACTIVE=prod
PORT=8080
CORS_ORIGINS=*
JWT_SECRET=${RAND_SECRET}
# Uncomment and configure below when ready to switch from local persistent H2 to Amazon RDS PostgreSQL:
# SPRING_DATASOURCE_URL=jdbc:postgresql://<RDS_ENDPOINT>:5432/performx
# SPRING_DATASOURCE_USERNAME=postgres
# SPRING_DATASOURCE_PASSWORD=<YOUR_RDS_PASSWORD>
EOF
  sudo chmod 600 "${ENV_FILE}"
  echo "Created ${ENV_FILE} with generated JWT_SECRET."
fi

# 4. Install and start systemd service so PerformX stays running 24/7 and survives reboots
SERVICE_FILE="/etc/systemd/system/performx.service"
sudo tee "${SERVICE_FILE}" > /dev/null <<EOF
[Unit]
Description=PerformX Spring Boot Backend Service
After=network.target

[Service]
Type=simple
User=${USER}
WorkingDirectory=${BACKEND_DIR}
EnvironmentFile=${ENV_FILE}
ExecStart=/usr/bin/java -jar ${BACKEND_DIR}/target/performx-backend-1.0.0.jar
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable performx
sudo systemctl restart performx

echo "Waiting 15 seconds for PerformX backend to start and seed demo data..."
sleep 15
sudo systemctl status performx --no-pager
echo ""
echo "Health check:"
curl -s http://localhost:8080/api/v1/health || true
echo ""
echo "=== PerformX Backend is live on port 8080! ==="
