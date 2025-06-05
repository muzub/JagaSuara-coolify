# JagaSuara - Coolify Edition

> 🎵 AI-powered sound monitoring system with one-click Coolify deployment

[![Deploy on Coolify](https://img.shields.io/badge/Deploy%20on-Coolify-blue?style=for-the-badge&logo=docker)](https://coolify.io)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)](https://www.docker.com/)

## 🚀 One-Click Deployment

**Deploy to any domain in minutes with Coolify!**

This repository is specifically optimized for [Coolify](https://coolify.io) deployment with user-configurable domains. No hardcoded URLs - works with any domain you own.

### 📖 Complete Deployment Guide

**New to Coolify?** 
- 🚀 **[Quick Start Guide](./QUICK_START.md)** - Deploy in 5 minutes (beginners)
- 📖 **[Complete Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Detailed step-by-step instructions
- ⚙️ **[Coolify Configuration](./COOLIFY_README.md)** - Advanced Coolify setup

### Quick Deploy Steps:

1. **Get Gemini API Key** (Required for AI features)
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create an API key (free)

2. **Fork this repository** 
   - Click "Fork" on this GitHub page
   - Or use the repository URL directly: `https://github.com/muzub/JagaSuara-coolify.git`

3. **Deploy with Coolify**
   - Open your Coolify dashboard
   - Create new application → Git Repository
   - Repository: Your forked repo or this URL
   - Build Pack: Docker Compose
   - Set your domain in Coolify

4. **Configure Environment Variables**
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

5. **Deploy!** ✨

**That's it!** Your JagaSuara instance will be live at your domain with HTTPS automatically configured.

### 🎯 What You'll Get

✅ **Live Application** at `https://your-domain.com`  
✅ **Admin Panel** at `https://your-domain.com/admin`  
✅ **Automatic HTTPS** with Let's Encrypt  
✅ **Health Monitoring** at `https://your-domain.com/api/health`  
✅ **Production Ready** with optimized Docker build

## 🎯 Features

### 🔊 Audio Monitoring
- **Real-time audio level detection** using Web Audio API
- **Customizable noise thresholds** for different environments
- **Visual audio level indicators** with responsive design
- **Audio event logging** and history

### 🤖 AI-Powered Analysis
- **Google Gemini AI integration** for intelligent sound analysis
- **Automatic sound classification** and event detection
- **Smart alerts** based on audio patterns
- **Contextual insights** about audio environment

### 🎨 Modern Interface
- **Beautiful, responsive UI** built with Tailwind CSS
- **shadcn/ui components** for consistent design
- **Dark/light mode support** with system preference detection
- **Mobile-optimized** interface for monitoring on-the-go

### ⚙️ Admin Panel
- **Configuration management** for all settings
- **Real-time monitoring dashboard** with live metrics
- **User preferences** and customization options
- **System health monitoring** and diagnostics

## 🏗️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **AI**: Google Gemini API via Genkit
- **Audio**: Web Audio API
- **Deployment**: Docker, Coolify, Traefik
- **SSL**: Automatic Let's Encrypt certificates

## 📦 Coolify Configuration

This repository includes all necessary files for seamless Coolify deployment:

- `coolify.yaml` - Main deployment configuration
- `docker-compose.yml` - Alternative deployment method
- `Dockerfile` - Multi-stage optimized container build
- `.env.example` - Environment variables template
- `coolify.json` - Coolify metadata and settings
- `deploy.sh` - Automated deployment script
- `validate-deployment.sh` - Post-deployment validation

## 🔧 Environment Variables

### Required Variables (Auto-configured by Coolify)
```bash
NODE_ENV=production
SERVICE_FQDN_APP=${SERVICE_FQDN_APP}  # Your domain (auto-set)
NEXT_PUBLIC_APP_URL=https://${SERVICE_FQDN_APP}  # Full URL (auto-set)
PORT=3000
HOSTNAME=0.0.0.0
```

### Required Variables (You must set)
```bash
# Google Gemini API for AI features
GEMINI_API_KEY=your_gemini_api_key_here
```

### Optional Variables
```bash
# Custom branding
NEXT_PUBLIC_APP_NAME=JagaSuara

# Disable Next.js telemetry
NEXT_TELEMETRY_DISABLED=1
```

## 🌐 Flexible Domain Configuration

Works with any domain! Coolify automatically configures:
- ✅ Custom domains (e.g., `monitoring.yourcompany.com`)
- ✅ Subdomains (e.g., `jagasuara.yourdomain.com`) 
- ✅ Root domains (e.g., `yourdomain.com`)
- ✅ HTTPS with Let's Encrypt certificates
- ✅ HTTP to HTTPS redirects

Unlike many deployment templates, JagaSuara is designed to work with **any domain**:

- **No hardcoded URLs** - everything is configurable
- **Automatic SSL** - Let's Encrypt certificates for any domain
- **Traefik integration** - professional reverse proxy setup
- **Environment-based** - set your domain once, works everywhere

### Supported Domain Examples:
- `jagasuara.yourdomain.com`
- `audio-monitor.company.com`
- `sound.mydomain.org`
- `monitoring.example.net`

## 📚 Documentation

### 📖 Deployment Guides
- **[⚡ Quick Start](./QUICK_START.md)** - Deploy in 5 minutes!
- **[📖 Complete Guide](./DEPLOYMENT_GUIDE.md)** - Step-by-step for beginners  
- **[⚙️ Coolify Setup](./COOLIFY_README.md)** - Advanced configuration
- **[🤝 Contributing](./CONTRIBUTING.md)** - How to contribute

### 🛠️ Support & Troubleshooting
- **[🔧 Troubleshooting Guide](./TROUBLESHOOTING.md)** - Fix common deployment issues
- **[📋 Configuration Examples](./COOLIFY_DEPLOYMENT.md)** - Coolify-specific settings

### 📋 Project Information  
- **[🎵 Features Overview](./FEATURES.md)** - Complete feature list
- **[📄 License](./LICENSE)** - MIT License details

### 📋 Quick Start

1. **Prerequisites**
   - Coolify instance with domain
   - Gemini API key (free from Google AI Studio)

2. **Deploy to Coolify**
   - Fork this repository
   - Create new application in Coolify
   - Set your repository URL and domain
   - Add GEMINI_API_KEY environment variable
   - Deploy! ✨

3. **Verify Deployment**
   ```bash
   curl https://your-domain.com/api/health
   ```

4. **Access Your Application**
   - **Main App**: `https://your-domain.com`
   - **Admin Panel**: `https://your-domain.com/admin`

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/muzub/JagaSuara-coolify.git
cd JagaSuara-coolify

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your settings

# Start development server
npm run dev

# Open http://localhost:3000
```

## 🐳 Docker Deployment

For manual Docker deployment:

```bash
# Build and deploy with custom domain
export SERVICE_FQDN_APP=your-domain.com
docker-compose up -d

# Or use the automated script
chmod +x deploy.sh
./deploy.sh
```

## 📖 Detailed Documentation

- **[Coolify Deployment Guide](COOLIFY_README.md)** - Comprehensive deployment instructions
- **[Docker Configuration](Dockerfile)** - Multi-stage build details
- **[Environment Setup](.env.example)** - All configuration options

## 🚨 Troubleshooting

### Common Issues

**🔴 Build Failures**
- Check Node.js version (requires 18+)
- Verify all dependencies in package.json
- Review Coolify build logs

**🔴 Domain Issues**
- Verify DNS A record points to your server
- Check domain configuration in Coolify
- Wait 5-10 minutes for DNS propagation

**🔴 SSL Problems**
- Let's Encrypt needs valid domain
- Check Traefik proxy configuration
- Verify port 80/443 are accessible

### Validation Script

Use the included validation script to diagnose issues:

```bash
# Run validation
chmod +x validate-deployment.sh
SERVICE_FQDN_APP=your-domain.com ./validate-deployment.sh
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Coolify deployment
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Coolify](https://coolify.io) for amazing deployment platform
- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- [Next.js](https://nextjs.org) for the excellent framework
- [Google Gemini](https://ai.google.dev) for AI capabilities

## 🎉 Success Stories

Deploy JagaSuara to monitor:
- **Office environments** for noise level compliance
- **Study spaces** for optimal learning conditions
- **Recording studios** for acoustic monitoring
- **Public spaces** for sound pollution tracking

---

**Ready to deploy?** [Get started with Coolify](https://coolify.io) and have JagaSuara running on your domain in minutes! 🚀
