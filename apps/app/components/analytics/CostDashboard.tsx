'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BigNumber } from 'bignumber.js';

interface CostDataPoint {
  date: string;
  cost: number;
  tokens: number;
  model: string;
}

interface CostDashboardProps {
  data: CostDataPoint[];
  timeRange?: '24h' | '7d' | '30d';
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export function CostDashboard({ data, timeRange = '7d' }: CostDashboardProps) {
  const aggregatedData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      const date = item.date.split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, totalCost: 0, totalTokens: 0, models: {} };
      }
      acc[date].totalCost = new BigNumber(acc[date].totalCost)
        .plus(item.cost)
        .toNumber();
      acc[date].totalTokens += item.tokens;
      acc[date].models[item.model] = (acc[date].models[item.model] || 0) + item.cost;
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(grouped);
  }, [data]);

  const modelDistribution = useMemo(() => {
    const modelCosts = data.reduce((acc, item) => {
      acc[item.model] = (acc[item.model] || 0) + item.cost;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(modelCosts).map(([name, value]) => ({
      name,
      value: new BigNumber(value).toFixed(2)
    }));
  }, [data]);

  const totalCost = useMemo(() => {
    return data.reduce((sum, item) => 
      new BigNumber(sum).plus(item.cost).toNumber(), 0
    );
  }, [data]);

  const formatCurrency = (value: number) => `$${new BigNumber(value).toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="col-span-full bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">LLM Cost Overview</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Cost ({timeRange})</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalCost)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-gray-600">Avg Daily Cost</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCost / aggregatedData.length)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Tokens</p>
            <p className="text-2xl font-bold text-purple-600">
              {data.reduce((sum, item) => sum + item.tokens, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Cost Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Area 
              type="monotone" 
              dataKey="totalCost" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Model Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={modelDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {modelDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Token Usage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalTokens" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}