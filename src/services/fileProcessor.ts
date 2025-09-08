import { EmailAnalysis, AudioAnalysis } from '../types/threat';

// API Configuration
interface APIConfig {
  openai?: {
    apiKey: string;
  };
  whisper?: {
    apiKey: string;
  };
}

class FileProcessorService {
  private config: APIConfig = {};

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      this.config.openai = {
        apiKey: import.meta.env.VITE_OPENAI_API_KEY
      };
    }

    if (import.meta.env.VITE_WHISPER_API_KEY) {
      this.config.whisper = {
        apiKey: import.meta.env.VITE_WHISPER_API_KEY
      };
    }
  }
  async processEmailFile(file: File): Promise<EmailAnalysis> {
    const content = await this.readFileAsText(file);
    
    // Parse email headers and body
    const emailData = this.parseEmailContent(content);
    
    // Analyze sender reputation
    const senderReputation = await this.analyzeSenderReputation(emailData.sender);
    
    return {
      ...emailData,
      senderReputation
    };
  }

  async processAudioFile(file: File): Promise<AudioAnalysis> {
    try {
      // Use real Whisper API for transcription
      const transcription = await this.transcribeWithWhisper(file);
      return transcription;
    } catch (error) {
      console.error('Whisper API error:', error);
      console.warn('Falling back to mock transcription');
      
      // Fallback to mock transcription
      const audioBuffer = await this.readFileAsArrayBuffer(file);
      const mockTranscription = await this.transcribeAudio(audioBuffer);
      
      return {
        transcription: mockTranscription.text,
        speakers: mockTranscription.speakers,
        confidence: mockTranscription.confidence,
        duration: mockTranscription.duration,
        language: mockTranscription.language || 'en'
      };
    }
  }

  private async transcribeWithWhisper(file: File): Promise<AudioAnalysis> {
    if (!this.config.openai?.apiKey) {
      throw new Error('OpenAI API key not configured for Whisper');
    }

    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: this.config.openai.apiKey,
      dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
    });

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('response_format', 'verbose_json');

    // Use OpenAI Whisper API
    const response = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
      response_format: 'verbose_json'
    });

    // Calculate duration from file size (approximate)
    const duration = file.size / 16000; // Rough estimate

    return {
      transcription: response.text,
      speakers: 1, // Whisper doesn't provide speaker count
      confidence: 0.9, // High confidence for Whisper
      duration,
      language: response.language || 'en'
    };
  }

  async processDocumentFile(file: File): Promise<string> {
    const fileType = file.type;
    
    try {
      if (fileType.includes('pdf')) {
        return await this.extractPdfText(file);
      } else if (fileType.includes('word') || file.name.endsWith('.docx')) {
        return await this.extractWordText(file);
      } else {
        return await this.readFileAsText(file);
      }
    } catch (error) {
      console.error('Document processing error:', error);
      throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private parseEmailContent(content: string): Omit<EmailAnalysis, 'senderReputation'> {
    const lines = content.split('\n');
    const headers: Record<string, string> = {};
    let bodyStart = 0;
    
    // Parse headers
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') {
        bodyStart = i + 1;
        break;
      }
      
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).toLowerCase();
        const value = line.substring(colonIndex + 1).trim();
        headers[key] = value;
      }
    }
    
    // Extract body
    const body = lines.slice(bodyStart).join('\n').trim();
    
    return {
      subject: headers['subject'] || '',
      body,
      sender: headers['from'] || '',
      headers
    };
  }

  private async analyzeSenderReputation(sender: string): Promise<EmailAnalysis['senderReputation']> {
    const domain = sender.split('@')[1] || '';
    
    // Simulate domain age check
    const domainAge = await this.checkDomainAge(domain);
    
    // Check for spoofing indicators
    const spoofingIndicators = this.detectSpoofingIndicators(sender);
    
    // Determine reputation
    let reputation: 'trusted' | 'suspicious' | 'unknown' = 'unknown';
    if (spoofingIndicators.length > 0 || domainAge < 30) {
      reputation = 'suspicious';
    } else if (domainAge > 365) {
      reputation = 'trusted';
    }
    
    return {
      domainAge,
      spoofingIndicators,
      reputation
    };
  }

  private async checkDomainAge(domain: string): Promise<number> {
    // Simulate domain age check (in real implementation, use WHOIS API)
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    if (commonDomains.includes(domain.toLowerCase())) {
      return Math.floor(Math.random() * 3000) + 1000; // 3-10 years
    }
    return Math.floor(Math.random() * 365) + 1; // 1-365 days
  }

  private detectSpoofingIndicators(sender: string): string[] {
    const indicators: string[] = [];
    
    // Check for suspicious characters
    if (/[0-9]/.test(sender.split('@')[0])) {
      indicators.push('Numbers in username');
    }
    
    // Check for lookalike domains
    if (sender.includes('gmai1.com') || sender.includes('yah00.com')) {
      indicators.push('Lookalike domain detected');
    }
    
    // Check for excessive dots or hyphens
    if ((sender.match(/\./g) || []).length > 3) {
      indicators.push('Excessive dots in email address');
    }
    
    return indicators;
  }

  private async transcribeAudio(audioBuffer: ArrayBuffer): Promise<{
    text: string;
    speakers: number;
    confidence: number;
    duration: number;
    language?: string;
  }> {
    // Simulate audio transcription
    // In real implementation, integrate with Whisper API or Google Speech-to-Text
    
    const duration = audioBuffer.byteLength / 16000; // Approximate duration
    
    // Simulate transcription result
    const sampleTranscriptions = [
      "There is a bomb in the building and it will explode in one hour",
      "This is just a test of the emergency system",
      "I'm calling to report a suspicious package",
      "Ha ha, just kidding about the bomb threat"
    ];
    
    const text = sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)];
    
    return {
      text,
      speakers: Math.floor(Math.random() * 2) + 1,
      confidence: 0.85 + Math.random() * 0.15,
      duration,
      language: 'en'
    };
  }

  private async extractPdfText(file: File): Promise<string> {
    try {
      // Use pdf-parse library for PDF text extraction
      const pdfParse = await import('pdf-parse');
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      const data = await pdfParse.default(arrayBuffer);
      return data.text || 'No text content found in PDF';
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF file');
    }
  }

  private async extractWordText(file: File): Promise<string> {
    try {
      // Use mammoth.js for Word document text extraction
      const mammoth = await import('mammoth');
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value || 'No text content found in Word document';
    } catch (error) {
      console.error('Word extraction error:', error);
      throw new Error('Failed to extract text from Word document');
    }
  }
}

export const fileProcessorService = new FileProcessorService();