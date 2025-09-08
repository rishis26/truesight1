import { ThreatAnalysis } from '../types/threat';

// Types for the export system
export interface ExportPackage {
  metadata: {
    analysis_id: string;
    timestamp: string;
    trueSight_version: string;
  };
  input_data: {
    text: string;
    character_count: number;
  };
  results: {
    summary_report: ThreatAnalysis;
    detailed_report: ThreatAnalysis | null;
  };
}

export interface ExportOptions {
  includeMetadata?: boolean;
  includeInputData?: boolean;
  includeDetailedReport?: boolean;
  format?: 'json' | 'text' | 'csv';
}

/**
 * Generates a complete audit log export package for a threat analysis session
 * @param analysis_id - Unique identifier for the analysis
 * @param input_text - Original input text that was analyzed
 * @param summary_report - Main threat analysis results
 * @param detailed_report - Optional detailed analysis results
 * @returns Structured export package
 */
export function generateExportPackage(
  analysis_id: string,
  input_text: string,
  summary_report: ThreatAnalysis,
  detailed_report?: ThreatAnalysis | null
): ExportPackage {
  // Validation
  if (!analysis_id || !analysis_id.trim()) {
    throw new Error('Analysis ID cannot be empty');
  }
  
  if (!input_text || !input_text.trim()) {
    throw new Error('Input text cannot be empty');
  }

  if (!summary_report) {
    throw new Error('Summary report is required');
  }

  return {
    metadata: {
      analysis_id: analysis_id.trim(),
      timestamp: summary_report.metadata.timestamp,
      trueSight_version: 'v1.0'
    },
    input_data: {
      text: input_text.trim(),
      character_count: input_text.trim().length
    },
    results: {
      summary_report,
      detailed_report: detailed_report || null
    }
  };
}

/**
 * Exports the package as a pretty-printed JSON string
 * @param package_data - The export package to convert
 * @returns Formatted JSON string
 */
export function exportAsJson(package_data: ExportPackage): string {
  try {
    // flatten ip geolocation into top-level convenience key if present
    const cloned = JSON.parse(JSON.stringify(package_data));
    const ipg = cloned.results?.summary_report?.metadata?.ipGeolocation;
    if (ipg) {
      cloned.ip_geolocation = ipg;
    }
    return JSON.stringify(cloned, null, 2);
  } catch (error) {
    throw new Error(`Failed to generate JSON export: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Exports the package as a human-readable text summary
 * @param package_data - The export package to convert
 * @returns Formatted text string
 */
export function exportAsText(package_data: ExportPackage): string {
  const { metadata, input_data, results } = package_data;
  const analysis = results.summary_report;
  
  let text = '';
  
  // Header
  text += '='.repeat(80) + '\n';
  text += 'TRUESIGHT THREAT ANALYSIS AUDIT LOG\n';
  text += '='.repeat(80) + '\n\n';
  
  // Metadata
  text += 'ANALYSIS METADATA:\n';
  text += '-'.repeat(20) + '\n';
  text += `Analysis ID: ${metadata.analysis_id}\n`;
  text += `Timestamp: ${metadata.timestamp}\n`;
  text += `System Version: ${metadata.trueSight_version}\n\n`;
  
  // Input Data
  text += 'INPUT DATA:\n';
  text += '-'.repeat(12) + '\n';
  text += `Character Count: ${input_data.character_count}\n`;
  text += `Input Text: ${input_data.text}\n\n`;
  
  // Analysis Results
  text += 'ANALYSIS RESULTS:\n';
  text += '-'.repeat(18) + '\n';
  text += `Overall Score: ${analysis.confidence}% (${getConfidenceLevel(analysis.confidence)})\n`;
  text += `Classification: ${analysis.classification.toUpperCase()}\n`;
  text += `Threat Level: ${analysis.threatLevel.toUpperCase()}\n`;
  text += `Processing Time: ${analysis.metadata.processingTime}ms\n`;
  text += `Source: ${analysis.metadata.source.toUpperCase()}\n\n`;
  
  // Summary
  text += 'SUMMARY:\n';
  text += '-'.repeat(8) + '\n';
  text += `${analysis.summary}\n\n`;

  // IP Geolocation Summary line if available
  const ipg: any = (analysis as any).metadata?.ipGeolocation;
  if (ipg) {
    text += `IP Geolocation: ${ipg.city}, ${ipg.region}, ${ipg.country} (ISP: ${ipg.isp})\n\n`;
  }
  
  // Key Indicators
  if (analysis.reasons && analysis.reasons.length > 0) {
    text += 'KEY INDICATORS:\n';
    text += '-'.repeat(15) + '\n';
    analysis.reasons.forEach((reason, index) => {
      text += `${index + 1}. ${reason}\n`;
    });
    text += '\n';
  }
  
  // Recommendations
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    text += 'RECOMMENDATIONS:\n';
    text += '-'.repeat(16) + '\n';
    analysis.recommendations.forEach((rec, index) => {
      text += `${index + 1}. ${rec}\n`;
    });
    text += '\n';
  }
  
  // Detailed Analysis Dimensions
  if (analysis.dimensions) {
    text += 'DETAILED ANALYSIS DIMENSIONS:\n';
    text += '-'.repeat(32) + '\n';
    
    const sortedDimensions = Object.entries(analysis.dimensions)
      .sort(([,a], [,b]) => b - a);
    
    sortedDimensions.forEach(([key, value]) => {
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      text += `${formattedKey}: ${value}% (${getConfidenceLevel(value)})\n`;
    });
    text += '\n';
  }
  
  // Footer
  text += '='.repeat(80) + '\n';
  text += 'END OF AUDIT LOG\n';
  text += 'Generated by trueSight Threat Detection System\n';
  text += '='.repeat(80) + '\n';
  
  return text;
}

/**
 * Exports the package as CSV data for spreadsheet analysis
 * @param package_data - The export package to convert
 * @returns CSV formatted string
 */
export function exportAsPdf(package_data: ExportPackage): string {
  const { metadata, input_data, results } = package_data;
  const analysis = results.summary_report;
  
  // Create a simple HTML structure that can be converted to PDF
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>TrueSight Threat Analysis Report</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            margin: 40px; 
            color: #333;
            background: #fff;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        .header h1 { 
            color: #2563eb; 
            margin: 0; 
            font-size: 28px;
        }
        .header p { 
            color: #666; 
            margin: 5px 0 0 0; 
            font-size: 14px;
        }
        .section { 
            margin-bottom: 25px; 
            padding: 20px; 
            border: 1px solid #e5e7eb; 
            border-radius: 8px;
            background: #f9fafb;
        }
        .section h2 { 
            color: #1f2937; 
            margin-top: 0; 
            margin-bottom: 15px;
            font-size: 18px;
            border-bottom: 2px solid #d1d5db;
            padding-bottom: 8px;
        }
        .classification { 
            display: inline-block; 
            padding: 8px 16px; 
            border-radius: 20px; 
            font-weight: bold; 
            margin: 5px 10px 5px 0;
        }
        .genuine { background: #dcfce7; color: #166534; }
        .hoax { background: #fef3c7; color: #92400e; }
        .uncertain { background: #dbeafe; color: #1e40af; }
        .threat-low { background: #dcfce7; color: #166534; }
        .threat-medium { background: #fef3c7; color: #92400e; }
        .threat-high { background: #fed7d7; color: #c53030; }
        .threat-critical { background: #fecaca; color: #991b1b; }
        .confidence { 
            background: linear-gradient(90deg, #10b981 0%, #f59e0b 25%, #f97316 50%, #ef4444 75%, #dc2626 100%);
            height: 20px; 
            border-radius: 10px; 
            margin: 10px 0;
            position: relative;
        }
        .confidence::after {
            content: '${analysis.confidence}%';
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: white;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        .reasons, .recommendations { 
            margin: 10px 0; 
        }
        .reasons ul, .recommendations ul { 
            margin: 10px 0; 
            padding-left: 20px; 
        }
        .reasons li, .recommendations li { 
            margin: 8px 0; 
        }
        .metadata { 
            font-size: 12px; 
            color: #6b7280; 
            background: #f3f4f6; 
            padding: 15px; 
            border-radius: 6px;
            margin-top: 20px;
        }
        .input-text { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            padding: 15px; 
            border-radius: 6px; 
            font-family: 'Courier New', monospace; 
            white-space: pre-wrap;
            max-height: 200px;
            overflow-y: auto;
        }
        @media print {
            body { margin: 20px; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛡️ TrueSight Threat Analysis Report</h1>
        <p>Analysis ID: ${metadata.analysis_id} | Generated: ${new Date(metadata.timestamp).toLocaleString()}</p>
    </div>

    <div class="section">
        <h2>📊 Analysis Summary</h2>
        <p><strong>Classification:</strong> 
            <span class="classification ${analysis.classification}">${analysis.classification.toUpperCase()}</span>
        </p>
        <p><strong>Threat Level:</strong> 
            <span class="classification threat-${analysis.threatLevel}">${analysis.threatLevel.toUpperCase()}</span>
        </p>
        <p><strong>Confidence Score:</strong></p>
        <div class="confidence" style="width: ${analysis.confidence}%;"></div>
    </div>

    <div class="section">
        <h2>📝 Analysis Summary</h2>
        <p>${analysis.summary}</p>
    </div>

    <div class="section">
        <h2>🔍 Key Findings</h2>
        <div class="reasons">
            <ul>
                ${analysis.reasons.map(reason => `<li>${reason}</li>`).join('')}
            </ul>
        </div>
    </div>

    <div class="section">
        <h2>💡 Recommendations</h2>
        <div class="recommendations">
            <ul>
                ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>

    <div class="section">
        <h2>📄 Original Input</h2>
        <div class="input-text">${input_data.text}</div>
    </div>

    <div class="metadata">
        <p><strong>Analysis Details:</strong></p>
        <p>• Source: ${analysis.metadata.source}</p>
        <p>• Processing Time: ${analysis.metadata.processingTime}ms</p>
        <p>• Character Count: ${input_data.character_count}</p>
        <p>• TrueSight Version: ${metadata.trueSight_version}</p>
    </div>
</body>
</html>`;

  return htmlContent;
}

export function exportAsCsv(package_data: ExportPackage): string {
  const { metadata, input_data, results } = package_data;
  const analysis = results.summary_report;
  
  let csv = '';
  
  // CSV Header
  csv += 'Field,Value\n';
  
  // Basic Analysis Data
  csv += `analysis_id,${metadata.analysis_id}\n`;
  csv += `timestamp,${metadata.timestamp}\n`;
  csv += `trueSight_version,${metadata.trueSight_version}\n`;
  csv += `input_character_count,${input_data.character_count}\n`;
  csv += `overall_score,${analysis.confidence}\n`;
  csv += `classification,${analysis.classification}\n`;
  csv += `threat_level,${analysis.threatLevel}\n`;
  csv += `processing_time_ms,${analysis.metadata.processingTime}\n`;
  csv += `source,${analysis.metadata.source}\n`;
  
  // Detailed Dimensions
  if (analysis.dimensions) {
    Object.entries(analysis.dimensions).forEach(([key, value]) => {
      const formattedKey = key.replace(/_/g, '_');
      csv += `dimension_${formattedKey},${value}\n`;
    });
  }
  
  // Key Indicators Count
  csv += `key_indicators_count,${analysis.reasons ? analysis.reasons.length : 0}\n`;
  
  // Recommendations Count
  csv += `recommendations_count,${analysis.recommendations ? analysis.recommendations.length : 0}\n`;
  
  return csv;
}

/**
 * Generates a standardized filename for the export
 * @param analysis_id - The analysis ID
 * @param format - The export format
 * @param timestamp - Optional custom timestamp (defaults to current time)
 * @returns Standardized filename
 */
export function generateFilename(
  analysis_id: string, 
  format: 'json' | 'text' | 'csv',
  timestamp?: string
): string {
  const ts = timestamp || new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5) + 'Z';
  const cleanId = analysis_id.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `trueSight_analysis_${cleanId}_${ts}.${format === 'text' ? 'txt' : format}`;
}

/**
 * Helper function to get confidence level description
 * @param confidence - Confidence percentage
 * @returns Confidence level string
 */
function getConfidenceLevel(confidence: number): string {
  if (confidence >= 90) return 'Very High';
  if (confidence >= 70) return 'High';
  if (confidence >= 50) return 'Medium';
  if (confidence >= 30) return 'Low';
  return 'Very Low';
}

/**
 * Complete export workflow - generates package and returns formatted data
 * @param analysis_id - Unique identifier for the analysis
 * @param input_text - Original input text
 * @param summary_report - Main analysis results
 * @param detailed_report - Optional detailed results
 * @param format - Export format
 * @returns Object with formatted data and filename
 */
export function createExport(
  analysis_id: string,
  input_text: string,
  summary_report: ThreatAnalysis,
  detailed_report?: ThreatAnalysis | null,
  format: 'json' | 'text' | 'csv' | 'pdf' = 'json'
): { data: string; filename: string } {
  const package_data = generateExportPackage(analysis_id, input_text, summary_report, detailed_report);
  
  let data: string;
  switch (format) {
    case 'json':
      data = exportAsJson(package_data);
      break;
    case 'text':
      data = exportAsText(package_data);
      break;
    case 'csv':
      data = exportAsCsv(package_data);
      break;
    case 'pdf':
      data = exportAsPdf(package_data);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
  
  const filename = generateFilename(analysis_id, format, package_data.metadata.timestamp);
  
  return { data, filename };
}

/**
 * Downloads the export data as a file
 * @param data - The formatted data to download
 * @param filename - The filename for the download
 * @param mimeType - MIME type for the file
 */
export function downloadExport(data: string, filename: string, mimeType: string): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Complete export and download workflow
 * @param analysis_id - Unique identifier for the analysis
 * @param input_text - Original input text
 * @param summary_report - Main analysis results
 * @param detailed_report - Optional detailed results
 * @param format - Export format
 */
export function exportAndDownload(
  analysis_id: string,
  input_text: string,
  summary_report: ThreatAnalysis,
  detailed_report?: ThreatAnalysis | null,
  format: 'json' | 'text' | 'csv' | 'pdf' = 'json'
): void {
  const { data, filename } = createExport(analysis_id, input_text, summary_report, detailed_report, format);
  
  const mimeTypes = {
    json: 'application/json',
    text: 'text/plain',
    csv: 'text/csv',
    pdf: 'text/html' // HTML that can be printed to PDF
  };
  
  downloadExport(data, filename, mimeTypes[format]);
}
