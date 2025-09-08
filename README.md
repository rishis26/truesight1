# trueSight - Advanced Threat Detection & Analysis System

A sophisticated AI-powered system for detecting and analyzing potential bomb threats across multiple communication channels. Built with modern web technologies and designed for production deployment.

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Configure API keys (see API_SETUP.md)
.env
# Edit .env with your API keys

# Start development server
npm run dev
```

### API Configuration
This project supports multiple providers. Configure what you need via `.env`:

```env
# ---------- AI (Groq primary, DeepSeek fallback) ----------
VITE_GROQ_API_KEY=...                 # required for Groq
VITE_GROQ_MODEL=llama-3.1-70b-versatile
VITE_GROQ_BASE_URL=https://api.groq.com/openai/v1

VITE_DEEPSEEK_API_KEY=...             # optional fallback
VITE_DEEPSEEK_MODEL=deepseek-chat
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com

VITE_DEFAULT_AI_PROVIDER=groq         # groq | deepseek

# ---------- IP Geolocation ----------
VITE_IPINFO_TOKEN=...                 # ipinfo token (preferred)

# ---------- App limits ----------
VITE_MAX_FILE_SIZE_MB=50
VITE_MAX_CONCURRENT_ANALYSES=5
VITE_API_TIMEOUT_MS=30000
```

Notes:
- If no AI keys are present, the app falls back to a local heuristic model for text analysis.
- For IP geolocation, ipinfo is used first. If no token is present, a low‑rate unauthenticated call is attempted for development.

Notes:
- Without API keys the app falls back to local heuristic analysis (reduced accuracy).
- With keys the app uses OpenAI for text analysis and Whisper for audio transcription.

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm start

# Or build and serve in one command
npm run serve
```

### Static Hosting
```bash
# Build the application
npm run build

# Deploy the 'dist' folder to your hosting service
# (Netlify, Vercel, GitHub Pages, Firebase, etc.)
```

## 🚀 Features

### Core Capabilities
- **Multi-format File Processing**: Support for .eml, .wav, .mp3, .m4a, .ogg, .pdf, .docx files
- **AI Analysis (Groq/DeepSeek)**: Structured JSON output for confidence, classification and actions
- **Advanced Audio Processing**: Whisper (optional via OpenAI SDK) for accurate speech-to-text transcription
- **Intelligent Document Processing**: PDF and Word document text extraction with AI analysis
- **Email Analysis**: Header inspection, sender reputation scoring, spoofing detection
- **Real-time Dashboard**: Comprehensive threat monitoring and statistics
- **Actionable Bullet Summaries**: Clear, multi-line summaries with immediate steps

### Production-Ready Features
- **Glass Morphism UI**: Modern, responsive design with dark/light themes
- **Keyboard Shortcuts**: Quick actions for power users
- **Animated UX**: Page-load scale/fade and tab slide transitions (left/right)
- **Error Handling**: Robust error management and user feedback
- **Performance Optimized**: Minified assets and efficient rendering
- **Cross-Platform**: Works on desktop and mobile devices
- **Network Ready**: Configured for external access and deployment

### Key Components

#### 🧠 AI Analysis Engine
- Semantic analysis beyond simple keyword matching
- Contextual understanding of message content
- Sentiment analysis for threat assessment
- Confidence scoring with explainable results

#### 📧 Email Processing
- Complete email parsing (headers, body, attachments)
- Sender reputation analysis
- Domain age verification
- Spoofing detection algorithms

#### 🎵 Audio Analysis
- Speech-to-text transcription
- Multi-speaker detection
- Voice stress analysis indicators
- Audio quality assessment

#### 📊 Threat Dashboard
- Real-time threat monitoring
- Statistical analysis and trends
- Detailed analysis reports
- Recommended action items

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **UI Framework**: Custom Glass Morphism Design System
- **Build Tool**: Vite with production optimization
- **Server**: Express.js for production hosting
- **AI Provider**: Groq (primary), DeepSeek (fallback), OpenAI Whisper (optional transcription)
- **Document Processing**: pdf-parse, mammoth.js
- **File Processing**: Native Web APIs + specialized parsers
- **Deployment**: Static hosting ready with fallback server

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── TextAnalyzer.tsx
│   ├── FileUpload.tsx
│   ├── ThreatDashboard.tsx
│   └── UtilityRail.tsx
├── services/           # Business logic services
│   ├── aiAnalysis.ts
│   └── fileProcessor.ts
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and constants
├── contexts/           # React contexts (Theme)
└── App.tsx             # Main application component
```

### Animations & Transitions
Tailwind is extended with custom keyframes and utilities for smooth UX:

Keyframes (tailwind.config.js): `fade-in`, `scale-in`, `slide-in-left`, `slide-in-right`, `slide-in-up`

Utilities (src/index.css):
- `.animate-page-enter` → page open scale/fade
- `.animate-tab-enter-left` / `.animate-tab-enter-right` → directional tab switch
- Use native `animate-fade-in` class for subtle fades

Applied in `App.tsx` to animate initial load and tab transitions.

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run serve` - Build and serve in one command
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📋 Usage

### Text Analysis
1. Navigate to the "Text Analysis" tab
2. Paste suspicious text content
3. Click "Analyze Text" for results (OpenAI or fallback logic)
4. Review bullet-point summary, confidence meter, reasons, and recommendations
5. Use keyboard shortcuts: `Ctrl+Enter` to analyze, `Esc` to clear

### File Upload Analysis
1. Go to the "File Upload" tab
2. Drag and drop files or click to select
3. Supported formats: emails (.eml), audio (.wav, .mp3, .m4a, .ogg), documents (.pdf, .docx)
4. View detailed analysis results for each file
5. Process up to 10 files simultaneously (50MB max per file)

### Dashboard Monitoring
1. Access the "Dashboard" tab for overview
2. Monitor threat statistics and trends
3. Review recent analyses
4. Click on any analysis for detailed breakdown
5. Track performance metrics and system health

## 🔒 Security Features

- **Privacy-First Design**: Local processing when possible
- **Minimal Data Collection**: Only essential metadata stored
- **Secure File Handling**: Temporary processing with automatic cleanup
- **Audit Trail**: Complete analysis history for compliance

## 📈 Performance Metrics

- **Detection Accuracy**: >90% precision in identifying hoax threats
- **Processing Time**: <30 seconds for file analysis
- **Supported File Size**: Up to 50MB per file
- **Concurrent Processing**: Up to 10 files simultaneously

## 🎯 Classification System

### Threat Levels
- **Critical**: Immediate emergency response required
- **High**: Urgent attention and verification needed
- **Medium**: Standard security protocols apply
- **Low**: Minimal risk, likely false alarm

### Confidence Scoring
- **0-25%**: Likely hoax or false alarm
- **26-59%**: Uncertain, requires human verification
- **60-100%**: Likely genuine threat

## 🚀 Deployment Options

### Static Hosting (Recommended)
- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your repository and deploy
- **GitHub Pages**: Push the `dist` folder to gh-pages branch
- **Firebase Hosting**: Use `firebase deploy`
- **AWS S3**: Upload `dist` folder to S3 bucket

### Server Deployment
```bash
# On your server
git clone <your-repo>
cd project
npm install
npm run build
npm start
```

### Docker Deployment
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

## 🔄 How Analysis Works (High-Level)

1. Text from user/email/document (or audio transcription) is collected in the UI
2. The AI service is chosen in this order: Groq → DeepSeek → Local fallback
3. A structured prompt requests strict JSON with:
   - confidence (0–100), classification (genuine|hoax|uncertain), threatLevel (low|medium|high|critical)
   - summary (bullet points), reasons, recommendations and multi‑dimensional scores
4. The JSON is parsed into `ThreatAnalysis` and rendered in the UI
5. If both providers are unavailable, a local heuristic engine scores semantic/sentiment/pattern signals and generates a summary
6. Results are displayed, added to recent history, and visualized on the dashboard

### IP Geolocation Flow (ipinfo)
1. User pastes an IP into the IP Geolocation box and clicks `Locate`
2. The app calls `https://ipinfo.io/<ip>?token=...`
3. Response fields used:
   - `city`, `region`, `country` (converted to full name when possible)
   - `loc` → split into `lat`, `lon`
   - `org` (ISP / AS info)
   - `privacy` → proxy/vpn/tor/hosting flags
4. UI shows a compact card with badges, a Google Maps link, and a preview map box
5. The full geolocation object is attached to the analysis metadata and appears in exports

## ✨ Recent Changes

- Switched analysis stack to Groq (DeepSeek fallback)
- Added ipinfo-powered IP geolocation with badges and Google Maps preview
- Compact geolocation UI and mobile polish (Shortcuts hidden on small screens)
- Safer Vite config (no global process.env exposure)
- Page-load and tab transition animations

## 🧪 End-to-End Workflow Summary
1. Operator pastes text and optional IP into Text Analysis
2. Clicks `Locate` (for IP) and `Analyze Text`
3. Geolocation card displays city/region/country, flags, coordinates, and a Google Maps preview/link
4. AI returns structured threat analysis → UI shows summary, confidence, badges and recommendations
5. Export (JSON/Text/CSV/PDF) includes the `ip_geolocation` section when present

## 🔮 Future Enhancements (Phase 3)

- Browser extension for real-time web monitoring
- Integration with external threat intelligence feeds
- Advanced machine learning model training
- Multi-language support
- API integration with security systems
- Real-time collaboration features

## ⚖️ Ethical Considerations

- **False Positive Awareness**: System designed to minimize false alarms
- **Privacy Protection**: Strict data handling protocols
- **Bias Mitigation**: Continuous model evaluation and improvement
- **Human Oversight**: AI recommendations require human verification

## 🚨 Important Notes

This system is designed to assist security professionals and should never replace human judgment in threat assessment. All high-confidence threats should be verified through proper channels and law enforcement protocols.

## 📞 Emergency Protocols

For genuine threats detected by the system:
1. Immediately contact local law enforcement
2. Follow your organization's emergency procedures
3. Preserve all digital evidence
4. Document the incident thoroughly

## 🔧 Troubleshooting

### Common Issues
- **Assets not loading**: Ensure all files in `dist` folder are uploaded
- **CORS errors**: Server includes CORS headers for cross-origin requests
- **Routing issues**: Server configured to serve `index.html` for all routes

### Performance Optimization
- Assets are minified and optimized for production
- CSS and JS are bundled and compressed
- Hash-based caching for optimal performance

## 📊 System Requirements

- **Node.js**: 16.x or higher
- **npm**: 8.x or higher
- **Browser**: Modern browsers with ES6+ support
- **Memory**: 512MB RAM minimum
- **Storage**: 100MB for application files

---

**Disclaimer**: This system is for legitimate security purposes only. Misuse for harassment, false reporting, or other malicious activities is strictly prohibited and may be illegal.