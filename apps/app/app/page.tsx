'use client';

import { useState } from 'react';

export default function Dashboard() {
  const [step, setStep] = useState(1);
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quickWin, setQuickWin] = useState<any>(null);

  // Form data
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openai');

  const createCustomer = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, companyName })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to create customer');
      }
      
      // Use the customer ID whether new or existing
      setCustomerId(data.customer.id);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addApiKey = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/customers/${customerId}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          keyName: 'Production Key',
          apiKey
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add API key');
      }
      
      setStep(3);
      // Try to generate Quick Win
      generateQuickWin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateQuickWin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}/quick-win`, {
        method: 'POST'
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.quickWin) {
          setQuickWin(data.quickWin);
        }
      }
    } catch (err) {
      console.error('Quick Win generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            meterr
          </h1>
          <p className="text-xl text-gray-600">
            Smarter AI usage. Lower costs. Pay only for proven savings.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`w-32 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <div className={`w-32 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Step 1: Tell us about your company</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Acme Inc."
                  />
                </div>
                <button
                  onClick={createCustomer}
                  disabled={loading || !email || !companyName}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Creating account...' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Step 2: Connect your AI API Key</h2>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  🔒 Your API key is encrypted and never shared. You remain in full control.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Provider
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {provider === 'anthropic' ? 'Anthropic' : 'OpenAI'} API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder={provider === 'anthropic' ? 'sk-ant-api03-...' : 'sk-...'}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Get your API key from{' '}
                    <a
                      href={provider === 'anthropic' ? 'https://console.anthropic.com/settings/keys' : 'https://platform.openai.com/api-keys'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {provider === 'anthropic' ? 'Anthropic Console' : 'OpenAI Dashboard'} →
                    </a>
                  </p>
                </div>
                <button
                  onClick={addApiKey}
                  disabled={loading || !apiKey}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Connecting...' : 'Analyze My Usage'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Step 3: Your Optimization Insights</h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Analyzing your AI usage patterns...</p>
                </div>
              ) : quickWin ? (
                <div className="space-y-6">
                  {quickWin.insights ? (
                    // Advanced insights view
                    <>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                        <h3 className="text-xl font-bold text-blue-800 mb-4">{quickWin.title}</h3>
                        <p className="text-gray-700 mb-4">{quickWin.description}</p>
                        
                        <div className="bg-white p-4 rounded-lg mb-4">
                          <p className="text-sm text-gray-500">Total Savings Potential</p>
                          <p className="text-3xl font-bold text-green-600">
                            ${quickWin.totalSavings?.toLocaleString() || '0'}/month
                          </p>
                        </div>

                        {quickWin.insights.map((insight: any, idx: number) => (
                          <div key={idx} className="bg-white p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-gray-800">{insight.title}</h4>
                              <span className={`px-2 py-1 text-xs rounded ${
                                insight.implementation_effort === 'low' ? 'bg-green-100 text-green-800' :
                                insight.implementation_effort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {insight.implementation_effort} effort
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                            <div className="flex gap-4 text-sm mb-3">
                              <span className="text-green-600 font-medium">
                                Save ${insight.savings_potential.toLocaleString()}/mo
                              </span>
                              <span className="text-blue-600">
                                ROI in {insight.roi_days} days
                              </span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-xs font-medium text-gray-700 mb-2">Recommendations:</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {insight.specific_recommendations?.map((rec: string, i: number) => (
                                  <li key={i}>• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    // Basic quick win view
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                      <h3 className="text-xl font-bold text-green-800 mb-2">{quickWin.title}</h3>
                      <p className="text-gray-700 mb-4">{quickWin.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Monthly Savings</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${quickWin.monthlySavings?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Annual Savings</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${quickWin.annualSavings?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Implementation:</p>
                        <code className="block p-3 bg-gray-100 rounded text-sm">
                          {quickWin.implementation?.codeSnippet || 'model: "gpt-4o-mini"'}
                        </code>
                      </div>

                      <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="text-sm text-gray-600">
                          Confidence: {quickWin.confidencePercentage || 95}% | 
                          Risk: {quickWin.riskLevel || 'Low'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-2">How it works:</h4>
                    <ol className="space-y-2 text-sm text-blue-800">
                      <li>1. Implement the suggested change</li>
                      <li>2. We monitor your quality metrics</li>
                      <li>3. After validation, we bill 30% of proven savings</li>
                      <li>4. You keep 70% of the savings forever</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="py-12">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-yellow-800 mb-2">Upload Your Usage Data for Deep Analysis</h3>
                    <p className="text-sm text-yellow-700 mb-4">
                      Export your usage CSV from OpenAI or Anthropic dashboard to get:
                    </p>
                    <ul className="space-y-2 text-sm text-yellow-700">
                      <li>✓ Token efficiency analysis</li>
                      <li>✓ Batch processing opportunities</li>
                      <li>✓ Caching recommendations</li>
                      <li>✓ Smart routing strategies</li>
                      <li>✓ Prompt optimization tips</li>
                    </ul>
                    <div className="mt-4">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setLoading(true);
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('provider', provider);
                            
                            try {
                              const res = await fetch(`/api/customers/${customerId}/import-csv`, {
                                method: 'POST',
                                body: formData
                              });
                              
                              if (res.ok) {
                                const data = await res.json();
                                if (data.insights && data.insights.length > 0) {
                                  setQuickWin({
                                    title: 'Advanced Optimization Insights',
                                    description: `Found ${data.insights.length} optimization opportunities`,
                                    insights: data.insights,
                                    totalSavings: data.totalSavingsPotential
                                  });
                                }
                              }
                            } catch (err) {
                              console.error('Error importing CSV:', err);
                            } finally {
                              setLoading(false);
                            }
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                  <button
                    onClick={generateQuickWin}
                    className="w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Try Basic Analysis (Limited)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Questions? Email us at support@meterr.ai</p>
          <p className="mt-2">
            🔒 Privacy-first: We only analyze metadata, never your prompts
          </p>
          {customerId && (
            <button
              onClick={() => {
                setStep(1);
                setCustomerId('');
                setEmail('');
                setCompanyName('');
                setApiKey('');
                setQuickWin(null);
                setError('');
              }}
              className="mt-4 text-blue-600 hover:underline"
            >
              Start Over with Different Email
            </button>
          )}
        </div>
      </div>
    </main>
  );
}