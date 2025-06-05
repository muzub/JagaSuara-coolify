# Contributing to JagaSuara

Thank you for your interest in contributing to JagaSuara! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `main`
4. **Make your changes** with tests
5. **Test with Coolify** deployment
6. **Submit a pull request**

## 🏗️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Local Development
```bash
# Clone your fork
git clone https://github.com/yourusername/JagaSuara-coolify.git
cd JagaSuara-coolify

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your settings

# Start development server
npm run dev
```

### Testing with Docker
```bash
# Build and test locally
docker build -t jagasuara-test .
docker run -p 3000:3000 jagasuara-test

# Test with docker-compose
export SERVICE_FQDN_APP=localhost
docker-compose up
```

## 📋 Development Guidelines

### Code Style
- **TypeScript** for all new code
- **ESLint** configuration provided
- **Prettier** for formatting
- **Consistent naming** conventions

### Component Structure
```
src/
├── app/                 # Next.js app router pages
├── components/         # Reusable React components
│   ├── ui/            # shadcn/ui base components
│   └── features/      # Feature-specific components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
└── types/             # TypeScript type definitions
```

### Commit Messages
Use conventional commits format:
```
feat: add new audio monitoring feature
fix: resolve SSL certificate issue
docs: update deployment guide
style: format code with prettier
refactor: optimize Docker build process
test: add unit tests for audio analysis
```

## 🧪 Testing

### Manual Testing
```bash
# Run development server
npm run dev

# Test build process
npm run build
npm start

# Validate deployment
chmod +x validate-deployment.sh
./validate-deployment.sh
```

### Docker Testing
```bash
# Test Docker build
docker build -t jagasuara-test .

# Test with different domains
export SERVICE_FQDN_APP=test.localhost
docker-compose up
```

### Coolify Testing
1. Deploy to a test Coolify instance
2. Verify with different domain configurations
3. Test environment variable flexibility
4. Validate SSL certificate generation

## 🎯 Types of Contributions

### 🐛 Bug Fixes
- **Security issues** - Report privately first
- **Build failures** - Include environment details
- **UI/UX issues** - Provide screenshots
- **Performance problems** - Include profiling data

### ✨ New Features
- **Audio analysis** improvements
- **AI integration** enhancements
- **UI/UX** additions
- **Deployment** optimizations

### 📚 Documentation
- **Setup guides** for different platforms
- **API documentation** for endpoints
- **Troubleshooting** guides
- **Examples** and tutorials

### 🔧 Infrastructure
- **Docker** optimizations
- **Coolify** configuration improvements
- **CI/CD** pipeline enhancements
- **Performance** optimizations

## 📝 Pull Request Process

### Before Submitting
1. **Test locally** with `npm run dev`
2. **Build successfully** with `npm run build`
3. **Test Docker build** with provided Dockerfile
4. **Validate Coolify deployment** if possible
5. **Update documentation** if needed

### PR Requirements
- **Descriptive title** and description
- **Link to issue** if applicable
- **Screenshots** for UI changes
- **Testing notes** and validation steps
- **Breaking changes** clearly marked

### Review Process
1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on staging environment
4. **Documentation** review if applicable
5. **Final approval** and merge

## 🔒 Security

### Reporting Security Issues
- **Do not** create public issues for security vulnerabilities
- **Email** security issues to project maintainers
- **Include** detailed reproduction steps
- **Allow** reasonable time for response

### Security Guidelines
- **No hardcoded** secrets or API keys
- **Environment variables** for all configuration
- **Secure defaults** for all settings
- **Regular dependency** updates

## 📞 Getting Help

### Communication Channels
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general discussion
- **Pull Requests** - Code review and collaboration

### Issue Templates
Use provided issue templates for:
- **Bug reports** - Include reproduction steps
- **Feature requests** - Describe use case and value
- **Questions** - Provide context and what you've tried

## 🎉 Recognition

Contributors will be:
- **Listed** in project README
- **Credited** in release notes
- **Invited** to project discussions
- **Recognized** for significant contributions

## 📄 License

By contributing to JagaSuara, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to JagaSuara! 🎵✨
