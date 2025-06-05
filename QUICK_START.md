# ⚡ Quick Start - Deploy JagaSuara in 5 Minutes

> Get JagaSuara running on your domain in just 5 minutes with Coolify!

## 🎯 What You'll Need

1. **Coolify Server** - Your Coolify instance running
2. **Domain** - Any domain pointing to your Coolify server  
3. **5 Minutes** - That's all! ⏱️

## 🚀 5-Minute Deployment

### Step 1: Get API Key (1 minute)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in and click "Create API Key"
3. Copy the key - you'll need it in Step 3

### Step 2: Create Application in Coolify (2 minutes)
1. **Open your Coolify dashboard**
2. **Click "New Resource" → "Application"**
3. **Choose "Git Repository"**
4. **Paste this URL:**
   ```
   https://github.com/muzub/JagaSuara-coolify.git
   ```
5. **Set these options:**
   - Branch: `main`
   - Build Pack: `Docker Compose`
   - Docker Compose File: `coolify.yaml`

### Step 3: Configure Domain & Environment (1 minute)
1. **Set your domain** (e.g., `audio.yourdomain.com`)
2. **Add environment variable:**
   ```
   GEMINI_API_KEY = your_api_key_from_step_1
   ```
3. **Save settings**

### Step 4: Deploy! (1 minute)
1. **Click "Deploy" button**
2. **Wait for build to complete** (~2-3 minutes)
3. **Watch the magic happen** ✨

### Step 5: Verify & Enjoy! (30 seconds)
1. **Visit your domain** - Application should be live!
2. **Test the admin panel** at `/admin`
3. **Check health endpoint** at `/api/health`

## 🎉 You're Done!

**Congratulations!** 🎊 

Your JagaSuara AI-powered sound monitoring system is now live at:
- **🏠 Main App**: https://your-domain.com
- **⚙️ Admin Panel**: https://your-domain.com/admin
- **🩺 Health Check**: https://your-domain.com/api/health

## 🔧 What Happened Automatically?

Coolify just configured:
- ✅ **HTTPS SSL Certificate** (Let's Encrypt)
- ✅ **Domain Routing** (Traefik proxy)
- ✅ **Docker Container** (Optimized build)
- ✅ **Environment Variables** (Production ready)
- ✅ **Health Monitoring** (Built-in checks)

## 🆘 Need Help?

**Something not working?** 

1. **Check build logs** in Coolify dashboard
2. **Verify domain DNS** points to your server
3. **Confirm API key** is set correctly
4. **Read full guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
5. **Create issue**: [GitHub Issues](https://github.com/muzub/JagaSuara-coolify/issues)

## 🎯 Next Steps

Now that JagaSuara is running:

1. **📊 Configure Monitoring**
   - Visit `/admin` to set noise thresholds
   - Customize alert settings
   - Test different audio sources

2. **🎨 Customize Appearance**
   - Fork the repository
   - Modify styling in `src/` folder
   - Redeploy to see changes

3. **📈 Scale & Monitor**
   - Monitor resource usage in Coolify
   - Set up backup strategies
   - Consider CDN for global access

4. **🚀 Share & Contribute**
   - Star this repository ⭐
   - Share with your team
   - Contribute improvements

---

**Deployed with ❤️ using [Coolify](https://coolify.io) - The best self-hosted deployment platform!**

> **Pro Tip**: Bookmark your Coolify dashboard and this repository for easy updates and management!
