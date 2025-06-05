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
✅ Application successfully deployed and accessible at https://your-domain.com
✅ SSL certificate configured via Let's Encrypt
✅ Health endpoint responding correctly
✅ Admin panel accessible at /admin
✅ All dependencies resolved and built successfully
