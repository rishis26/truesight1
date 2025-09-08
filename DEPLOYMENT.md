# trueSight Deployment Guide

## 🚀 Quick Start

### Option 1: Local Production Server
```bash
# Build and serve locally
npm run serve

# Or build first, then start server
npm run build
npm start
```

### Option 2: Static Hosting (Recommended)
```bash
# Build the application
npm run build

# Deploy the 'dist' folder to your hosting service
```

## 🌐 Deployment Options

### 1. Static Hosting Services
- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your repository and deploy
- **GitHub Pages**: Push the `dist` folder to gh-pages branch
- **Firebase Hosting**: Use `firebase deploy`
- **AWS S3**: Upload `dist` folder to S3 bucket

### 2. VPS/Server Deployment
```bash
# On your server
git clone <your-repo>
cd project
npm install
npm run build
npm start
```

### 3. Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📁 File Structure After Build
```
dist/
├── index.html          # Main HTML file
├── assets/
│   ├── index-[hash].js # Main JavaScript bundle
│   └── index-[hash].css # Main CSS bundle
└── logo/
    ├── logo.png
    └── name_logo.png
```

## ⚙️ Environment Configuration

### Production Environment Variables
```bash
PORT=3000              # Server port (optional, defaults to 3000)
NODE_ENV=production    # Environment (set automatically)
```

### Build Configuration
- **Base Path**: `./` (relative paths for flexible deployment)
- **Asset Optimization**: Enabled with hash-based caching
- **CORS**: Enabled for cross-origin requests
- **Static Serving**: Express server handles all routes

## 🔧 Troubleshooting

### Common Issues

1. **Assets not loading**
   - Check if base path is correct for your hosting service
   - Ensure all files in `dist` folder are uploaded

2. **CORS errors**
   - Server includes CORS headers
   - For static hosting, this shouldn't be an issue

3. **Routing issues**
   - Server configured to serve `index.html` for all routes
   - Static hosting may need redirect configuration

### Performance Optimization
- Assets are minified and optimized
- CSS and JS are bundled and compressed
- Images are optimized for web delivery

## 📊 Monitoring

### Health Check Endpoint
```bash
curl http://your-domain/health
```

### Logs
- Server logs include startup information
- Application errors logged to console
- Production-ready error handling

## 🔒 Security Features
- CORS properly configured
- No sensitive data in client-side code
- Static file serving with proper headers
- Graceful error handling

## 🚀 Ready to Deploy!

Your application is now production-ready. Choose your preferred deployment method and enjoy your trueSight Threat Detection System!
