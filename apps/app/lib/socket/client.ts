import { io, Socket } from 'socket.io-client';
import { BigNumber } from 'bignumber.js';

interface CostAlert {
  type: 'spike' | 'threshold' | 'anomaly';
  amount: number;
  model: string;
  timestamp: string;
  message: string;
}

interface UsageUpdate {
  customerId: string;
  model: string;
  tokens: number;
  cost: number;
  timestamp: string;
}

class SocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(url?: string) {
    if (this.socket?.connected) return;

    this.socket = io(url || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to real-time server');
      this.emit('socket:connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from real-time server');
      this.emit('socket:disconnected');
    });

    this.socket.on('cost-alert', (data: CostAlert) => {
      this.handleCostAlert(data);
    });

    this.socket.on('usage-update', (data: UsageUpdate) => {
      this.handleUsageUpdate(data);
    });

    this.socket.on('error', (error: any) => {
      console.error('[Socket] Error:', error);
      this.emit('socket:error', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private handleCostAlert(alert: CostAlert) {
    const formattedAmount = new BigNumber(alert.amount).toFixed(2);
    
    const notification = {
      ...alert,
      formattedAmount: `$${formattedAmount}`,
      severity: this.getAlertSeverity(alert),
    };

    this.emit('cost:alert', notification);
    
    if (Notification.permission === 'granted') {
      new Notification('Cost Alert! 💸', {
        body: alert.message || `${alert.type}: $${formattedAmount} on ${alert.model}`,
        icon: '/icon-192x192.png',
        tag: 'cost-alert',
      });
    }
  }

  private handleUsageUpdate(update: UsageUpdate) {
    const formattedCost = new BigNumber(update.cost).toFixed(6);
    
    this.emit('usage:update', {
      ...update,
      formattedCost: `$${formattedCost}`,
    });
  }

  private getAlertSeverity(alert: CostAlert): 'low' | 'medium' | 'high' | 'critical' {
    if (alert.type === 'anomaly') return 'critical';
    if (alert.type === 'spike' && alert.amount > 100) return 'high';
    if (alert.type === 'threshold' && alert.amount > 50) return 'medium';
    return 'low';
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket && event.includes(':')) {
      const [namespace, action] = event.split(':');
      if (namespace !== 'socket') {
        this.socket.on(event, callback as any);
      }
    }
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
    
    if (this.socket && event.includes(':')) {
      this.socket.off(event, callback as any);
    }
  }

  private emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  subscribeToCustomer(customerId: string) {
    if (this.socket) {
      this.socket.emit('subscribe:customer', { customerId });
    }
  }

  unsubscribeFromCustomer(customerId: string) {
    if (this.socket) {
      this.socket.emit('unsubscribe:customer', { customerId });
    }
  }

  setAlertThresholds(thresholds: {
    daily?: number;
    hourly?: number;
    perRequest?: number;
  }) {
    if (this.socket) {
      this.socket.emit('set:thresholds', thresholds);
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

export const socketClient = new SocketClient();

export function useSocket() {
  return socketClient;
}