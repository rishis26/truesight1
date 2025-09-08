# trueSight API Integration Guide

This guide will help you set up real AI APIs for the trueSight threat detection system.

## 🚀 Quick Setup

### 1. Create Environment File

Create a `.env` file in your project root:

```bash
# Copy the example file
cp env.example .env
```

### 2. Get API Keys

#### OpenAI (Recommended)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and add billing information
3. Generate an API key from the API Keys section
4. Add to your `.env` file:
```env
VITE_OPENAI_API_KEY=sk-your-key-here
VITE_OPENAI_MODEL=gpt-4o-mini
VITE_DEFAULT_AI_PROVIDER=openai
```

#### Anthropic Claude (Alternative)
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account and add billing
3. Generate an API key
4. Add to your `.env` file:
```env
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
VITE_ANTHROPIC_MODEL=claude-3-haiku-20240307
VITE_DEFAULT_AI_PROVIDER=anthropic
```

#### Google AI (Alternative)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to your `.env` file:
```env
VITE_GOOGLE_AI_API_KEY=AI-your-key-here
VITE_GOOGLE_AI_MODEL=gemini-pro
VITE_DEFAULT_AI_PROVIDER=google
```

### 3. Restart Development Server

```bash
npm run dev
```

## 🔧 Configuration Options

### Complete .env Example

```env
# AI Provider Configuration
VITE_OPENAI_API_KEY=sk-your-openai-key-here
VITE_OPENAI_MODEL=gpt-4o-mini

VITE_ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
VITE_ANTHROPIC_MODEL=claude-3-haiku-20240307

VITE_GOOGLE_AI_API_KEY=AI-your-google-key-here
VITE_GOOGLE_AI_MODEL=gemini-pro

# Default Provider (choose one)
VITE_DEFAULT_AI_PROVIDER=openai

# Audio Processing (uses OpenAI Whisper)
VITE_WHISPER_API_KEY=sk-your-openai-key-here
VITE_USE_OPENAI_WHISPER=true

# Configuration
VITE_MAX_FILE_SIZE_MB=50
VITE_MAX_CONCURRENT_ANALYSES=5
VITE_API_TIMEOUT_MS=30000

# Environment
NODE_ENV=development
```

## 🎯 Features Enabled with APIs

### With OpenAI API:
- ✅ **Text Analysis**: GPT-4 powered threat detection
- ✅ **Audio Transcription**: Whisper API for speech-to-text
- ✅ **Document Processing**: PDF and Word document analysis
- ✅ **Email Analysis**: Enhanced email threat detection

### With Anthropic API:
- ✅ **Text Analysis**: Claude-powered threat detection
- ✅ **Document Processing**: PDF and Word document analysis
- ✅ **Email Analysis**: Enhanced email threat detection

### With Google AI API:
- ✅ **Text Analysis**: Gemini-powered threat detection
- ✅ **Document Processing**: PDF and Word document analysis
- ✅ **Email Analysis**: Enhanced email threat detection

## 💰 Cost Considerations

### OpenAI Pricing (as of 2024):
- **GPT-4o-mini**: $0.00015/1K input tokens, $0.0006/1K output tokens
- **Whisper**: $0.006/minute of audio
- **Typical cost**: $0.01-0.05 per analysis

### Anthropic Pricing:
- **Claude 3 Haiku**: $0.25/1M input tokens, $1.25/1M output tokens
- **Typical cost**: $0.01-0.03 per analysis

### Google AI Pricing:
- **Gemini Pro**: Free tier available, then $0.0005/1K characters
- **Typical cost**: $0.005-0.02 per analysis

## 🔒 Security Best Practices

### 1. Never Commit API Keys
```bash
# Add to .gitignore
echo ".env" >> .gitignore
```

### 2. Use Environment Variables
- Never hardcode API keys in source code
- Use `VITE_` prefix for client-side variables
- Consider using a backend proxy for production

### 3. Production Deployment
For production, consider:
- Backend API proxy to hide keys
- Rate limiting
- Usage monitoring
- Key rotation

## 🚨 Troubleshooting

### Common Issues:

#### 1. "API key not configured" Error
- Check your `.env` file exists
- Verify the API key format
- Restart the development server

#### 2. "Invalid API key" Error
- Verify the key is correct
- Check if the key has proper permissions
- Ensure billing is set up (for paid APIs)

#### 3. "Rate limit exceeded" Error
- Wait a few minutes before retrying
- Consider upgrading your API plan
- Implement request queuing

#### 4. "Network error" Error
- Check your internet connection
- Verify API endpoints are accessible
- Check for firewall restrictions

### Debug Mode:
Add to your `.env` file for detailed logging:
```env
VITE_DEBUG_MODE=true
```

## 📊 API Usage Monitoring

### OpenAI Usage Dashboard:
- Visit [OpenAI Usage Dashboard](https://platform.openai.com/usage)
- Monitor token usage and costs
- Set up usage alerts

### Anthropic Usage:
- Check [Anthropic Console](https://console.anthropic.com/)
- Monitor API usage and billing

### Google AI Usage:
- Check [Google Cloud Console](https://console.cloud.google.com/)
- Monitor API quotas and usage

## 🔄 Fallback Behavior

The system includes intelligent fallback:
1. **Primary**: Real AI API analysis
2. **Fallback**: Local pattern-based analysis
3. **Error Handling**: Graceful degradation with user feedback

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your API keys and billing
3. Check the browser console for detailed error messages
4. Ensure you're using the latest version of the application

## 🎉 Ready to Use!

Once configured, your trueSight system will:
- Analyze text with real AI models
- Transcribe audio files accurately
- Process documents intelligently
- Provide detailed threat assessments
- Offer actionable recommendations

Enjoy your enhanced threat detection capabilities! 🛡️
