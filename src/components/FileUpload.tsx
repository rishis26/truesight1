import React, { useState, useCallback } from 'react';
// Replaced icon library with emojis to avoid blocked assets
import { FileUpload as FileUploadType, ThreatAnalysis } from '../types/threat';
import { fileProcessorService } from '../services/fileProcessor';
import { aiAnalysisService } from '../services/aiAnalysis';
import { SUPPORTED_FILE_FORMATS, PROCESSING_LIMITS } from '../utils/constants';
import { GlassCard } from './ui/GlassCard';
import { ExportButton } from './ExportButton';

interface FileUploadProps {
  onAnalysisComplete?: (analysis: ThreatAnalysis) => void;
}

export function FileUpload({ onAnalysisComplete }: FileUploadProps) {
  const [files, setFiles] = useState<FileUploadType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const supportedFormats = [
    ...SUPPORTED_FILE_FORMATS.email,
    ...SUPPORTED_FILE_FORMATS.audio,
    ...SUPPORTED_FILE_FORMATS.document
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (fileList: File[]) => {
    const newErrors: string[] = [];

    // Enforce max files
    const remainingSlots = PROCESSING_LIMITS.maxFiles - files.length;
    let candidateFiles = fileList;
    if (fileList.length > remainingSlots) {
      candidateFiles = fileList.slice(0, remainingSlots);
      newErrors.push(`Only ${remainingSlots} more file(s) allowed (max ${PROCESSING_LIMITS.maxFiles}).`);
    }

    // Filter by size and supported extensions
    const extensionAllowed = (name: string) => supportedFormats.some(ext => name.toLowerCase().endsWith(ext));
    const sizedAndTyped = candidateFiles.filter(f => {
      if (f.size > PROCESSING_LIMITS.maxFileSize) {
        newErrors.push(`${f.name} exceeds ${(PROCESSING_LIMITS.maxFileSize / (1024 * 1024)).toFixed(0)}MB limit.`);
        return false;
      }
      if (!extensionAllowed(f.name)) {
        newErrors.push(`${f.name} is not a supported format.`);
        return false;
      }
      return true;
    });

    if (newErrors.length > 0) {
      setErrors(prev => [...prev, ...newErrors]);
    }

    if (sizedAndTyped.length === 0) {
      return;
    }

    const newFiles: FileUploadType[] = sizedAndTyped.map(file => ({
      file,
      type: determineFileType(file)
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    // Process each file
    for (const fileUpload of newFiles) {
      await processFile(fileUpload);
    }
  };

  const processFile = async (fileUpload: FileUploadType) => {
    setIsProcessing(true);
    
    try {
      let analysis: ThreatAnalysis;
      
      switch (fileUpload.type) {
        case 'email':
          const emailData = await fileProcessorService.processEmailFile(fileUpload.file);
          analysis = await aiAnalysisService.analyzeEmail(emailData);
          break;
        case 'audio':
          const audioData = await fileProcessorService.processAudioFile(fileUpload.file);
          analysis = await aiAnalysisService.analyzeAudio(audioData);
          break;
        case 'document':
          const documentText = await fileProcessorService.processDocumentFile(fileUpload.file);
          analysis = await aiAnalysisService.analyzeText(documentText, { 
            source: 'document',
            fileType: fileUpload.file.type 
          });
          break;
        default:
          throw new Error('Unsupported file type');
      }

      // Update file with analysis
      setFiles(prev => prev.map(f => 
        f.file === fileUpload.file ? { ...f, analysis } : f
      ));

      onAnalysisComplete?.(analysis);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (fileToRemove: File) => {
    setFiles(prev => prev.filter(f => f.file !== fileToRemove));
  };

  const determineFileType = (file: File): 'email' | 'audio' | 'document' => {
    if (file.name.endsWith('.eml')) return 'email';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧';
      case 'audio': return '🎵';
      case 'document': return '📄';
      default: return '📁';
    }
  };

  const getThreatLevelColor = (level?: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <GlassCard variant="medium" elevation={2} className="p-4 sm:p-6" glow={true}>
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">File Analysis</h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Upload emails, audio recordings, or documents for threat analysis
          </p>
        </div>
      </GlassCard>

      {/* Upload Area */}
      <GlassCard variant="high" elevation={3} className="p-4 sm:p-8" glow={true}>
        <div
          className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-12 text-center transition-all duration-300 group ${
            dragActive 
              ? 'border-gray-400 dark:border-gray-500 bg-gray-50/50 dark:bg-gray-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50/30 dark:hover:bg-gray-900/10'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <span className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mb-4 sm:mb-6 text-4xl sm:text-6xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">⬆️</span>
          <p className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">
            Drop files here or click to upload
          </p>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
            Supported formats: {supportedFormats.join(', ')}
          </p>
          
          <input
            type="file"
            multiple
            accept={supportedFormats.join(',')}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          
          <button 
            onClick={() => document.querySelector('input[type="file"]')?.click()}
            className="relative z-20 bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium text-sm sm:text-base"
          >
            Select Files
          </button>
        </div>
      </GlassCard>

      {/* Error Messages */}
      {errors.length > 0 && (
        <GlassCard variant="medium" elevation={2} className="p-4 sm:p-6" glow={true}>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 sm:p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold mb-2 sm:mb-3 text-red-800 dark:text-red-200 text-sm sm:text-base">There were issues with your upload:</p>
                <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2">
                  {errors.map((err, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-red-700 dark:text-red-300">{err}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setErrors([])}
                className="ml-3 sm:ml-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 p-1 hover:bg-red-100 dark:hover:bg-red-800/30 rounded-lg"
                aria-label="Dismiss errors"
              >
                <span className="h-4 w-4 sm:h-5 sm:w-5">✖️</span>
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <GlassCard variant="medium" elevation={2} className="p-4 sm:p-6" glow={true}>
          <div className="flex items-center justify-center p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <span className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 mr-2 sm:mr-3 text-xl sm:text-2xl">⏳</span>
            <span className="text-base sm:text-lg font-medium text-blue-700 dark:text-blue-300">Processing files...</span>
          </div>
        </GlassCard>
      )}

      {/* File List */}
      {files.length > 0 && (
        <GlassCard variant="medium" elevation={2} className="p-4 sm:p-6" glow={true}>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Uploaded Files</h3>
          
          <div className="space-y-3 sm:space-y-4">
            {files.map((fileUpload, index) => (
              <div key={index} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-[4px] border border-white/30 dark:border-gray-600/30 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <span className="text-2xl sm:text-3xl transform hover:scale-110 transition-transform duration-200">{getFileIcon(fileUpload.type)}</span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">{fileUpload.file.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {fileUpload.type} • {(fileUpload.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeFile(fileUpload.file)}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 p-1.5 sm:p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                  >
                    <span className="h-4 w-4 sm:h-5 sm:w-5">✖️</span>
                  </button>
                </div>

                                    {/* Analysis Results */}
                {fileUpload.analysis && (
                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div className="flex items-center space-x-3">
                        {fileUpload.analysis.classification === 'genuine' ? (
                          <span className="h-6 w-6">⚠️</span>
                        ) : (
                          <span className="h-6 w-6">✅</span>
                        )}
                        <span className="font-semibold capitalize text-lg text-gray-900 dark:text-white">
                          {fileUpload.analysis.classification} Threat
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center space-x-4">
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getThreatLevelColor(fileUpload.analysis.threatLevel)}`}>
                            {fileUpload.analysis.threatLevel.toUpperCase()}
                          </span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {fileUpload.analysis.confidence}% confidence
                          </span>
                        </div>
                        <ExportButton 
                          analysis={fileUpload.analysis} 
                          inputText={`File: ${fileUpload.file.name}\nType: ${fileUpload.type}\nSize: ${(fileUpload.file.size / 1024).toFixed(1)} KB`}
                          className="self-start sm:self-center"
                        />
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">Summary</h4>
                      <div className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                        {fileUpload.analysis.summary}
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
                      <div
                        className={`h-3 rounded-full transition-all duration-700 ease-out ${
                          fileUpload.analysis.confidence >= 70 
                            ? 'bg-red-500' 
                            : fileUpload.analysis.confidence >= 40 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${fileUpload.analysis.confidence}%` }}
                      />
                    </div>

                    {/* More details - dimensions */}
                    {fileUpload.analysis.dimensions && (
                      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {Object.entries(fileUpload.analysis.dimensions).map(([key, value], index) => (
                          <div key={key} className="group p-4 rounded-xl border border-gray-200/60 dark:border-gray-600/30 bg-gradient-to-br from-white/90 to-gray-50/80 dark:from-gray-800/20 dark:to-gray-900/30 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 hover:-translate-y-1" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{key.replace(/_/g,' ')}</span>
                              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{value}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 via-orange-500 to-red-500 shadow-sm transition-all duration-700 ease-out" style={{ width: `${value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reasons */}
                    {fileUpload.analysis.reasons.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Analysis Factors:</h4>
                        <ul className="space-y-2">
                          {fileUpload.analysis.reasons.map((reason, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-center p-2 hover:bg-white/30 dark:hover:bg-gray-700/30 rounded-lg transition-colors duration-200">
                              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mr-3" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {fileUpload.analysis.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Recommended Actions:</h4>
                        <ul className="space-y-2">
                          {fileUpload.analysis.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-blue-600 dark:text-blue-400 flex items-center p-2 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200">
                              <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mr-3" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}