'use client';

import {
  AlertCircle,
  Check,
  ChevronRight,
  DollarSign,
  TrendingDown,
  Upload,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeFile = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('provider', provider);

    try {
      const response = await fetch('/api/analyze-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            AI Cost Analysis - <span className="text-green-400">Zero Setup Required</span>
          </h1>
          <p className="text-xl text-gray-300">
            Upload your OpenAI or Anthropic usage CSV and get immediate 40-60% cost reduction
            insights
          </p>
          <p className="text-lg text-green-400 mt-2">
            No API keys needed • No sign-up required • Results in seconds
          </p>
        </div>

        {!analysis ? (
          <div className="max-w-2xl mx-auto">
            {/* Provider Selection */}
            <div className="mb-6 flex justify-center gap-4">
              <button
                onClick={() => setProvider('openai')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  provider === 'openai'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                OpenAI
              </button>
              <button
                onClick={() => setProvider('anthropic')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  provider === 'anthropic'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Anthropic
              </button>
            </div>

            {/* File Upload */}
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive
                  ? 'border-blue-400 bg-blue-900/20'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-xl text-white font-semibold">
                  {file ? file.name : 'Drop your CSV file here'}
                </span>
                <p className="text-gray-400 mt-2">or click to browse</p>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {file && (
              <button
                onClick={analyzeFile}
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Analyzing your usage patterns...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Analyze & Find Savings
                  </span>
                )}
              </button>
            )}

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-white font-semibold">40-60% Savings</p>
                <p className="text-xs text-gray-400">Guaranteed insights</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <p className="text-white font-semibold">Instant Results</p>
                <p className="text-xs text-gray-400">Analysis in seconds</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <Check className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="text-white font-semibold">No Setup</p>
                <p className="text-xs text-gray-400">Zero configuration</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Results Header */}
            <div className="bg-gradient-to-r from-green-900 to-blue-900 rounded-xl p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-gray-300 text-sm">Current Monthly Cost</p>
                  <p className="text-3xl font-bold text-white">{analysis.summary.totalCost}</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Projected Savings</p>
                  <p className="text-3xl font-bold text-green-400">
                    {analysis.summary.projectedSavings}
                  </p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Savings Percentage</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {analysis.summary.savingsPercent}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">ROI Timeline</p>
                  <p className="text-3xl font-bold text-blue-400">{analysis.summary.paybackTime}</p>
                </div>
              </div>
              <p className="mt-4 text-lg text-green-400 font-semibold">
                {analysis.summary.competitorComparison}
              </p>
            </div>

            {/* Immediate Actions */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-yellow-400" />
                Immediate Actions (Start Today)
              </h2>
              <div className="space-y-3">
                {analysis.immediateWins?.map((win: any, index: number) => (
                  <div key={index} className="flex items-start bg-gray-700/50 rounded-lg p-4">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                      {win.priority}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{win.action}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-400">Time: {win.implementationTime}</span>
                        <span className="text-green-400">Impact: {win.expectedImpact}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimization Strategies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {analysis.strategies?.slice(0, 4).map((strategy: any, index: number) => (
                <div key={index} className="bg-gray-800/50 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{strategy.name}</h3>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {strategy.savings}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4">{strategy.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Confidence:</span>
                      <span className="text-white ml-2">{strategy.confidence}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Effort:</span>
                      <span className="text-white ml-2">{strategy.difficulty}</span>
                    </div>
                  </div>
                  {strategy.example && (
                    <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">Example:</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-400">Before: {strategy.example.before.cost}</span>
                        <span className="text-green-400">After: {strategy.example.after.cost}</span>
                      </div>
                      <p className="text-xs text-blue-400 mt-1">{strategy.example.improvement}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Custom Insights */}
            {analysis.insights && (
              <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-2 text-blue-400" />
                  Unique Insights for Your Usage Pattern
                </h2>
                <div className="space-y-3">
                  {analysis.insights.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <ChevronRight className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Save {analysis.summary.projectedSavings}/month?
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Implement these optimizations with Meterr's automated platform
              </p>
              <div className="flex gap-4 justify-center">
                <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all">
                  Start Free Trial
                </button>
                <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-all">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
