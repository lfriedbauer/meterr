'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, Time } from 'lightweight-charts';
import { BigNumber } from 'bignumber.js';

interface FinancialChartProps {
  data: Array<{
    time: string;
    value: number;
  }>;
  type?: 'line' | 'area' | 'histogram';
  height?: number;
}

export function FinancialChart({ 
  data, 
  type = 'area',
  height = 400 
}: FinancialChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#e0e0e0' },
        horzLines: { color: '#e0e0e0' },
      },
      timeScale: {
        borderColor: '#e0e0e0',
      },
    });

    chartRef.current = chart;

    const formattedData = data.map(item => ({
      time: item.time as Time,
      value: new BigNumber(item.value).toNumber()
    }));

    let series;
    switch (type) {
      case 'line':
        series = chart.addLineSeries({
          color: '#2962FF',
          lineWidth: 2,
        });
        break;
      case 'histogram':
        series = chart.addHistogramSeries({
          color: '#26a69a',
        });
        break;
      default:
        series = chart.addAreaSeries({
          lineColor: '#2962FF',
          topColor: 'rgba(41, 98, 255, 0.56)',
          bottomColor: 'rgba(41, 98, 255, 0.04)',
        });
    }

    series.setData(formattedData);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, type, height]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Real-Time Cost Tracking</h3>
      <div ref={chartContainerRef} />
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>High precision financial charting</span>
        <span>Updates every second</span>
      </div>
    </div>
  );
}