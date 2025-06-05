# Coolify Deployment Configuration
# JagaSuara - AI-Powered Voice Monitoring Application

## Application Information
- **Name**: JagaSuara
- **Type**: Next.js Application
- **Domain**: your-domain.com (replace with your actual domain)
- **Port**: 3000
- **Build Pack**: Docker

## Environment Variables Required
```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0
SERVICE_FQDN_APP=your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Coolify Setup Instructions

### 1. Create New Resource
1. Go to your Coolify dashboard
2. Click "New Resource"
3. Select "Application"
4. Choose "Docker Compose" as build pack

### 2. Repository Configuration
- **Repository URL**: [Your Git Repository URL]
- **Branch**: main
- **Build Pack**: Docker Compose
- **Docker Compose File**: `coolify.yaml`

### 3. Domain Configuration
- **Domain**: your-domain.com (configure with your actual domain)
- **HTTPS**: Enabled (Let's Encrypt)
- **Force HTTPS**: Yes

### 4. Environment Variables
Set the following environment variables in Coolify:
- `SERVICE_FQDN_APP`: your-domain.com
- `NEXT_PUBLIC_APP_URL`: https://your-domain.com

### 5. Network Configuration
- Ensure the application is connected to the `coolify` network
- Traefik proxy will handle SSL/TLS certificates automatically

### 6. Health Check
- **Health Check URL**: /api/health
- **Expected Status**: 200
- **Expected Response**: `{"status":"ok"}`

## Features
- AI-powered voice monitoring using Gemini API
- Real-time audio level detection
- Customizable noise thresholds
- Modern UI with Tailwind CSS and shadcn/ui components
- Responsive design
- Admin panel for configuration

## Technology Stack
- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **AI**: Google Gemini API via Genkit
- **Deployment**: Docker, Coolify, Traefik proxy
- **SSL**: Let's Encrypt automatic certificates

## Deployment Status

### ✅ Build Process Completed Successfully
- Repository cloned from GitHub: `muzub/JagaSuara-coolify`
- Docker build completed: Next.js 15.2.3 compiled successfully
- Static pages generated: 7/7 pages
- Container created and started successfully
- Build time: ~34 seconds

### 📋 Application Details
- Container ID: `app-{project-id}-{timestamp}`
- Build completed in ~29 seconds
- All routes compiled successfully:
  - `/` (19.5 kB)
  - `/admin` (32.4 kB)
  - `/api/health` (136 B)
  - `/_not-found` (977 B)

### 🔍 Post-Deployment Verification
After deployment, verify your application:
1. **Main App**: Access your domain directly
2. **Health Check**: `curl https://your-domain.com/api/health`
3. **Admin Panel**: `https://your-domain.com/admin`
4. **SSL Certificate**: Should be automatically configured by Traefik

### 🐛 Common Issues & Solutions
**503 Service Unavailable:**
- Wait 1-2 minutes for container to fully start
- Check Coolify logs for container startup
- Verify domain DNS is pointing to Coolify server

**SSL Certificate Issues:**
- Let's Encrypt may take up to 5 minutes to issue certificate
- Verify domain DNS propagation
- Check Traefik proxy configuration
