'use client';

import { useEffect, useState, useCallback } from 'react';
import { socketClient } from '@/lib/socket/client';
import animejs from 'animejs';

interface Alert {
  id: string;
  type: 'spike' | 'threshold' | 'anomaly';
  message: string;
  amount: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export function useRealTimeAlerts(customerId?: string) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketClient.connect();
    socketClient.requestNotificationPermission();

    socketClient.on('socket:connected', () => {
      setIsConnected(true);
      if (customerId) {
        socketClient.subscribeToCustomer(customerId);
      }
    });

    socketClient.on('socket:disconnected', () => {
      setIsConnected(false);
    });

    socketClient.on('cost:alert', (alert: any) => {
      const newAlert: Alert = {
        id: Date.now().toString(),
        type: alert.type,
        message: alert.message,
        amount: alert.formattedAmount,
        severity: alert.severity,
        timestamp: new Date().toISOString(),
      };
      
      setAlerts(prev => [newAlert, ...prev].slice(0, 10));
      
      animateAlert(newAlert.id);
    });

    return () => {
      if (customerId) {
        socketClient.unsubscribeFromCustomer(customerId);
      }
    };
  }, [customerId]);

  const animateAlert = (alertId: string) => {
    setTimeout(() => {
      animejs({
        targets: `#alert-${alertId}`,
        translateX: [-100, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutExpo'
      });
    }, 0);
  };

  const dismissAlert = useCallback((alertId: string) => {
    animejs({
      targets: `#alert-${alertId}`,
      translateX: [0, 100],
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInExpo',
      complete: () => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
      }
    });
  }, []);

  const setThresholds = useCallback((thresholds: {
    daily?: number;
    hourly?: number;
    perRequest?: number;
  }) => {
    socketClient.setAlertThresholds(thresholds);
  }, []);

  return {
    alerts,
    isConnected,
    dismissAlert,
    setThresholds,
  };
}

export function AlertDisplay() {
  const { alerts, dismissAlert, isConnected } = useRealTimeAlerts();

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {isConnected && (
        <div className="text-xs text-green-600 mb-2">● Real-time monitoring active</div>
      )}
      
      {alerts.map(alert => (
        <div
          key={alert.id}
          id={`alert-${alert.id}`}
          className={`
            bg-white rounded-lg shadow-lg p-4 border-l-4 cursor-pointer
            ${alert.severity === 'critical' ? 'border-red-500' : ''}
            ${alert.severity === 'high' ? 'border-orange-500' : ''}
            ${alert.severity === 'medium' ? 'border-yellow-500' : ''}
            ${alert.severity === 'low' ? 'border-blue-500' : ''}
          `}
          onClick={() => dismissAlert(alert.id)}
        >
          <div className="flex items-start">
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {alert.type === 'spike' && '📈 Cost Spike'}
                {alert.type === 'threshold' && '⚠️ Threshold Alert'}
                {alert.type === 'anomaly' && '🚨 Anomaly Detected'}
              </p>
              <p className="text-gray-600 text-sm mt-1">{alert.message}</p>
              <p className="text-lg font-bold mt-1">{alert.amount}</p>
            </div>
            <button className="ml-2 text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}