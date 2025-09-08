export const SUPPORTED_FILE_FORMATS = {
  email: ['.eml', '.msg'],
  audio: ['.wav', '.mp3', '.m4a', '.ogg', '.flac'],
  document: ['.pdf', '.docx', '.txt', '.rtf']
};

export const THREAT_LEVELS = {
  low: {
    color: 'green',
    description: 'Minimal risk - likely hoax or false alarm'
  },
  medium: {
    color: 'yellow', 
    description: 'Moderate risk - requires verification'
  },
  high: {
    color: 'orange',
    description: 'High risk - immediate attention required'
  },
  critical: {
    color: 'red',
    description: 'Critical threat - emergency response needed'
  }
};

export const CONFIDENCE_THRESHOLDS = {
  hoax: 25,
  uncertain: 60,
  genuine: 60
};

export const PROCESSING_LIMITS = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxFiles: 10,
  timeoutMs: 30000 // 30 seconds
};