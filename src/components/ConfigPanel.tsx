import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';

interface ConfigPanelProps {
  onConfigUpdate?: () => void;
}

export function ConfigPanel({ onConfigUpdate }: ConfigPanelProps) {
  const [config, setConfig] = useState({
    openaiApiKey: '',
    defaultProvider: 'openai',
    maxFileSize: 50,
    maxConcurrentAnalyses: 5
  });

  const [isVisible, setIsVisible] = useState(false);
  const [hasApiKeys, setHasApiKeys] = useState(false);

  useEffect(() => {
    const hasKeys = !!(import.meta.env.VITE_OPENAI_API_KEY);
    setHasApiKeys(hasKeys);
  }, []);

  const handleSave = () => {
    // In a real application, you would save these to a backend
    // For now, we'll show instructions
    alert(`
API Configuration Instructions:

1. Create a .env file in your project root
2. Add your API keys:

VITE_OPENAI_API_KEY=your_openai_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_key_here
VITE_GOOGLE_AI_API_KEY=your_google_key_here
VITE_DEFAULT_AI_PROVIDER=openai

3. Restart the development server

Note: Never commit API keys to version control!
    `);
    
    setIsVisible(false);
    onConfigUpdate?.();
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
            hasApiKeys 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          }`}
          title={hasApiKeys ? 'API Configured' : 'Configure API Keys'}
        >
          {hasApiKeys ? '✅' : '⚙️'}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <GlassCard variant="high" elevation={4} className="max-w-2xl w-full max-h-[80vh] overflow-y-auto" glow={true}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Configuration</h2>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              ✖️
            </button>
          </div>

          <div className="space-y-6">
            {/* Status */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  {hasApiKeys 
                    ? 'API keys are configured. You can analyze content using AI services.'
                    : 'No API keys detected. Please configure at least one AI provider to use the full functionality.'
                  }
                </p>
              </div>
            </div>

            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                AI Provider
              </label>
              <select
                value={config.defaultProvider}
                onChange={(e) => setConfig(prev => ({ ...prev, defaultProvider: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="openai">OpenAI (GPT-4)</option>
              </select>
            </div>

            {/* API Key Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={config.openaiApiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Configuration Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  value={config.maxFileSize}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Concurrent Analyses
                </label>
                <input
                  type="number"
                  value={config.maxConcurrentAnalyses}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxConcurrentAnalyses: parseInt(e.target.value) }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Setup Instructions:</h3>
              <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-decimal list-inside">
                <li>Get API keys from OpenAI, Anthropic, or Google AI</li>
                <li>Create a .env file in your project root</li>
                <li>Add your API keys to the .env file</li>
                <li>Restart the development server</li>
                <li>Never commit API keys to version control</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Save Configuration
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
