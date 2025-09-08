export interface ThreatAnalysis {
  id: string;
  confidence: number;
  classification: 'genuine' | 'hoax' | 'uncertain';
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  reasons: string[];
  recommendations: string[];
  dimensions?: {
    linguistic_analysis: number;
    communication_metadata: number;
    content_inconsistencies: number;
    historical_patterns: number;
    behavioral_indicators: number;
    technical_verification: number;
    contextual_analysis: number;
    forensic_linguistics: number;
  };
  metadata: {
    fileType?: string;
    processingTime: number;
    timestamp: string;
    source: 'text' | 'email' | 'audio' | 'document';
  };
}

export interface EmailAnalysis {
  subject: string;
  body: string;
  sender: string;
  headers: Record<string, string>;
  senderReputation: {
    domainAge: number;
    spoofingIndicators: string[];
    reputation: 'trusted' | 'suspicious' | 'unknown';
  };
}

export interface AudioAnalysis {
  transcription: string;
  speakers: number;
  confidence: number;
  duration: number;
  language: string;
}

export interface FileUpload {
  file: File;
  type: 'email' | 'audio' | 'document';
  content?: string;
  analysis?: ThreatAnalysis;
}