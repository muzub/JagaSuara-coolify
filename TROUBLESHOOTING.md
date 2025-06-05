# Troubleshooting Guide - JagaSuara Coolify Deployment

## 🔍 Common Deployment Issues

### 1. **503 Service Unavailable Error**

**Symptoms:**
```bash
curl: HTTP/2 503
no available server
```

**Causes & Solutions:**

#### A. Container Still Starting
- **Wait Time**: Allow 1-2 minutes for container to fully initialize
- **Check Logs**: Go to Coolify dashboard → Your app → Logs tab
- **Container Status**: Verify container is running in Coolify

#### B. Port Configuration Issues
```yaml
# Check your coolify.yaml
services:
  app:
    ports:
      - "3000:3000"  # Make sure this matches your app's PORT
```

#### C. Health Check Failing
```javascript
// Verify /api/health endpoint exists in your app
// File: src/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: "ok" });
}
```

### 2. **SSL Certificate Issues**

**Symptoms:**
```bash
SSL certificate problem: self-signed certificate
```

**Solutions:**

#### A. Wait for Let's Encrypt
- Initial certificate generation: 2-5 minutes
- Check Coolify logs for certificate generation status

#### B. DNS Configuration
```bash
# Verify DNS is pointing to your Coolify server
dig your-domain.com
nslookup your-domain.com
```

#### C. Domain Configuration in Coolify
1. Go to your app in Coolify
2. Navigate to "Domains" tab
3. Ensure domain is correctly set
4. Enable "Force HTTPS"

### 3. **Environment Variables Not Working**

**Check Configuration:**
```bash
# In Coolify dashboard, verify these are set:
SERVICE_FQDN_APP=your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### 4. **Build Failures**

**Common Issues:**

#### A. Missing Dependencies
```bash
# Check package.json for all required dependencies
npm ci  # Should run without errors locally
```

#### B. TypeScript Errors
```bash
# In Coolify build logs, look for:
# "Type checking and linting..."
# Fix any TypeScript errors in your code
```

#### C. Docker Build Issues
```dockerfile
# Verify your Dockerfile is using correct Node version
FROM node:18-alpine  # Match your local Node version
```

### 5. **Network Connectivity Issues**

**Debug Steps:**

#### A. Check Container Status
```bash
# In Coolify server terminal:
docker ps | grep your-app-name
docker logs container-id
```

#### B. Test Internal Connectivity
```bash
# From Coolify server:
docker exec container-id curl localhost:3000/api/health
```

#### C. Verify Traefik Configuration
```bash
# Check if Traefik is running:
docker ps | grep traefik
```

## 🛠️ Debugging Commands

### Container Inspection
```bash
# List all containers
docker ps -a

# Check specific container logs
docker logs <container-id> --tail 50

# Execute command in container
docker exec -it <container-id> sh
```

### Network Debugging
```bash
# Test from inside Coolify network
docker run --rm --network coolify alpine/curl curl http://your-container:3000/api/health

# Check Traefik routing
curl -H "Host: your-domain.com" http://localhost/api/health
```

### Application-Specific
```bash
# Check if app is responding on correct port
curl http://localhost:3000/api/health  # From inside container

# Verify environment variables
docker exec <container-id> printenv | grep NEXT_PUBLIC
```

## 📝 Success Verification Checklist

- [ ] ✅ Build completed without errors
- [ ] ✅ Container is running (`docker ps`)
- [ ] ✅ Health endpoint responds: `curl https://your-domain.com/api/health`
- [ ] ✅ Main page loads: `curl https://your-domain.com`
- [ ] ✅ Admin panel accessible: `https://your-domain.com/admin`
- [ ] ✅ SSL certificate valid (no browser warnings)
- [ ] ✅ Environment variables properly set

## 🆘 Getting Help

If you're still experiencing issues:

1. **Coolify Logs**: Always check the deployment logs in Coolify dashboard
2. **Container Logs**: Check container runtime logs for application errors
3. **GitHub Issues**: Report issues at [JagaSuara-coolify Issues](https://github.com/muzub/JagaSuara-coolify/issues)
4. **Coolify Community**: Join [Coolify Discord](https://discord.gg/coolify)

## 📋 Information to Include When Reporting Issues

```
- Coolify version: 
- Deployment logs (paste relevant sections)
- Container logs: docker logs <container-id>
- Domain configuration
- Environment variables (remove sensitive data)
- Error messages (exact text)
```

---

**Remember**: Most deployment issues resolve within 2-5 minutes. If the build completed successfully, the application will likely start working shortly! 🚀
