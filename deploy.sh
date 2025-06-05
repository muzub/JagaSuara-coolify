#!/bin/bash
# JagaSuara Coolify Deployment Script

set -e

# Configuration
DOMAIN=${SERVICE_FQDN_APP:-"localhost:3000"}
if [ "$DOMAIN" = "localhost:3000" ]; then
    echo "⚠️  Warning: Using default domain (localhost:3000)"
    echo "   Set SERVICE_FQDN_APP environment variable for production deployment"
    echo "   Example: export SERVICE_FQDN_APP=jagasuara.yourdomain.com"
fi

echo "🚀 Starting JagaSuara deployment for domain: $DOMAIN"

# Check if coolify network exists
if ! docker network ls | grep -q coolify; then
    echo "📡 Creating coolify network..."
    docker network create --attachable coolify
else
    echo "✅ Coolify network already exists"
fi

# Build and deploy the application
echo "🔨 Building and deploying JagaSuara..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

# Wait for application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if application is running
if docker compose ps --format json | grep -q '"State":"running"'; then
    echo "✅ JagaSuara is running successfully!"
    
    # Test health endpoint
    echo "🔍 Testing health endpoint..."
    HEALTH_URL="https://$DOMAIN/api/health"
    if [ "$DOMAIN" = "localhost:3000" ]; then
        HEALTH_URL="http://localhost:3000/api/health"
    fi
    
    if curl -s "$HEALTH_URL" | grep -q '"status":"ok"'; then
        echo "✅ Health check passed!"
    else
        echo "⚠️  Health check failed, but application is running"
    fi
    
    echo ""
    echo "🎉 Deployment successful!"
    echo "📱 Access your application at: https://$DOMAIN"
    echo "⚙️  Admin panel at: https://$DOMAIN/admin"
    echo "🔍 Health check at: $HEALTH_URL"
    
else
    echo "❌ Deployment failed!"
    echo "📋 Container status:"
    docker compose ps
    echo ""
    echo "📜 Application logs:"
    docker compose logs --tail=20
    exit 1
fi

echo ""
echo "📊 Container status:"
docker compose ps
