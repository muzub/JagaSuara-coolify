#!/bin/bash

# JagaSuara-coolify GitHub Repository Setup Script
# This script helps you set up the GitHub repository with all necessary files

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 JagaSuara-coolify Repository Setup${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -f "coolify.yaml" ]]; then
    echo -e "${RED}❌ Error: This script must be run in the JagaSuara-coolify directory${NC}"
    echo -e "${RED}   Make sure you're in the root of the repository${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Repository structure validated${NC}"

# Check if Git is initialized
if [[ ! -d ".git" ]]; then
    echo -e "${YELLOW}⚠️  Git repository not initialized${NC}"
    echo -e "${BLUE}Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✅ Git repository initialized${NC}"
fi

# Check for GitHub remote
if ! git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠️  No GitHub remote configured${NC}"
    echo -e "${BLUE}Please add your GitHub repository as origin:${NC}"
    echo -e "${YELLOW}   git remote add origin https://github.com/yourusername/JagaSuara-coolify.git${NC}"
    echo ""
else
    origin_url=$(git remote get-url origin)
    echo -e "${GREEN}✅ GitHub remote configured: ${origin_url}${NC}"
fi

# Create .gitignore if it doesn't exist
if [[ ! -f ".gitignore" ]]; then
    echo -e "${YELLOW}⚠️  .gitignore file missing${NC}"
    echo -e "${BLUE}Creating .gitignore...${NC}"
    cat > .gitignore << 'EOF'
# Dependencies
/node_modules
/.pnp
.pnp.js

# Production
/build
/.next/
/out/

# Environment files
.env*.local
.env

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Docker
.dockerignore

# Coolify
.coolify
EOF
    echo -e "${GREEN}✅ .gitignore created${NC}"
fi

# Check required files
echo ""
echo -e "${BLUE}Checking required files...${NC}"

required_files=(
    "README.md"
    "package.json"
    "Dockerfile"
    "coolify.yaml"
    "docker-compose.yml"
    ".env.example"
    "coolify.json"
    "deploy.sh"
    "validate-deployment.sh"
    "COOLIFY_README.md"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (missing)${NC}"
        missing_files+=("$file")
    fi
done

if [[ ${#missing_files[@]} -gt 0 ]]; then
    echo ""
    echo -e "${RED}❌ Missing required files: ${missing_files[*]}${NC}"
    echo -e "${RED}   Please ensure all files are present before pushing to GitHub${NC}"
    exit 1
fi

# Check package.json scripts
echo ""
echo -e "${BLUE}Checking package.json scripts...${NC}"

required_scripts=("dev" "build" "start" "lint")
for script in "${required_scripts[@]}"; do
    if jq -e ".scripts.\"$script\"" package.json > /dev/null 2>&1; then
        echo -e "${GREEN}✅ npm run $script${NC}"
    else
        echo -e "${YELLOW}⚠️  npm run $script (missing)${NC}"
    fi
done

# Test build process
echo ""
echo -e "${BLUE}Testing build process...${NC}"

if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo -e "${RED}   Please fix build errors before pushing to GitHub${NC}"
    exit 1
fi

# Validate Coolify configuration
echo ""
echo -e "${BLUE}Validating Coolify configuration...${NC}"

if grep -q "SERVICE_FQDN_APP" coolify.yaml && grep -q "SERVICE_FQDN_APP" docker-compose.yml; then
    echo -e "${GREEN}✅ Domain configuration is flexible${NC}"
else
    echo -e "${RED}❌ Domain configuration has hardcoded values${NC}"
    exit 1
fi

# Check Docker build
echo ""
echo -e "${BLUE}Testing Docker build...${NC}"

if docker build -t jagasuara-test . > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker build successful${NC}"
    docker rmi jagasuara-test > /dev/null 2>&1 || true
else
    echo -e "${RED}❌ Docker build failed${NC}"
    echo -e "${RED}   Please fix Docker configuration before pushing${NC}"
    exit 1
fi

# Final summary
echo ""
echo -e "${BLUE}🎯 Repository Setup Summary${NC}"
echo -e "${BLUE}===========================${NC}"
echo -e "${GREEN}✅ All required files present${NC}"
echo -e "${GREEN}✅ Build process working${NC}"
echo -e "${GREEN}✅ Docker build successful${NC}"
echo -e "${GREEN}✅ Coolify configuration validated${NC}"

echo ""
echo -e "${GREEN}🎉 Repository is ready for GitHub!${NC}"
echo ""

echo -e "${BLUE}Next steps:${NC}"
echo -e "1. ${YELLOW}git add .${NC}"
echo -e "2. ${YELLOW}git commit -m \"Initial commit: JagaSuara Coolify edition\"${NC}"
echo -e "3. ${YELLOW}git branch -M main${NC}"
echo -e "4. ${YELLOW}git remote add origin https://github.com/yourusername/JagaSuara-coolify.git${NC}"
echo -e "5. ${YELLOW}git push -u origin main${NC}"

echo ""
echo -e "${BLUE}After pushing to GitHub:${NC}"
echo -e "- Repository will be ready for Coolify deployment"
echo -e "- GitHub Actions will run automated tests"
echo -e "- Users can deploy to any domain they own"

echo ""
echo -e "${GREEN}Repository setup complete! 🚀${NC}"
