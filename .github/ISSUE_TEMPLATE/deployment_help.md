---
name: Deployment Help
about: Get help with Coolify deployment or configuration
title: '[DEPLOYMENT] '
labels: ['help wanted', 'deployment']
assignees: ''
---

## 🚀 Deployment Type
What type of deployment help do you need?
- [ ] First-time Coolify deployment
- [ ] Domain configuration issues
- [ ] SSL certificate problems
- [ ] Environment variable setup
- [ ] Docker build issues
- [ ] Performance optimization
- [ ] Migration from other platforms
- [ ] Other: ___________

## 🔧 Current Setup
**Coolify Information:**
- Coolify version: [e.g., v4.0.0]
- Server OS: [e.g., Ubuntu 22.04]
- Server specs: [e.g., 2 CPU, 4GB RAM]

**Domain Configuration:**
- Domain name: your-domain.com
- DNS provider: [e.g., Cloudflare, Namecheap]
- Current DNS settings: [A record pointing to server IP]

## 📋 What You've Tried
Please describe what you've already attempted:

1. Step 1: [What you did]
2. Step 2: [What happened]
3. Step 3: [Current status]

## ❌ Current Issue
**Error Messages:**
```
# Paste any error messages here
```

**Screenshots:**
<!-- Add screenshots of Coolify dashboard, error pages, etc. -->

## 🎯 Expected Outcome
What are you trying to achieve?
- [ ] Application accessible at https://my-domain.com
- [ ] SSL certificate working
- [ ] Environment variables configured
- [ ] Build completing successfully
- [ ] Health checks passing
- [ ] Other: ___________

## 📝 Configuration Files
**Environment Variables (remove sensitive data):**
```
SERVICE_FQDN_APP=my-domain.com
NODE_ENV=production
# Add other relevant variables
```

**Custom Configuration:**
Have you modified any of these files?
- [ ] coolify.yaml
- [ ] docker-compose.yml
- [ ] Dockerfile
- [ ] .env files

If yes, please share the modifications.

## 🔍 Logs and Diagnostics
**Coolify Build Logs:**
```
# Paste relevant build logs here
```

**Container Logs:**
```
# Use: docker logs jagasuara-app-1
```

**Health Check Results:**
```
# Use: curl https://your-domain.com/api/health
```

## 🌐 Network Information
**Server Details:**
- Server IP: xxx.xxx.xxx.xxx
- Open ports: 80, 443, 22
- Firewall: [enabled/disabled]

**Domain Status:**
- DNS propagation: [complete/in progress]
- Domain points to server: [yes/no/unknown]

## 🆘 Urgency Level
How urgent is this for you?
- [ ] Critical (production site down)
- [ ] High (deploying for deadline)
- [ ] Medium (development work)
- [ ] Low (learning/testing)

## 💡 Additional Context
Any other information that might help:
- Previous deployment experience
- Special requirements
- Custom configurations needed
- Integration requirements

## 🤝 Follow-up
- [ ] I can provide server access for debugging (if needed)
- [ ] I can schedule a screen share session
- [ ] I'm available for real-time troubleshooting
- [ ] I prefer asynchronous communication

---

**Quick Troubleshooting Checklist:**
Before submitting, please verify:
- [ ] Domain DNS A record points to your server IP
- [ ] Ports 80 and 443 are open on your server
- [ ] Coolify and Traefik containers are running
- [ ] You've waited 5-10 minutes for DNS propagation
- [ ] Environment variables are set in Coolify dashboard
