# Caffeine Tracker - Ubuntu Deployment Guide

This guide will walk you through deploying the Caffeine Tracker application on your own Ubuntu server and exposing it to the internet using Cloudflare Tunnels.

## Prerequisites

- Ubuntu 20.04 or later
- Root or sudo access
- A Cloudflare account (free tier works)
- A domain managed by Cloudflare (optional, but recommended)

## Step 1: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

## Step 2: Install Node.js 20

```bash
# Install Node.js 20 using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

## Step 3: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE caffeine_tracker;
CREATE USER caffeine_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE caffeine_tracker TO caffeine_user;
\c caffeine_tracker
GRANT ALL ON SCHEMA public TO caffeine_user;
EOF
```

## Step 4: Set Up Application

```bash
# Create application directory
sudo mkdir -p /opt/caffeine-tracker
sudo chown $USER:$USER /opt/caffeine-tracker
cd /opt/caffeine-tracker

# Copy your application files here
# (You can use git clone, scp, or rsync to transfer files)
# Example with git:
# git clone <your-repo-url> .

# Or if uploading manually, copy all project files to /opt/caffeine-tracker
```

## Step 5: Install Dependencies

```bash
cd /opt/caffeine-tracker
npm install
```

## Step 6: Configure Environment Variables

```bash
# Create .env file
nano .env
```

Add the following content (replace with your actual values):

```env
# Database Configuration
DATABASE_URL=postgresql://caffeine_user:your_secure_password_here@localhost:5432/caffeine_tracker
PGHOST=localhost
PGPORT=5432
PGUSER=caffeine_user
PGPASSWORD=your_secure_password_here
PGDATABASE=caffeine_tracker

# Session Secret (generate a random string)
SESSION_SECRET=your_random_session_secret_here_min_32_chars

# Node Environment
NODE_ENV=production
PORT=5000
```

To generate a secure session secret:
```bash
openssl rand -base64 32
```

## Step 7: Set Up Database Schema

```bash
# Run database migrations
npm run db:push
```

## Step 8: Build Application

```bash
# Build the frontend and backend
npm run build
```

## Step 9: Test Application

```bash
# Start the application
npm run dev

# In another terminal, test it
curl http://localhost:5000
```

If it works, press Ctrl+C to stop it. Now let's set it up as a service.

## Step 10: Create systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/caffeine-tracker.service
```

Add the following content:

```ini
[Unit]
Description=Caffeine Tracker Application
After=network.target postgresql.service

[Service]
Type=simple
User=your_username
WorkingDirectory=/opt/caffeine-tracker
Environment=NODE_ENV=production
EnvironmentFile=/opt/caffeine-tracker/.env
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Replace `your_username` with your actual Ubuntu username.

```bash
# Reload systemd, enable and start service
sudo systemctl daemon-reload
sudo systemctl enable caffeine-tracker
sudo systemctl start caffeine-tracker

# Check status
sudo systemctl status caffeine-tracker

# View logs
sudo journalctl -u caffeine-tracker -f
```

## Step 11: Install Cloudflare Tunnel (cloudflared)

```bash
# Download and install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Verify installation
cloudflared --version
```

## Step 12: Authenticate Cloudflare Tunnel

```bash
# Login to Cloudflare (this will open a browser)
cloudflared tunnel login
```

This will:
1. Open your browser
2. Ask you to select a domain
3. Save credentials to `~/.cloudflared/cert.pem`

## Step 13: Create Cloudflare Tunnel

```bash
# Create a tunnel (replace 'caffeine-tracker' with your preferred tunnel name)
cloudflared tunnel create caffeine-tracker

# Note the Tunnel ID from the output - you'll need it
# It will also create credentials in ~/.cloudflared/<tunnel-id>.json
```

## Step 14: Configure Cloudflare Tunnel

```bash
# Create config directory if it doesn't exist
sudo mkdir -p /etc/cloudflared

# Create tunnel configuration
sudo nano /etc/cloudflared/config.yml
```

Add the following content (replace values with your own):

```yaml
tunnel: <your-tunnel-id>
credentials-file: /home/your_username/.cloudflared/<your-tunnel-id>.json

ingress:
  - hostname: caffeine.yourdomain.com
    service: http://localhost:5000
  - service: http_status:404
```

Replace:
- `<your-tunnel-id>` with your tunnel ID from step 13
- `your_username` with your Ubuntu username
- `caffeine.yourdomain.com` with your desired subdomain

## Step 15: Create DNS Record

```bash
# Create DNS record pointing to your tunnel
cloudflared tunnel route dns caffeine-tracker caffeine.yourdomain.com
```

Replace `caffeine.yourdomain.com` with your desired domain.

## Step 16: Install Cloudflare Tunnel as a Service

```bash
# Copy credentials to system location
sudo cp ~/.cloudflared/<your-tunnel-id>.json /etc/cloudflared/

# Install cloudflared as a service
sudo cloudflared service install

# Start the service
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared
```

## Step 17: Verify Everything Works

1. Check application is running:
```bash
sudo systemctl status caffeine-tracker
```

2. Check Cloudflare tunnel is running:
```bash
sudo systemctl status cloudflared
```

3. Visit your domain in a browser:
```
https://caffeine.yourdomain.com
```

Your application should now be accessible from the internet!

## Firewall Configuration (Optional but Recommended)

```bash
# If using UFW firewall
sudo ufw allow ssh
sudo ufw enable

# Note: You DON'T need to open port 5000 since Cloudflare Tunnel handles everything
```

## Maintenance Commands

### View Application Logs
```bash
sudo journalctl -u caffeine-tracker -f
```

### View Cloudflare Tunnel Logs
```bash
sudo journalctl -u cloudflared -f
```

### Restart Application
```bash
sudo systemctl restart caffeine-tracker
```

### Restart Cloudflare Tunnel
```bash
sudo systemctl restart cloudflared
```

### Update Application
```bash
cd /opt/caffeine-tracker
git pull  # If using git
npm install
npm run build
sudo systemctl restart caffeine-tracker
```

### Database Backup
```bash
# Backup database
sudo -u postgres pg_dump caffeine_tracker > backup_$(date +%Y%m%d).sql

# Restore database
sudo -u postgres psql caffeine_tracker < backup_20241008.sql
```

## Troubleshooting

### Application Won't Start
```bash
# Check logs
sudo journalctl -u caffeine-tracker -n 50

# Check if port 5000 is in use
sudo lsof -i :5000

# Test database connection
psql -h localhost -U caffeine_user -d caffeine_tracker
```

### Cloudflare Tunnel Issues
```bash
# Check tunnel status
sudo cloudflared tunnel info caffeine-tracker

# Test tunnel connection
sudo cloudflared tunnel run caffeine-tracker

# Check DNS
nslookup caffeine.yourdomain.com
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*-main.log

# Test connection
psql -h localhost -U caffeine_user -d caffeine_tracker -c "SELECT 1;"
```

## Security Recommendations

1. **Use strong passwords** for database and session secret
2. **Keep system updated**: `sudo apt update && sudo apt upgrade`
3. **Enable automatic security updates**:
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```
4. **Regular backups**: Set up automated database backups
5. **Monitor logs**: Regularly check application and system logs
6. **Firewall**: Only expose necessary ports (SSH only, since Cloudflare Tunnel handles web traffic)

## Additional Resources

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## Support

For issues specific to this application, check the application logs:
```bash
sudo journalctl -u caffeine-tracker -f
```

For Cloudflare Tunnel issues:
```bash
sudo journalctl -u cloudflared -f
```
