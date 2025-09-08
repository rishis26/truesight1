/**
 * AUDIT EXPORT MODULE - USAGE EXAMPLES
 * 
 * This file demonstrates how to use the audit export functionality
 * for creating comprehensive analysis reports in multiple formats.
 */

import { ThreatAnalysis } from '../types/threat';
import { 
  generateExportPackage, 
  exportAsJson, 
  exportAsText, 
  exportAsCsv, 
  generateFilename,
  createExport,
  exportAndDownload 
} from './auditExport';

// Example 1: Basic Usage - Generate Export Package
export function exampleBasicUsage() {
  // Sample analysis data (this would come from your analysis service)
  const sampleAnalysis: ThreatAnalysis = {
    id: 'analysis_abc123_20250107',
    confidence: 75,
    classification: 'genuine',
    threatLevel: 'high',
    summary: '• HIGH THREAT DETECTED - Urgent attention required\n• Verify threat through secondary analysis\n• Prepare emergency response protocols',
    reasons: [
      'High semantic threat indicators detected',
      'Specific threat patterns found (time/location references)',
      'Negative sentiment and urgency patterns identified'
    ],
    recommendations: [
      'Immediately contact law enforcement',
      'Initiate emergency protocols',
      'Preserve all evidence'
    ],
    dimensions: {
      linguistic_analysis: 78,
      communication_metadata: 65,
      content_inconsistencies: 45,
      historical_patterns: 82,
      behavioral_indicators: 71,
      technical_verification: 58,
      contextual_analysis: 89,
      forensic_linguistics: 67
    },
    metadata: {
      processingTime: 1250,
      timestamp: '2025-01-07T22:04:22.000Z',
      source: 'text',
      fileType: 'text/plain'
    }
  };

  const inputText = "There is a bomb in the building and it will explode in one hour. Evacuate immediately!";

  // Generate the export package
  const exportPackage = generateExportPackage(
    'analysis_abc123_20250107',
    inputText,
    sampleAnalysis
  );

  console.log('Export package created:', exportPackage);
  return exportPackage;
}

// Example 2: Export in Different Formats
export function exampleMultipleFormats() {
  const package_data = exampleBasicUsage();

  // JSON Export (Machine-readable)
  const jsonExport = exportAsJson(package_data);
  console.log('JSON Export:', jsonExport);

  // Text Export (Human-readable)
  const textExport = exportAsText(package_data);
  console.log('Text Export:', textExport);

  // CSV Export (Spreadsheet data)
  const csvExport = exportAsCsv(package_data);
  console.log('CSV Export:', csvExport);

  return { jsonExport, textExport, csvExport };
}

// Example 3: Generate Filenames
export function exampleFilenameGeneration() {
  const analysisId = 'analysis_abc123_20250107';
  const timestamp = '2025-01-07T22:04:22.000Z';

  const jsonFilename = generateFilename(analysisId, 'json', timestamp);
  const textFilename = generateFilename(analysisId, 'text', timestamp);
  const csvFilename = generateFilename(analysisId, 'csv', timestamp);

  console.log('JSON filename:', jsonFilename);
  console.log('Text filename:', textFilename);
  console.log('CSV filename:', csvFilename);

  return { jsonFilename, textFilename, csvFilename };
}

// Example 4: Complete Export Workflow
export function exampleCompleteWorkflow() {
  const sampleAnalysis: ThreatAnalysis = {
    id: 'analysis_xyz789_20250107',
    confidence: 45,
    classification: 'hoax',
    threatLevel: 'low',
    summary: '• HOAX DETECTED - Likely false alarm\n• Log incident for pattern analysis\n• Monitor for potential escalation',
    reasons: [
      'Message unusually brief for genuine threat',
      'Hoax indicators detected in content'
    ],
    recommendations: [
      'Log incident for pattern analysis',
      'Consider source blocking',
      'Monitor for escalation'
    ],
    dimensions: {
      linguistic_analysis: 25,
      communication_metadata: 30,
      content_inconsistencies: 85,
      historical_patterns: 20,
      behavioral_indicators: 15,
      technical_verification: 40,
      contextual_analysis: 35,
      forensic_linguistics: 22
    },
    metadata: {
      processingTime: 890,
      timestamp: '2025-01-07T22:15:30.000Z',
      source: 'email',
      fileType: 'message/rfc822'
    }
  };

  const inputText = "This is just a test. Ha ha, just kidding about the bomb threat!";

  // Create and download JSON export
  const jsonExport = createExport(
    'analysis_xyz789_20250107',
    inputText,
    sampleAnalysis,
    null, // detailed_report
    'json'
  );

  console.log('JSON Export ready for download:', jsonExport);

  // Create and download text export
  const textExport = createExport(
    'analysis_xyz789_20250107',
    inputText,
    sampleAnalysis,
    null,
    'text'
  );

  console.log('Text Export ready for download:', textExport);

  return { jsonExport, textExport };
}

// Example 5: Error Handling
export function exampleErrorHandling() {
  try {
    // This will throw an error - empty analysis ID
    generateExportPackage('', 'Some text', {} as ThreatAnalysis);
  } catch (error) {
    console.log('Caught expected error:', error);
  }

  try {
    // This will throw an error - empty input text
    generateExportPackage('valid_id', '', {} as ThreatAnalysis);
  } catch (error) {
    console.log('Caught expected error:', error);
  }

  try {
    // This will throw an error - missing summary report
    generateExportPackage('valid_id', 'Some text', null as any);
  } catch (error) {
    console.log('Caught expected error:', error);
  }
}

// Example 6: React Component Integration
export function exampleReactIntegration() {
  // This shows how you would use the export functionality in a React component
  
  const handleExportClick = (analysis: ThreatAnalysis, inputText: string) => {
    // Direct download
    exportAndDownload(
      analysis.id,
      inputText,
      analysis,
      null, // detailed_report
      'json'
    );
  };

  const handleCustomExport = (analysis: ThreatAnalysis, inputText: string) => {
    // Custom export with specific format
    const { data, filename } = createExport(
      analysis.id,
      inputText,
      analysis,
      null,
      'text'
    );

    // You could save to localStorage, send to server, etc.
    localStorage.setItem(`analysis_${analysis.id}`, data);
    console.log(`Analysis saved to localStorage with filename: ${filename}`);
  };

  return { handleExportClick, handleCustomExport };
}

// Example 7: Batch Export Multiple Analyses
export function exampleBatchExport(analyses: ThreatAnalysis[], inputTexts: string[]) {
  const exports = analyses.map((analysis, index) => {
    const inputText = inputTexts[index] || 'No input text available';
    
    return {
      analysisId: analysis.id,
      jsonExport: createExport(analysis.id, inputText, analysis, null, 'json'),
      textExport: createExport(analysis.id, inputText, analysis, null, 'text'),
      csvExport: createExport(analysis.id, inputText, analysis, null, 'csv')
    };
  });

  console.log('Batch exports created:', exports);
  return exports;
}

// Example 8: Server Integration (for future backend implementation)
export function exampleServerIntegration() {
  // This shows how you might integrate with a backend server
  
  const sendToServer = async (analysis: ThreatAnalysis, inputText: string) => {
    const exportPackage = generateExportPackage(
      analysis.id,
      inputText,
      analysis
    );

    try {
      const response = await fetch('/api/analyses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportPackage)
      });

      if (response.ok) {
        console.log('Analysis saved to server successfully');
        return await response.json();
      } else {
        throw new Error('Failed to save analysis to server');
      }
    } catch (error) {
      console.error('Server integration error:', error);
      throw error;
    }
  };

  return { sendToServer };
}

// Run all examples (for testing)
export function runAllExamples() {
  console.log('=== AUDIT EXPORT EXAMPLES ===');
  
  console.log('\n1. Basic Usage:');
  exampleBasicUsage();
  
  console.log('\n2. Multiple Formats:');
  exampleMultipleFormats();
  
  console.log('\n3. Filename Generation:');
  exampleFilenameGeneration();
  
  console.log('\n4. Complete Workflow:');
  exampleCompleteWorkflow();
  
  console.log('\n5. Error Handling:');
  exampleErrorHandling();
  
  console.log('\n6. React Integration:');
  exampleReactIntegration();
  
  console.log('\n=== EXAMPLES COMPLETE ===');
}

// Export for use in other modules
export default {
  exampleBasicUsage,
  exampleMultipleFormats,
  exampleFilenameGeneration,
  exampleCompleteWorkflow,
  exampleErrorHandling,
  exampleReactIntegration,
  exampleBatchExport,
  exampleServerIntegration,
  runAllExamples
};
