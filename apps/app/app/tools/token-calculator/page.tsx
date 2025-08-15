'use client';

import { useEffect, useState } from 'react';

interface ModelPricing {
  provider: string;
  model: string;
  inputPer1k: number;
  outputPer1k: number;
  subscription?: {
    name: string;
    monthly: number;
    included?: number;
  };
}

const MODEL_PRICING: ModelPricing[] = [
  {
    provider: 'OpenAI',
    model: 'GPT-4 Turbo',
    inputPer1k: 0.01,
    outputPer1k: 0.03,
    subscription: { name: 'ChatGPT Plus', monthly: 20, included: 1000000 },
  },
  {
    provider: 'OpenAI',
    model: 'GPT-3.5 Turbo',
    inputPer1k: 0.0005,
    outputPer1k: 0.0015,
    subscription: { name: 'ChatGPT Plus', monthly: 20, included: 1000000 },
  },
  {
    provider: 'Anthropic',
    model: 'Claude 3.5 Sonnet',
    inputPer1k: 0.003,
    outputPer1k: 0.015,
    subscription: { name: 'Claude Pro', monthly: 20, included: 1000000 },
  },
  {
    provider: 'Anthropic',
    model: 'Claude 3 Haiku',
    inputPer1k: 0.00025,
    outputPer1k: 0.00125,
    subscription: { name: 'Claude Pro', monthly: 20, included: 1000000 },
  },
  {
    provider: 'Google',
    model: 'Gemini 1.5 Pro',
    inputPer1k: 0.00125,
    outputPer1k: 0.005,
    subscription: { name: 'Gemini Advanced', monthly: 20, included: 1000000 },
  },
  {
    provider: 'Google',
    model: 'Gemini 1.5 Flash',
    inputPer1k: 0.000075,
    outputPer1k: 0.0003,
    subscription: { name: 'Gemini Advanced', monthly: 20, included: 1000000 },
  },
];

// Simple token estimation (4 chars ≈ 1 token)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export default function TokenCalculator() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [monthlyUsage, setMonthlyUsage] = useState(1000);
  const [selectedModels, setSelectedModels] = useState<string[]>([
    'GPT-4 Turbo',
    'Claude 3.5 Sonnet',
  ]);
  const [calculations, setCalculations] = useState<
    Array<{
      provider: string;
      model: string;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      singleCallCost: string;
      monthlyCost: string;
      subscriptionCost: number;
      savings: string;
      percentSaved: string;
      recommendation: string;
    }>
  >([]);

  useEffect(() => {
    if (inputText || outputText) {
      calculateCosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, outputText, monthlyUsage, selectedModels]);

  const calculateCosts = () => {
    const inputTokens = estimateTokens(inputText);
    const outputTokens = estimateTokens(outputText);

    const results = MODEL_PRICING.filter((model) => selectedModels.includes(model.model)).map(
      (model) => {
        const singleCallCost =
          (inputTokens / 1000) * model.inputPer1k + (outputTokens / 1000) * model.outputPer1k;

        const monthlyCost = singleCallCost * monthlyUsage;
        const subscriptionCost = model.subscription?.monthly || 0;
        const savings = subscriptionCost > monthlyCost ? 0 : monthlyCost - subscriptionCost;
        const percentSaved =
          subscriptionCost > 0 ? ((savings / subscriptionCost) * 100).toFixed(1) : '0';

        return {
          provider: model.provider,
          model: model.model,
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          singleCallCost: singleCallCost.toFixed(4),
          monthlyCost: monthlyCost.toFixed(2),
          subscriptionCost,
          savings: savings.toFixed(2),
          percentSaved,
          recommendation:
            monthlyCost < subscriptionCost
              ? 'Use API (Save $' + savings.toFixed(2) + '/mo)'
              : 'Use Subscription (Cheaper)',
        };
      }
    );

    setCalculations(results);
  };

  const toggleModel = (modelName: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelName) ? prev.filter((m) => m !== modelName) : [...prev, modelName]
    );
  };

  const getBestOption = () => {
    if (calculations.length === 0) return null;
    return calculations.reduce((best, current) =>
      parseFloat(current.monthlyCost) < parseFloat(best.monthlyCost) ? current : best
    );
  };

  const getTotalSavings = () => {
    return calculations.reduce((total, calc) => total + parseFloat(calc.savings), 0).toFixed(2);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          AI Token Calculator & Cost Optimizer
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          Calculate token usage and compare costs across AI providers. Find the most cost-effective
          model for your needs.
        </p>
      </div>

      {/* Input Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Input Prompt
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your prompt here..."
            style={{
              width: '100%',
              height: '200px',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
            }}
          />
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#64748b' }}>
            Estimated tokens: {estimateTokens(inputText)}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Expected Output (estimate)
          </label>
          <textarea
            value={outputText}
            onChange={(e) => setOutputText(e.target.value)}
            placeholder="Estimate output length..."
            style={{
              width: '100%',
              height: '200px',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
            }}
          />
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#64748b' }}>
            Estimated tokens: {estimateTokens(outputText)}
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div
        style={{
          marginBottom: '32px',
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '8px',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Monthly API Calls
          </label>
          <input
            type="number"
            value={monthlyUsage}
            onChange={(e) => setMonthlyUsage(parseInt(e.target.value) || 0)}
            style={{
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              width: '150px',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Compare Models
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {MODEL_PRICING.map((model) => (
              <button
                key={model.model}
                onClick={() => toggleModel(model.model)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: selectedModels.includes(model.model) ? '#0f172a' : 'white',
                  color: selectedModels.includes(model.model) ? 'white' : '#0f172a',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {model.model}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {calculations.length > 0 && (
        <>
          <div
            style={{
              marginBottom: '32px',
              padding: '20px',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              borderRadius: '8px',
              border: '1px solid #86efac',
            }}
          >
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#14532d',
              }}
            >
              💰 Cost Analysis Summary
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <div style={{ background: 'white', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  Best Option
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>{getBestOption()?.model}</div>
                <div style={{ fontSize: '14px', color: '#16a34a' }}>
                  ${getBestOption()?.monthlyCost}/mo
                </div>
              </div>
              <div style={{ background: 'white', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  Total Monthly Savings
                </div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#16a34a' }}>
                  ${getTotalSavings()}
                </div>
              </div>
              <div style={{ background: 'white', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  Tokens per Call
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  {estimateTokens(inputText) + estimateTokens(outputText)}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                    }}
                  >
                    MODEL
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                    }}
                  >
                    TOKENS
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                    }}
                  >
                    COST/CALL
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                    }}
                  >
                    MONTHLY (API)
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                    }}
                  >
                    SUBSCRIPTION
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                    }}
                  >
                    SAVINGS
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                    }}
                  >
                    RECOMMENDATION
                  </th>
                </tr>
              </thead>
              <tbody>
                {calculations.map((calc, index) => (
                  <tr key={index} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', fontSize: '14px' }}>
                      <div style={{ fontWeight: '500' }}>{calc.model}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{calc.provider}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>{calc.totalTokens}</td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>${calc.singleCallCost}</td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600' }}>
                      ${calc.monthlyCost}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>${calc.subscriptionCost}</td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>
                      <span style={{ color: '#16a34a', fontWeight: '500' }}>
                        ${calc.savings} ({calc.percentSaved}%)
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: calc.recommendation.includes('Save') ? '#d1fae5' : '#f3f4f6',
                          color: calc.recommendation.includes('Save') ? '#065f46' : '#374151',
                          fontWeight: '500',
                        }}
                      >
                        {calc.recommendation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Export Button */}
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button
              style={{
                padding: '10px 20px',
                background: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Export to CSV
            </button>
            <button
              style={{
                padding: '10px 20px',
                background: 'white',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Share Analysis
            </button>
          </div>
        </>
      )}
    </div>
  );
}
