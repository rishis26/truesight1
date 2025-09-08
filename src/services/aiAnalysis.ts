import { ThreatAnalysis, EmailAnalysis, AudioAnalysis } from '../types/threat';
import { CONFIDENCE_THRESHOLDS } from '../utils/constants';

// AI Provider Configuration
interface AIProviderConfig {
  deepseek?: {
    apiKey: string;
    model: string;
    baseURL: string;
  };
  groq?: {
    apiKey: string;
    model: string;
    baseURL: string;
  };
}

class AIAnalysisService {
  private config: AIProviderConfig = {};
  private defaultProvider: string = 'groq';

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    // Groq configuration (primary)
    if (import.meta.env.VITE_GROQ_API_KEY) {
      this.config.groq = {
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        model: import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-70b-versatile',
        baseURL: import.meta.env.VITE_GROQ_BASE_URL || 'https://api.groq.com/openai/v1'
      };
    }

    // DeepSeek configuration (fallback)
    if (import.meta.env.VITE_DEEPSEEK_API_KEY) {
      this.config.deepseek = {
        apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
        model: import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat',
        baseURL: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
      };
    }


    this.defaultProvider = import.meta.env.VITE_DEFAULT_AI_PROVIDER || 'groq';
  }

  private generateId(): string {
    // Fallback for environments where crypto.randomUUID() is not available
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Simple fallback ID generation
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Fallback patterns for local analysis when API is unavailable
  private readonly hoaxPatterns = [
    'this is just a test',
    'this is a drill',
    'just kidding',
    'ha ha',
    'prank',
    'joke'
  ];

  private readonly genuineIndicators = [
    'specific location details',
    'credible threat intelligence',
    'verified source',
    'law enforcement contact',
    'official channels'
  ];

  async analyzeText(content: string, metadata?: any): Promise<ThreatAnalysis> {
    const startTime = Date.now();
    
    // Check if we have valid API keys before attempting API calls
    const hasValidGroq = this.config.groq?.apiKey && !this.config.groq.apiKey.includes('your_');
    const hasValidDeepSeek = this.config.deepseek?.apiKey && !this.config.deepseek.apiKey.includes('your_');
    const hasValidOpenAI = this.config.openai?.apiKey && !this.config.openai.apiKey.includes('your_');
    
    if (!hasValidGroq && !hasValidDeepSeek && !hasValidOpenAI) {
      console.log('No valid API keys configured, using local analysis');
      return this.fallbackAnalysis(content, startTime, metadata);
    }
    
    try {
      // Use AI API for analysis
      const aiResponse = await this.callAIProvider(content, metadata);
      
      // Parse AI response and create analysis
      const analysis = this.parseAIResponse(aiResponse, content, startTime, metadata);
      
      return analysis;
    } catch (error) {
      console.error('AI Analysis error:', error);
      
      // Fallback to local analysis if API fails
      console.warn('Falling back to local analysis due to API error');
      return this.fallbackAnalysis(content, startTime, metadata);
    }
  }

  private async callAIProvider(content: string, metadata?: any): Promise<any> {
    // Try Groq first, then DeepSeek
    if (this.config.groq?.apiKey && !this.config.groq.apiKey.includes('your_')) {
      try {
        return await this.callGroq(content, metadata);
      } catch (error) {
        console.warn('Groq API failed, falling back to DeepSeek:', error);
        
        // Try DeepSeek as fallback
        if (this.config.deepseek?.apiKey && !this.config.deepseek.apiKey.includes('your_')) {
          return await this.callDeepSeek(content, metadata);
        }
        throw error;
      }
    } else if (this.config.deepseek?.apiKey && !this.config.deepseek.apiKey.includes('your_')) {
      return await this.callDeepSeek(content, metadata);
    } else {
      throw new Error('No valid AI provider configured');
    }
  }

  private async callGroq(content: string, metadata?: any): Promise<any> {
    if (!this.config.groq?.apiKey) {
      throw new Error('Groq API key not configured');
    }

    const prompt = this.buildThreatAnalysisPrompt(content, metadata);
    
    console.log('Calling Groq API with model:', this.config.groq.model);
    console.log('Groq base URL:', this.config.groq.baseURL);
    
    try {
      const response = await fetch(`${this.config.groq.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.groq.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.groq.model,
          messages: [
            {
              role: 'system',
              content: 'You are a security expert specializing in threat detection and analysis. Analyze the provided content for potential bomb threats or security risks.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error response:', errorText);
        throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Groq API response received');
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq API fetch error:', error);
      throw error;
    }
  }

  private async callDeepSeek(content: string, metadata?: any): Promise<any> {
    if (!this.config.deepseek?.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const prompt = this.buildThreatAnalysisPrompt(content, metadata);
    
    const response = await fetch(`${this.config.deepseek.baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.deepseek.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.deepseek.model,
        messages: [
          {
            role: 'system',
            content: 'You are a security expert specializing in threat detection and analysis. Analyze the provided content for potential bomb threats or security risks.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }




  private buildThreatAnalysisPrompt(content: string, metadata?: any): string {
    return `
Analyze the following content for potential bomb threats or security risks. Provide your analysis in the following JSON format:

{
  "confidence": <number 0-100>,
  "classification": "<genuine|hoax|uncertain>",
  "threatLevel": "<low|medium|high|critical>",
  "summary": "<detailed bullet-point summary with key actions and findings>",
  "reasons": ["<reason1>", "<reason2>", ...],
  "recommendations": ["<recommendation1>", "<recommendation2>", ...],
  "dimensions": {
    "linguistic_analysis": <number 0-100>,
    "communication_metadata": <number 0-100>,
    "content_inconsistencies": <number 0-100>,
    "historical_patterns": <number 0-100>,
    "behavioral_indicators": <number 0-100>,
    "technical_verification": <number 0-100>,
    "contextual_analysis": <number 0-100>,
    "forensic_linguistics": <number 0-100>
  }
}

Content to analyze:
${content}

Additional context:
- Source: ${metadata?.source || 'text'}
- File type: ${metadata?.fileType || 'N/A'}

Guidelines:
- Confidence: 0-30% (likely hoax), 31-69% (uncertain), 70-100% (likely genuine)
- Classification: "genuine" for credible threats, "hoax" for likely false alarms, "uncertain" for unclear cases
- Threat Level: "critical" for immediate danger, "high" for urgent attention, "medium" for verification needed, "low" for minimal risk
- Summary: Provide a detailed bullet-point summary with key findings, specific threats identified, and immediate actions required
- Provide specific, actionable reasons and recommendations
- Consider context, specificity, urgency indicators, and credibility factors

Dimensions guidance:
- linguistic_analysis: word choice, syntax, modality, directness
- communication_metadata: sender, routing, channel, timing
- content_inconsistencies: contradictions, vagueness, implausibility
- historical_patterns: similarity to known hoax/genuine templates
- behavioral_indicators: demands, threats, coercion, escalation
- technical_verification: headers, file metadata, spoofing checks
- contextual_analysis: place/time specificity, operational feasibility
- forensic_linguistics: authorial markers, regionalisms, idiosyncrasies

Respond with valid JSON only.`;
  }

  private parseAIResponse(aiResponse: string, content: string, startTime: number, metadata?: any): ThreatAnalysis {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(aiResponse);
      
      const dimensions = parsed.dimensions && typeof parsed.dimensions === 'object' ? parsed.dimensions : undefined;

      return {
        id: this.generateId(),
        confidence: Math.max(0, Math.min(100, parsed.confidence || 0)),
        classification: parsed.classification || 'uncertain',
        threatLevel: parsed.threatLevel || 'low',
        summary: parsed.summary || this.generateFallbackSummary(parsed.classification, parsed.threatLevel, parsed.confidence),
        reasons: Array.isArray(parsed.reasons) ? parsed.reasons : ['AI analysis completed'],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ['Review analysis results'],
        dimensions,
        metadata: {
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          source: metadata?.source || 'text',
          fileType: metadata?.fileType
        }
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Invalid AI response format');
    }
  }

    private fallbackAnalysis(content: string, startTime: number, metadata?: any): ThreatAnalysis {
    // Fallback to local analysis if AI API fails
    const semanticScore = this.performSemanticAnalysis(content);
    const sentimentScore = this.analyzeSentiment(content);
    const patternScore = this.analyzePatterns(content);
    
    const confidence = this.calculateConfidence(semanticScore, sentimentScore, patternScore);
    const classification = this.classifyThreat(confidence);
    const threatLevel = this.determineThreatLevel(confidence, classification);
    
    const dimensions = this.deriveFallbackDimensions(content, semanticScore, sentimentScore, patternScore);

    return {
      id: this.generateId(),
      confidence,
      classification,
      threatLevel,
      summary: this.generateFallbackSummary(classification, threatLevel, confidence),
      reasons: this.generateReasons(content, semanticScore, sentimentScore, patternScore),
      recommendations: this.generateRecommendations(classification, confidence),
      dimensions,
      metadata: {
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        source: metadata?.source || 'text',
        fileType: metadata?.fileType
      }
    };
  }

  private deriveFallbackDimensions(content: string, semantic: number, sentiment: number, pattern: number) {
    const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
    return {
      linguistic_analysis: clamp(semantic),
      communication_metadata: clamp(content.includes('@') || /from:|return-path:/i.test(content) ? semantic * 0.6 + 20 : 30),
      content_inconsistencies: clamp(100 - Math.min(100, pattern + sentiment * 0.5)),
      historical_patterns: clamp(semantic * 0.7 + (content.toLowerCase().includes('this is a drill') ? 20 : 0)),
      behavioral_indicators: clamp(sentiment),
      technical_verification: clamp(/received:|dkim|spf/i.test(content) ? 60 : 35),
      contextual_analysis: clamp(pattern),
      forensic_linguistics: clamp(semantic * 0.5 + (/(won't|gonna|ain't)/i.test(content) ? 20 : 0))
    };
  }

  private generateFallbackSummary(classification: string, threatLevel: string, confidence: number): string {
    if (classification === 'genuine') {
      switch (threatLevel) {
        case 'critical':
          return `• CRITICAL THREAT DETECTED - Immediate emergency response required
• Contact law enforcement and emergency services immediately
• Evacuate all personnel from the affected area
• Activate emergency protocols and alert all security teams
• Preserve all evidence and maintain security perimeter`;
        case 'high':
          return `• HIGH THREAT DETECTED - Urgent attention required
• Verify threat through secondary analysis
• Prepare emergency response protocols
• Alert security personnel and management
• Monitor situation closely for escalation`;
        case 'medium':
          return `• MEDIUM THREAT DETECTED - Requires verification
• Conduct thorough threat assessment
• Implement standard security protocols
• Notify appropriate security personnel
• Document incident for further analysis`;
        default:
          return `• LOW THREAT DETECTED - Monitor situation
• Follow standard security procedures
• Document incident for records
• Continue normal operations with increased awareness`;
      }
    } else if (classification === 'hoax') {
      return `• HOAX DETECTED - Likely false alarm
• Log incident for pattern analysis
• Monitor for potential escalation
• Consider source blocking if repeated
• Maintain standard security protocols`;
    } else {
      return `• UNCERTAIN THREAT - Requires human verification
• Conduct secondary analysis and review
• Consult with security experts
• Prepare contingency measures
• Monitor situation for changes`;
    }
  }

  async analyzeEmail(emailData: EmailAnalysis): Promise<ThreatAnalysis> {
    const fullContent = `${emailData.subject} ${emailData.body}`;
    
    // Enhanced analysis with email-specific factors
    const senderScore = this.analyzeSenderReputation(emailData.senderReputation);
    const headerScore = this.analyzeHeaders(emailData.headers);
    
    const baseAnalysis = await this.analyzeText(fullContent, { source: 'email' });
    
    // Adjust confidence based on email-specific factors
    const adjustedConfidence = Math.min(100, baseAnalysis.confidence + senderScore + headerScore);
    
    return {
      ...baseAnalysis,
      confidence: adjustedConfidence,
      reasons: [
        ...baseAnalysis.reasons,
        ...this.generateEmailSpecificReasons(emailData)
      ]
    };
  }

  async analyzeAudio(audioData: AudioAnalysis): Promise<ThreatAnalysis> {
    const baseAnalysis = await this.analyzeText(audioData.transcription, { 
      source: 'audio',
      fileType: 'audio'
    });
    
    // Audio-specific adjustments
    const voiceStressScore = this.analyzeVoiceStress(audioData);
    const speakerScore = this.analyzeSpeakerCount(audioData.speakers);
    
    const adjustedConfidence = Math.min(100, baseAnalysis.confidence + voiceStressScore + speakerScore);
    
    return {
      ...baseAnalysis,
      confidence: adjustedConfidence,
      reasons: [
        ...baseAnalysis.reasons,
        ...this.generateAudioSpecificReasons(audioData)
      ]
    };
  }

  private performSemanticAnalysis(content: string): number {
    const words = content.toLowerCase().split(/\s+/);
    const threatWords = ['bomb', 'explode', 'kill', 'die', 'attack', 'destroy', 'detonate', 'casualties', 'evacuate'];
    const hoaxIndicators = ['prank', 'joke', 'fake', 'just kidding', 'ha ha'];
    
    let score = 0;
    
    // Check for threat words
    threatWords.forEach(word => {
      if (content.toLowerCase().includes(word)) {
        score += 20;
      }
    });
    
    // Check for hoax indicators (reduce score)
    hoaxIndicators.forEach(word => {
      if (content.toLowerCase().includes(word)) {
        score -= 30;
      }
    });
    
    // Check for genuine threat patterns (increase score)
    this.hoaxPatterns.forEach(pattern => {
      if (content.toLowerCase().includes(pattern.toLowerCase())) {
        score -= 25; // These are now hoax indicators
      }
    });
    
    // Check for genuine threat indicators
    if (content.toLowerCase().includes('legitimate threat')) score += 30;
    if (content.toLowerCase().includes('not a drill')) score += 25;
    if (content.toLowerCase().includes('urgent')) score += 15;
    if (content.toLowerCase().includes('immediately')) score += 15;
    
    return Math.max(0, Math.min(100, score));
  }

  private analyzeSentiment(content: string): number {
    const negativeWords = ['hate', 'angry', 'revenge', 'payback', 'suffer', 'casualties', 'detonate'];
    const urgencyWords = ['now', 'immediately', 'urgent', 'quickly', 'hurry', 'emergency', 'alert'];
    
    let score = 0;
    
    negativeWords.forEach(word => {
      if (content.toLowerCase().includes(word)) {
        score += 15;
      }
    });
    
    urgencyWords.forEach(word => {
      if (content.toLowerCase().includes(word)) {
        score += 12;
      }
    });
    
    return Math.min(100, score);
  }

  private analyzePatterns(content: string): number {
    let score = 0;
    
    // Check for specific time references (high threat indicator)
    if (/\d{1,2}:\d{2}/.test(content) || /\d+ (minutes?|hours?|days?)/.test(content)) {
      score += 25;
    }
    
    // Check for specific location references (high threat indicator)
    if (/building|floor|room|address|street|plaza|conference/.test(content.toLowerCase())) {
      score += 20;
    }
    
    // Check for specific building details (very high threat indicator)
    if (/\d+.*floor|room [A-Z]|conference room|building.*\d+/.test(content.toLowerCase())) {
      score += 30;
    }
    
    // Check for vague threats (hoax indicator)
    if (/somewhere|something|someone|maybe|might/.test(content.toLowerCase())) {
      score -= 20;
    }
    
    // Check for specific evacuation instructions (genuine threat indicator)
    if (/evacuate|emergency stairs|do not use elevators|law enforcement/.test(content.toLowerCase())) {
      score += 25;
    }
    
    return Math.max(0, score);
  }

  private calculateConfidence(semantic: number, sentiment: number, pattern: number): number {
    const weights = { semantic: 0.5, sentiment: 0.3, pattern: 0.2 };
    return Math.round(
      semantic * weights.semantic + 
      sentiment * weights.sentiment + 
      pattern * weights.pattern
    );
  }

  private classifyThreat(confidence: number): 'genuine' | 'hoax' | 'uncertain' {
    if (confidence >= CONFIDENCE_THRESHOLDS.genuine) return 'genuine';
    if (confidence <= CONFIDENCE_THRESHOLDS.hoax) return 'hoax';
    return 'uncertain';
  }

  private determineThreatLevel(confidence: number, classification: string): 'low' | 'medium' | 'high' | 'critical' {
    if (classification === 'hoax') return 'low';
    if (confidence >= 90) return 'critical';
    if (confidence >= 70) return 'high';
    if (confidence >= 50) return 'medium';
    return 'low';
  }

  private generateReasons(content: string, semantic: number, sentiment: number, pattern: number): string[] {
    const reasons: string[] = [];
    
    if (semantic > 50) {
      reasons.push('High semantic threat indicators detected');
    }
    
    if (sentiment > 40) {
      reasons.push('Negative sentiment and urgency patterns identified');
    }
    
    if (pattern > 30) {
      reasons.push('Specific threat patterns found (time/location references)');
    }
    
    if (content.length < 50) {
      reasons.push('Message unusually brief for genuine threat');
    }
    
    return reasons;
  }

  private generateRecommendations(classification: string, confidence: number): string[] {
    const recommendations: string[] = [];
    
    switch (classification) {
      case 'genuine':
        recommendations.push('Immediately contact law enforcement');
        recommendations.push('Initiate emergency protocols');
        recommendations.push('Preserve all evidence');
        break;
      case 'hoax':
        recommendations.push('Log incident for pattern analysis');
        recommendations.push('Consider source blocking');
        recommendations.push('Monitor for escalation');
        break;
      case 'uncertain':
        recommendations.push('Conduct secondary verification');
        recommendations.push('Alert security team for review');
        recommendations.push('Prepare contingency measures');
        break;
    }
    
    return recommendations;
  }

  private analyzeSenderReputation(reputation: any): number {
    let score = 0;
    
    if (reputation.reputation === 'suspicious') score += 20;
    if (reputation.domainAge < 30) score += 15;
    if (reputation.spoofingIndicators.length > 0) score += 25;
    
    return score;
  }

  private analyzeHeaders(headers: Record<string, string>): number {
    let score = 0;
    
    // Check for suspicious routing
    if (headers['received']?.includes('tor') || headers['received']?.includes('proxy')) {
      score += 20;
    }
    
    // Check for spoofed headers
    if (headers['return-path'] !== headers['from']) {
      score += 15;
    }
    
    return score;
  }

  private generateEmailSpecificReasons(emailData: EmailAnalysis): string[] {
    const reasons: string[] = [];
    
    if (emailData.senderReputation.reputation === 'suspicious') {
      reasons.push('Sender has suspicious reputation');
    }
    
    if (emailData.senderReputation.domainAge < 30) {
      reasons.push('Sender domain is newly registered');
    }
    
    if (emailData.senderReputation.spoofingIndicators.length > 0) {
      reasons.push('Email spoofing indicators detected');
    }
    
    return reasons;
  }

  private analyzeVoiceStress(audioData: AudioAnalysis): number {
    // Placeholder for voice stress analysis
    // In real implementation, this would analyze audio features
    return audioData.confidence < 0.8 ? 10 : 0;
  }

  private analyzeSpeakerCount(speakers: number): number {
    // Multiple speakers might indicate coordination
    return speakers > 1 ? 15 : 0;
  }

  private generateAudioSpecificReasons(audioData: AudioAnalysis): string[] {
    const reasons: string[] = [];
    
    if (audioData.speakers > 1) {
      reasons.push('Multiple speakers detected - possible coordination');
    }
    
    if (audioData.confidence < 0.8) {
      reasons.push('Low transcription confidence - audio quality issues');
    }
    
    if (audioData.duration < 10) {
      reasons.push('Very short audio duration - typical of hoax calls');
    }
    
    return reasons;
  }
}

export const aiAnalysisService = new AIAnalysisService();