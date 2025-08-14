"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Zap
} from "lucide-react";

interface MetricCard {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  color: string;
}

interface DepartmentROI {
  name: string;
  aiSpend: number;
  businessValue: number;
  roi: number;
  trend: "up" | "down" | "stable";
}

export default function ProfitabilityDashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  
  // Mock data - in production, this would come from API
  const metrics: MetricCard[] = [
    {
      title: "AI ROI",
      value: "247%",
      change: 23,
      changeLabel: "vs last month",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Cost per Outcome",
      value: "$0.42",
      change: -15,
      changeLabel: "improvement",
      icon: Target,
      color: "text-blue-600"
    },
    {
      title: "Monthly AI Spend",
      value: "$8,432",
      change: 12,
      changeLabel: "increase",
      icon: DollarSign,
      color: "text-purple-600"
    },
    {
      title: "Optimization Savings",
      value: "$2,156",
      change: 31,
      changeLabel: "this month",
      icon: Zap,
      color: "text-orange-600"
    }
  ];

  const departments: DepartmentROI[] = [
    {
      name: "Customer Support",
      aiSpend: 3200,
      businessValue: 12800,
      roi: 300,
      trend: "up"
    },
    {
      name: "Marketing",
      aiSpend: 2100,
      businessValue: 4620,
      roi: 120,
      trend: "stable"
    },
    {
      name: "Sales",
      aiSpend: 1800,
      businessValue: 5400,
      roi: 200,
      trend: "up"
    },
    {
      name: "Engineering",
      aiSpend: 1332,
      businessValue: 2664,
      roi: 100,
      trend: "down"
    }
  ];

  const insights = [
    {
      type: "success",
      message: "Customer Support achieved 300% ROI on AI investments this month",
      action: "View Details"
    },
    {
      type: "warning",
      message: "Marketing approaching monthly AI budget limit (85% consumed)",
      action: "Adjust Budget"
    },
    {
      type: "info",
      message: "Switching to Claude Haiku for simple queries could save $450/month",
      action: "Enable Optimization"
    }
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
                  AI Profitability Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Your AI CFO - Maximizing returns on AI investments
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last Quarter</option>
                </select>
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {metric.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {metric.change > 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(metric.change)}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      {metric.changeLabel}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-700 ${metric.color}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Department ROI Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Department ROI Analysis
            </h2>
            <div className="space-y-4">
              {departments.map((dept, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {dept.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-2xl font-bold ${
                        dept.roi >= 200 ? 'text-green-600' : 
                        dept.roi >= 100 ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                        {dept.roi}% ROI
                      </span>
                      {dept.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500 ml-2" />}
                      {dept.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500 ml-2" />}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      AI Spend: ${dept.aiSpend.toLocaleString()}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Business Value: ${dept.businessValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        dept.roi >= 200 ? 'bg-green-600' : 
                        dept.roi >= 100 ? 'bg-blue-600' : 'bg-orange-600'
                      }`}
                      style={{ width: `${Math.min(dept.roi / 4, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Intelligence Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              AI Intelligence
            </h2>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                    insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-start">
                    {insight.type === 'warning' && (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm ${
                        insight.type === 'success' ? 'text-green-800 dark:text-green-200' :
                        insight.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                        'text-blue-800 dark:text-blue-200'
                      }`}>
                        {insight.message}
                      </p>
                      <button className={`text-sm font-medium mt-2 ${
                        insight.type === 'success' ? 'text-green-700 dark:text-green-400' :
                        insight.type === 'warning' ? 'text-yellow-700 dark:text-yellow-400' :
                        'text-blue-700 dark:text-blue-400'
                      } hover:underline`}>
                        {insight.action} →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cost Optimization Recommendations */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Optimization Opportunity Detected
              </h2>
              <p className="text-green-100">
                Enable smart routing to automatically save $2,156/month without impacting quality
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-300 rounded-full mr-2"></div>
                  <span className="text-sm">Route simple queries to Claude Haiku (save 73%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-300 rounded-full mr-2"></div>
                  <span className="text-sm">Use GPT-3.5 for summaries (save 85%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-300 rounded-full mr-2"></div>
                  <span className="text-sm">Batch similar requests (save 40%)</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold">$2,156</p>
              <p className="text-green-200">Potential Monthly Savings</p>
              <button className="mt-4 px-6 py-3 bg-white text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors">
                Enable Auto-Optimization
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}