# JagaSuara - Coolify Deployment Guide

## 🚀 Quick Deployment with Coolify

JagaSuara is fully compatible with Coolify and ready for one-click deployment with user-configurable domains. This repository contains all the necessary configuration files for seamless deployment on any domain.

## 📁 Coolify Configuration Files

- `coolify.yaml` - Main Coolify deployment configuration
- `docker-compose.yml` - Alternative Docker Compose configuration  
- `Dockerfile` - Multi-stage container build configuration
- `.env.example` - Environment variables template
- `coolify.json` - Coolify metadata configuration
- `deploy.sh` - Automated deployment script

## 🔧 Deployment Steps

### 1. Prerequisites
- Coolify instance running with Traefik proxy
- Domain name pointing to your server (e.g., `your-domain.com`)
- Git repository access
- DNS A record configured for your domain

### 2. Create New Application in Coolify

1. **Navigate to your Coolify dashboard**
2. **Click "New Resource" → "Application"**
3. **Configure the application:**
   - **Name**: JagaSuara (or your preferred name)
   - **Build Pack**: Docker Compose
   - **Repository URL**: [Your repository URL]
   - **Branch**: main
   - **Docker Compose file**: `coolify.yaml`

### 3. Domain Configuration

1. **Set your domain**: `your-domain.com` (replace with your actual domain)
2. **Enable HTTPS**: ✅ (Let's Encrypt)
3. **Force HTTPS redirect**: ✅
4. **Verify DNS**: Ensure your domain's A record points to your server

> **Important**: The configuration automatically adapts to your domain through the `SERVICE_FQDN_APP` environment variable.

### 4. Environment Variables

Set these **required** environment variables in Coolify (replace `your-domain.com` with your actual domain):

```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0
SERVICE_FQDN_APP=your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Optional variables:**
```bash
# Google Gemini API for AI features (recommended)
GEMINI_API_KEY=your_gemini_api_key_here

# Custom branding (optional)
NEXT_PUBLIC_APP_NAME=JagaSuara
```

> **Note**: The `SERVICE_FQDN_APP` variable is crucial as it configures all Traefik labels and internal URLs automatically.

### 5. Deploy

1. **Click "Deploy"** in Coolify
2. **Monitor build logs** for any issues
3. **Wait for completion** (usually 2-5 minutes)
4. **Verify deployment** at `https://your-domain.com`

### 6. Alternative: Manual Docker Deployment

If you prefer manual deployment, use the included script:

```bash
# Clone the repository
git clone [your-repo-url] jagasuara
cd jagasuara

# Set your domain
export SERVICE_FQDN_APP=your-domain.com
export NEXT_PUBLIC_APP_URL=https://your-domain.com

# Deploy
chmod +x deploy.sh
./deploy.sh
```

## ✅ Verification

After deployment, verify these endpoints (replace `your-domain.com` with your actual domain):

- **Main app**: `https://your-domain.com`
- **Health check**: `https://your-domain.com/api/health`
- **Admin panel**: `https://your-domain.com/admin`

Expected health check response:
```json
{
  "status": "ok",
  "timestamp": "2025-06-04T09:52:52.109Z",
  "service": "JagaSuara",
  "version": "1.0.0"
}
```

### Quick Health Check

```bash
# Replace with your domain
curl https://your-domain.com/api/health

# Expected: HTTP 200 with JSON response above
```

## 🏗️ Architecture

```
Internet → DNS → Traefik Proxy → JagaSuara Container (Port 3000)
               ↓
        Let's Encrypt SSL
               ↓
        Your Domain (HTTPS)
```

**Key Components:**
- **Traefik**: Reverse proxy with automatic SSL
- **Next.js App**: React-based web application
- **Docker**: Containerized deployment
- **Coolify**: Deployment orchestration

## 🔍 Features

- **AI-powered voice monitoring** using Google Gemini API
- **Real-time audio level detection**
- **Customizable noise thresholds**
- **Modern UI** with Tailwind CSS and shadcn/ui
- **Admin panel** for configuration
- **Responsive design** for all devices

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components  
- **AI/ML**: Google Gemini API via Genkit
- **Audio**: Web Audio API for real-time monitoring
- **Deployment**: Docker multi-stage builds, Coolify
- **Proxy**: Traefik with automatic SSL (Let's Encrypt)
- **Monitoring**: Built-in health checks and logging

## 🚨 Troubleshooting

### Build Issues
- **Dependencies**: Ensure all packages are in `package.json`
- **UI Components**: Verify shadcn/ui components are properly installed
- **Local Test**: Build Docker image locally first: `docker build -t jagasuara .`
- **Node Version**: Using Node.js 18+ in Dockerfile

### Domain & SSL Issues
- **DNS**: Verify A record points to your server IP
- **Domain Propagation**: Wait 5-10 minutes for DNS changes
- **Traefik Labels**: Check container has correct labels: `docker inspect jagasuara-app-1`
- **Network**: Ensure Coolify network exists: `docker network ls | grep coolify`
- **SSL**: Let's Encrypt can take 1-2 minutes to issue certificates

### Environment Issues
- **Variables**: Check all required env vars are set in Coolify dashboard
- **Domain Mismatch**: Ensure `SERVICE_FQDN_APP` matches your actual domain
- **Port Conflicts**: Default port 3000 should be available inside container

### Runtime Issues
- **Container Status**: `docker ps | grep jagasuara`
- **Application Logs**: `docker logs jagasuara-app-1`
- **Health Check**: `curl https://your-domain.com/api/health`

### Common Solutions
1. **502 Bad Gateway**: Container not started, check logs
2. **SSL Certificate Issues**: Wait or check DNS configuration  
3. **Build Failures**: Review Coolify build logs, check Dockerfile
4. **Domain Not Resolving**: Verify DNS A record configuration

## 📞 Support & Debugging

If you encounter issues during deployment:

### Step-by-Step Debugging
1. **Check Coolify build logs** in the dashboard
2. **Verify container status**: `docker ps | grep jagasuara`
3. **Check application logs**: `docker logs jagasuara-app-1`
4. **Test health endpoint**: `curl https://your-domain.com/api/health`
5. **Inspect container**: `docker inspect jagasuara-app-1`

### Useful Commands
```bash
# Check if container is running
docker ps | grep jagasuara

# View recent logs
docker logs --tail 50 jagasuara-app-1

# Test locally (if deployed manually)
curl http://localhost:3000/api/health

# Check Traefik configuration
docker logs traefik | grep your-domain.com
```

### Getting Help
- Check application logs for specific error messages
- Verify all environment variables are correctly set
- Ensure your domain DNS is properly configured
- Test with a simple curl command first

## 🔒 Security Considerations

- **HTTPS Only**: All traffic is automatically redirected to HTTPS
- **API Keys**: Store Gemini API key securely in environment variables
- **CORS**: Configured for your specific domain only
- **Headers**: Security headers automatically applied by Traefik

## 🎉 Success!

Your JagaSuara application should now be successfully deployed and accessible at `https://your-domain.com` with:

✅ **Automatic SSL certificates** (Let's Encrypt)  
✅ **Optimized performance** through Traefik proxy  
✅ **Health monitoring** via `/api/health` endpoint  
✅ **Responsive design** for all devices  
✅ **AI-powered audio monitoring** (with Gemini API key)  

## 🚀 Next Steps

1. **Configure Gemini API** for AI features
2. **Customize branding** in admin panel
3. **Set up monitoring** alerts (optional)
4. **Configure backup** strategies (optional)

---

**Deployment Complete!** 🎊 Your JagaSuara application is now live and ready to monitor audio with AI-powered insights.
