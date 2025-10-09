# Ubuntu Deployment Guide - Caffeine Tracker

Complete guide for deploying the Caffeine Tracker on Ubuntu servers with Cloudflare Tunnels.

## Prerequisites

- Ubuntu 20.04 LTS or newer
- Node.js 20.x or newer
- PostgreSQL 14+ installed and running
- Cloudflare account (for tunnel setup)

## Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Verify installations
node --version  # Should be v20.x or higher
psql --version  # Should be PostgreSQL 14+
```

## Step 2: Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -i -u postgres

# Create database and user
psql -c "CREATE DATABASE caffeine_tracker;"
psql -c "CREATE USER caffeine_user WITH ENCRYPTED PASSWORD 'your_secure_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE caffeine_tracker TO caffeine_user;"

# Exit postgres user
exit
```

## Step 3: Deploy Application

```bash
# Clone or upload your application files to /opt/caffeine-tracker
sudo mkdir -p /opt/caffeine-tracker
sudo chown $USER:$USER /opt/caffeine-tracker
cd /opt/caffeine-tracker

# Copy your application files here
# (upload via git, scp, or other method)

# Install dependencies
npm install --production=false

# Create .env file
cat > .env << 'EOF'
DATABASE_URL=postgresql://caffeine_user:your_secure_password@localhost:5432/caffeine_tracker
SESSION_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF

# Build the application
npm run build

# Sync database schema
npm run db:push
```

## Step 4: Create Systemd Service

Create a systemd service to run the app automatically:

```bash
sudo tee /etc/systemd/system/caffeine-tracker.service > /dev/null << 'EOF'
[Unit]
Description=Caffeine Tracker Application
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/caffeine-tracker
Environment="NODE_ENV=production"
EnvironmentFile=/opt/caffeine-tracker/.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/caffeine-tracker

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable caffeine-tracker
sudo systemctl start caffeine-tracker

# Check status
sudo systemctl status caffeine-tracker
```

## Step 5: Setup Cloudflare Tunnel

### Install Cloudflared

```bash
# Download and install cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Verify installation
cloudflared --version
```

### Configure Tunnel

```bash
# Login to Cloudflare
cloudflared tunnel login

# Create a tunnel
cloudflared tunnel create caffeine-tracker

# Note the Tunnel ID shown in the output

# Create config file
sudo mkdir -p /etc/cloudflared
sudo tee /etc/cloudflared/config.yml > /dev/null << 'EOF'
tunnel: YOUR_TUNNEL_ID
credentials-file: /root/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: caffeine.yourdomain.com
    service: http://localhost:5000
  - service: http_status:404
EOF

# Replace YOUR_TUNNEL_ID and caffeine.yourdomain.com with your values
```

### Add DNS Record

```bash
# Create DNS record pointing to tunnel
cloudflared tunnel route dns caffeine-tracker caffeine.yourdomain.com
```

### Install Tunnel as Service

```bash
# Install cloudflared as a service
sudo cloudflared service install

# Start the tunnel
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared
```

## Step 6: Verify Deployment

```bash
# Check application logs
sudo journalctl -u caffeine-tracker -f

# Check tunnel logs
sudo journalctl -u cloudflared -f

# Test local access
curl http://localhost:5000

# Test public access (after DNS propagates)
curl https://caffeine.yourdomain.com
```

## Maintenance

### View Logs
```bash
# Application logs
sudo journalctl -u caffeine-tracker -f

# Last 100 lines
sudo journalctl -u caffeine-tracker -n 100

# Tunnel logs
sudo journalctl -u cloudflared -f
```

### Restart Services
```bash
# Restart application
sudo systemctl restart caffeine-tracker

# Restart tunnel
sudo systemctl restart cloudflared
```

### Update Application
```bash
cd /opt/caffeine-tracker

# Pull latest changes
git pull  # if using git

# Install dependencies
npm install

# Rebuild
npm run build

# Sync database schema (if needed)
npm run db:push

# Restart service
sudo systemctl restart caffeine-tracker
```

### Database Backup
```bash
# Backup database
pg_dump -U caffeine_user caffeine_tracker > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U caffeine_user caffeine_tracker < backup_20241009.sql
```

## Troubleshooting

### Application won't start
```bash
# Check logs
sudo journalctl -u caffeine-tracker -n 50

# Verify database connection
psql -U caffeine_user -d caffeine_tracker -c "SELECT 1;"

# Check .env file exists and has correct values
cat /opt/caffeine-tracker/.env
```

### Database connection issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify user permissions
sudo -u postgres psql -c "\du"

# Test connection
psql "postgresql://caffeine_user:password@localhost:5432/caffeine_tracker" -c "SELECT 1;"
```

### Cloudflare Tunnel issues
```bash
# Check tunnel status
sudo systemctl status cloudflared

# Test local connection first
curl http://localhost:5000

# Verify DNS record
nslookup caffeine.yourdomain.com

# Check tunnel config
sudo cat /etc/cloudflared/config.yml
```

## Security Recommendations

1. **Use strong passwords** for database users
2. **Keep system updated**: `sudo apt update && sudo apt upgrade`
3. **Enable UFW firewall** (only allow SSH):
   ```bash
   sudo ufw allow ssh
   sudo ufw enable
   ```
4. **Regular backups** of database
5. **Monitor logs** for suspicious activity
6. **Use HTTPS** (Cloudflare provides this automatically)

## Performance Tuning

### PostgreSQL Optimization
```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/14/main/postgresql.conf

# Recommended settings for small/medium deployments:
# shared_buffers = 256MB
# effective_cache_size = 1GB
# maintenance_work_mem = 64MB
# checkpoint_completion_target = 0.9
# wal_buffers = 16MB
# default_statistics_target = 100
# random_page_cost = 1.1
# effective_io_concurrency = 200

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Node.js Process Manager (Alternative to systemd)

If you prefer PM2:

```bash
# Install PM2
sudo npm install -g pm2

# Start application
cd /opt/caffeine-tracker
pm2 start dist/index.js --name caffeine-tracker

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
```

## Port Configuration

The application runs on port 5000 by default. To change:

1. Edit `server/index.ts` and change the port number
2. Rebuild: `npm run build`
3. Update Cloudflare tunnel config at `/etc/cloudflared/config.yml`
4. Restart both services

## Support

For issues or questions:
- Check application logs first
- Verify all environment variables are set correctly
- Ensure PostgreSQL is running and accessible
- Test Cloudflare tunnel connectivity

---

**Note**: This guide assumes a fresh Ubuntu installation. Adjust paths and commands based on your specific setup.
