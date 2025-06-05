# 🚀 Complete Deployment Guide for JagaSuara

This guide will help you deploy JagaSuara to **any domain** using Coolify.

## 📋 Prerequisites

1. **Coolify Server** - Running on your VPS
2. **Domain** - Point your domain to your Coolify server
3. **Gemini API Key** - Get from [Google AI Studio](https://aistudio.google.com/app/apikey)

## 🔧 Step-by-Step Deployment

### 1. Prepare Your Domain

Ensure your domain DNS is pointing to your Coolify server IP:
```bash
# Check if your domain points to your server
nslookup your-domain.com
```

### 2. Fork or Clone Repository

Option A - **Fork this repository** (Recommended):
1. Go to https://github.com/muzub/JagaSuara-coolify
2. Click "Fork" button
3. Use your forked repository URL in Coolify

Option B - **Clone directly**:
```bash
git clone https://github.com/muzub/JagaSuara-coolify.git
cd JagaSuara-coolify
```

### 3. Deploy with Coolify

1. **Login to Coolify Dashboard**
   - Go to your Coolify instance (e.g., `https://coolify.your-server.com`)

2. **Create New Application**
   - Click "New Resource" → "Application"
   - Choose "Git Repository"

3. **Repository Configuration**
   ```
   Repository: https://github.com/muzub/JagaSuara-coolify.git
   Branch: main
   Build Pack: Docker Compose
   Docker Compose File: coolify.yaml
   ```

4. **Domain Configuration**
   ```
   Domain: your-domain.com
   HTTPS: Enabled
   Force HTTPS: Yes
   ```

5. **Environment Variables** (Set in Coolify UI)
   ```bash
   # Required - Add your Gemini API key
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Auto-configured by Coolify
   SERVICE_FQDN_APP=${SERVICE_FQDN_APP}
   NEXT_PUBLIC_APP_URL=https://${SERVICE_FQDN_APP}
   
   # Standard configuration
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   PORT=3000
   HOSTNAME=0.0.0.0
   ```

6. **Deploy Application**
   - Click "Deploy" button
   - Wait for build to complete (~2-3 minutes)

### 4. Verify Deployment

After deployment, verify everything works:

```bash
# Health check
curl https://your-domain.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-06-05T..."}
```

**Access Points:**
- 🏠 **Main App**: https://your-domain.com
- ⚙️ **Admin Panel**: https://your-domain.com/admin
- 🩺 **Health Check**: https://your-domain.com/api/health

## ⚙️ Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | - | ✅ Yes |
| `SERVICE_FQDN_APP` | Your domain | Auto-set by Coolify | ✅ Yes |
| `NEXT_PUBLIC_APP_URL` | Full app URL | Auto-set by Coolify | ✅ Yes |
| `NODE_ENV` | Environment | production | ✅ Yes |
| `PORT` | Server port | 3000 | ✅ Yes |

### Getting Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to Coolify environment variables

## 🔧 Troubleshooting

### Common Issues

**1. Build Fails**
```bash
# Check build logs in Coolify
# Usually caused by missing environment variables
```

**2. Domain Not Accessible**
```bash
# Check DNS configuration
nslookup your-domain.com

# Check Coolify proxy logs
docker logs coolify-proxy
```

**3. SSL Certificate Issues**
```bash
# Coolify handles Let's Encrypt automatically
# Ensure domain points to your server
# Wait 2-3 minutes for certificate generation
```

**4. Application Errors**
```bash
# Check application logs in Coolify
# Verify GEMINI_API_KEY is set correctly
```

### Debug Commands

```bash
# Check container status
docker ps | grep jagasuara

# View application logs
docker logs <container-id>

# Test health endpoint
curl -v https://your-domain.com/api/health
```

## 🎯 Production Tips

### Performance Optimization

1. **Enable Gzip Compression** (Auto-enabled via Traefik)
2. **CDN Integration** - Use Cloudflare or similar
3. **Monitor Resource Usage** - CPU/Memory in Coolify

### Security Best Practices

1. **API Key Security**
   - Never commit API keys to Git
   - Use Coolify environment variables only
   
2. **Domain Security**
   - Enable HTTPS (Auto-configured)
   - Force HTTPS redirects (Auto-configured)

3. **Regular Updates**
   - Pull latest changes regularly
   - Monitor security updates

### Backup Strategy

1. **Environment Variables Backup**
   - Export Coolify environment variables
   - Store securely (encrypted)

2. **Database Backup** (if you add one later)
   - Use Coolify backup features
   - Regular automated backups

## 📞 Support

### Getting Help

1. **Repository Issues**: [GitHub Issues](https://github.com/muzub/JagaSuara-coolify/issues)
2. **Coolify Documentation**: [Coolify Docs](https://coolify.io/docs)
3. **Community Support**: [Coolify Discord](https://coollabs.io/discord)

### Reporting Issues

When reporting issues, include:
- Coolify version
- Docker/OS version
- Error logs (remove sensitive data)
- Steps to reproduce

---

## 🎉 Success!

Your JagaSuara application should now be running at `https://your-domain.com`!

**What's Next?**
- Configure noise thresholds in admin panel
- Customize the UI/branding
- Add monitoring/analytics
- Scale horizontally if needed

---
**Deployed with ❤️ using [Coolify](https://coolify.io)**
