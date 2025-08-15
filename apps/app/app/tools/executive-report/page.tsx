'use client';

import {
  AlertCircle,
  Calendar,
  DollarSign,
  Download,
  FileText,
  Mail,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

export default function ExecutiveReport() {
  const [frequency, setFrequency] = useState('weekly');
  const [emailEnabled, setEmailEnabled] = useState(true);

  const executiveSummary = {
    period: 'January 8-14, 2025',
    totalSpend: '$8,432',
    totalSavings: '$2,156',
    overallROI: '247%',
    topPerformer: 'Customer Support (300% ROI)',
    bottomPerformer: 'Engineering (100% ROI)',
    recommendations: 3,
    alerts: 1,
  };

  const keyInsights = [
    {
      icon: TrendingUp,
      title: 'ROI Improvement',
      description:
        'Overall AI ROI increased by 23% this week, driven primarily by Customer Support automation.',
      impact: 'positive',
    },
    {
      icon: DollarSign,
      title: 'Cost Optimization',
      description: 'Automatic model routing saved $450 without impacting response quality.',
      impact: 'positive',
    },
    {
      icon: AlertCircle,
      title: 'Budget Alert',
      description: 'Marketing department at 85% of monthly AI budget with 2 weeks remaining.',
      impact: 'warning',
    },
    {
      icon: Target,
      title: 'Efficiency Gain',
      description: 'Cost per customer ticket decreased from $0.58 to $0.42 (28% improvement).',
      impact: 'positive',
    },
  ];

  const recommendations = [
    {
      priority: 'High',
      action: 'Enable auto-optimization for Marketing department',
      expectedSaving: '$680/month',
      effort: '5 minutes',
    },
    {
      priority: 'Medium',
      action: 'Migrate simple queries from GPT-4 to GPT-3.5',
      expectedSaving: '$320/month',
      effort: '1 hour',
    },
    {
      priority: 'Low',
      action: 'Implement prompt caching for repetitive queries',
      expectedSaving: '$180/month',
      effort: '2 hours',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Executive Intelligence Report
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  AI investment insights for business leaders
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Report Settings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure how and when you receive executive summaries
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Email automatically
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-sm p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Executive Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-green-200 text-sm">Period</p>
              <p className="text-xl font-semibold">{executiveSummary.period}</p>
            </div>
            <div>
              <p className="text-green-200 text-sm">Total AI Investment</p>
              <p className="text-3xl font-bold">{executiveSummary.totalSpend}</p>
            </div>
            <div>
              <p className="text-green-200 text-sm">Overall ROI</p>
              <p className="text-3xl font-bold">{executiveSummary.overallROI}</p>
            </div>
            <div>
              <p className="text-green-200 text-sm">Optimizations Saved</p>
              <p className="text-xl font-semibold">{executiveSummary.totalSavings}</p>
            </div>
            <div>
              <p className="text-green-200 text-sm">Top Performer</p>
              <p className="text-xl font-semibold">{executiveSummary.topPerformer}</p>
            </div>
            <div>
              <p className="text-green-200 text-sm">Needs Attention</p>
              <p className="text-xl font-semibold">{executiveSummary.bottomPerformer}</p>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Key Insights This Period
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.impact === 'positive'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-start">
                  <div
                    className={`p-2 rounded-lg ${
                      insight.impact === 'positive'
                        ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300'
                        : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300'
                    }`}
                  >
                    <insight.icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3
                      className={`font-semibold ${
                        insight.impact === 'positive'
                          ? 'text-green-900 dark:text-green-100'
                          : 'text-yellow-900 dark:text-yellow-100'
                      }`}
                    >
                      {insight.title}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${
                        insight.impact === 'positive'
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-yellow-700 dark:text-yellow-300'
                      }`}
                    >
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Recommended Actions
          </h2>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          rec.priority === 'High'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : rec.priority === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                      <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                        {rec.effort} to implement
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">{rec.action}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Expected savings:{' '}
                      <span className="font-semibold text-green-600">{rec.expectedSaving}</span>
                    </p>
                  </div>
                  <button className="ml-4 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Natural Language Summary */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Plain English Summary
              </h3>
              <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                This week, your AI investments generated strong returns with an overall ROI of 247%.
                Customer Support is your star performer, achieving 3x returns through efficient
                automation. The automatic optimization system saved you $2,156 without any quality
                degradation. However, Marketing needs attention as they&apos;re approaching their
                budget limit. By implementing the recommended optimizations, you could save an
                additional $1,180 per month. The trend is positive - your AI efficiency improved 23%
                compared to last month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
