// Content script that injects network interceptor
interface APICall {
  id: string;
  timestamp: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  response?: any;
  status?: number;
  duration?: number;
}

class OpenAIAPICapture {
  private apiCalls: Map<string, APICall> = new Map();

  constructor() {
    this.injectNetworkInterceptor();
    this.setupMessageListener();
  }

  private injectNetworkInterceptor(): void {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('dist/injected.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
  }

  private setupMessageListener(): void {
    window.addEventListener('message', async (event) => {
      if (event.source !== window) return;
      
      if (event.data.type === 'OPENAI_API_REQUEST') {
        await this.handleAPIRequest(event.data.payload);
      } else if (event.data.type === 'OPENAI_API_RESPONSE') {
        await this.handleAPIResponse(event.data.payload);
      }
    });
  }

  private async handleAPIRequest(data: any): Promise<void> {
    const apiCall: APICall = {
      id: data.id,
      timestamp: Date.now(),
      url: data.url,
      method: data.method,
      headers: data.headers,
      body: data.body
    };

    this.apiCalls.set(data.id, apiCall);
    
    // Send to background script for storage
    try {
      await chrome.runtime.sendMessage({
        type: 'API_CALL_CAPTURED',
        payload: apiCall
      });
    } catch (error) {
      console.error('Failed to send API call to background:', error);
    }
  }

  private async handleAPIResponse(data: any): Promise<void> {
    const apiCall = this.apiCalls.get(data.id);
    if (!apiCall) return;

    apiCall.response = data.response;
    apiCall.status = data.status;
    apiCall.duration = Date.now() - apiCall.timestamp;

    // Update in background
    try {
      await chrome.runtime.sendMessage({
        type: 'API_CALL_UPDATED',
        payload: apiCall
      });
    } catch (error) {
      console.error('Failed to update API call:', error);
    }
  }
}

// Initialize capture when content script loads
new OpenAIAPICapture();
