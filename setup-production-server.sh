#!/bin/bash

# Production Server Setup Script
# Run this on the production server before deploying

set -e

echo "🚀 Setting up production server..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

echo -e "${YELLOW}🐳 Installing Docker...${NC}"
# Remove old docker versions
apt-get remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-ce-cli 2>/dev/null || true

# Install Docker
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo -e "${YELLOW}📝 Installing Docker Compose...${NC}"
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo -e "${YELLOW} Creating project directories...${NC}"
mkdir -p /opt/stock_area
cd /opt/stock_area

echo -e "${YELLOW}📂 Creating volume directories...${NC}"
mkdir -p storage/{app,framework,logs}
mkdir -p bootstrap/cache
chmod -R 777 storage bootstrap/cache

echo -e "${YELLOW}🔐 Creating .env file...${NC}"
if [ ! -f /opt/stock_area/.env ]; then
    cat > /opt/stock_area/.env << 'EOF'
# Production Environment
APP_ENV=production
DB_HOST=127.0.0.1
DB_DATABASE=stock_sales
DB_USERNAME=phpmyadmin
DB_PASSWORD=300102
EOF
fi

echo -e "${YELLOW}🗄️  Setting up MySQL (if needed)...${NC}"
which mysql > /dev/null 2>&1 || {
    apt-get install -y mysql-server
    mysql -e "CREATE DATABASE IF NOT EXISTS stock_sales;"
    mysql -e "CREATE USER IF NOT EXISTS 'phpmyadmin'@'localhost' IDENTIFIED BY '300102';"
    mysql -e "GRANT ALL PRIVILEGES ON stock_sales.* TO 'phpmyadmin'@'localhost';"
    mysql -e "FLUSH PRIVILEGES;"
}

echo -e "${YELLOW}🔒 Configuring firewall...${NC}"
# Enable UFW if not already enabled
ufw --force enable > /dev/null 2>&1 || true

# Allow SSH
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Allow Backend API
ufw allow 5000/tcp

echo -e "${YELLOW}📊 Installing monitoring tools...${NC}"
apt-get install -y \
    htop \
    iotop \
    net-tools \
    curl \
    wget

echo -e "${YELLOW}🛡️  Setting up log rotation...${NC}"
cat > /etc/logrotate.d/docker-containers << 'EOF'
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  delimiters .
  missingok
  delaycompress
  copytruncate
}
EOF

echo -e "${YELLOW}⏰ Setting up cron for backups...${NC}"
cat > /etc/cron.daily/backup-stock-area << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/stock_area"
mkdir -p $BACKUP_DIR

# Backup database
docker exec saffnco_stock_sales_backend mysqldump -u phpmyadmin -p300102 stock_sales > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
EOF

chmod +x /etc/cron.daily/backup-stock-area

echo -e "${YELLOW}🔐 Generating SSL certificates (self-signed for testing)...${NC}"
mkdir -p /etc/nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/server.key \
    -out /etc/nginx/certs/server.crt \
    -subj "/C=ID/ST=State/L=City/O=SAFFNCO/CN=20.20.0.40" 2>/dev/null || true

echo -e "${GREEN}✅ Production server setup complete!${NC}"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Clone repository: git clone <repo-url> /opt/stock_area"
echo "2. Navigate: cd /opt/stock_area"
echo "3. Deploy: chmod +x deploy.sh && ./deploy.sh"
echo "4. Verify: docker-compose -f docker-compose.prod.yml ps"
echo ""
echo -e "${YELLOW}Server Details:${NC}"
echo "IP Address: 20.20.0.40"
echo "Frontend Port: 80 (HTTP) / 443 (HTTPS)"
echo "Backend API Port: 5000"
echo "Database: MySQL on 127.0.0.1:3306"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "docker ps - List running containers"
echo "docker-compose -f docker-compose.prod.yml logs -f - View logs"
echo "docker exec saffnco_stock_sales_backend php artisan tinker - Laravel console"
echo ""
