/**
 * Customer API Key Management System
 *
 * Core principle: Customers own and control their API keys
 * We only store encrypted versions for their convenience
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Types
export interface CustomerApiKey {
  provider: 'openai' | 'anthropic' | 'google' | 'stripe' | 'analytics';
  keyName: string;
  apiKey: string;
}

export interface StoredApiKey {
  id: string;
  provider: string;
  keyName: string;
  keyHint: string;
  isActive: boolean;
  lastUsedAt: Date | null;
}

export interface ApiKeyValidation {
  isValid: boolean;
  error?: string;
  usage?: {
    limit: number;
    used: number;
    remaining: number;
  };
}

/**
 * API Key Manager - Handles customer API keys securely
 */
export class ApiKeyManager {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Store a customer's API key (encrypted)
   */
  async storeApiKey(
    customerId: string,
    apiKey: CustomerApiKey
  ): Promise<{ success: boolean; error?: string; keyId?: string }> {
    try {
      // Skip validation for test keys
      const isTestKey = apiKey.apiKey.startsWith('sk-test-') || apiKey.apiKey.includes('test');

      if (!isTestKey) {
        // Validate the API key first
        const validation = await this.validateApiKey(apiKey.provider, apiKey.apiKey);
        if (!validation.isValid) {
          return {
            success: false,
            error: `Invalid ${apiKey.provider} API key: ${validation.error}`,
          };
        }
      }

      // Check if key already exists for this provider and name
      const { data: existingKey } = await this.supabase
        .from('customer_api_keys')
        .select('id')
        .eq('customer_id', customerId)
        .eq('provider', apiKey.provider)
        .eq('key_name', apiKey.keyName)
        .single();

      // Generate key hint (last 4 characters)
      const keyHint = '...' + apiKey.apiKey.slice(-4);

      // Store encrypted key in database using database encryption function
      const { data: encryptedData, error: encryptError } = await this.supabase.rpc(
        'encrypt_api_key',
        { key_text: apiKey.apiKey }
      );

      if (encryptError) {
        console.error('Encryption error:', encryptError);
        return { success: false, error: 'Failed to encrypt API key' };
      }

      let data, error;

      if (existingKey) {
        // Update existing key
        const result = await this.supabase
          .from('customer_api_keys')
          .update({
            encrypted_key: encryptedData,
            key_hint: keyHint,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingKey.id)
          .select('id')
          .single();

        data = result.data;
        error = result.error;
      } else {
        // Insert new key
        const result = await this.supabase
          .from('customer_api_keys')
          .insert({
            customer_id: customerId,
            provider: apiKey.provider,
            key_name: apiKey.keyName,
            encrypted_key: encryptedData,
            key_hint: keyHint,
            is_active: true,
          })
          .select('id')
          .single();

        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error storing/updating API key:', error);
        return { success: false, error: error.message };
      }

      // Log the action for audit
      await this.logAudit(customerId, 'api_key_added', {
        provider: apiKey.provider,
        keyName: apiKey.keyName,
      });

      return { success: true, keyId: data.id };
    } catch (error) {
      console.error('Error in storeApiKey:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Retrieve a customer's API key (decrypted)
   * Note: This should only be used server-side for API calls
   */
  async getApiKey(customerId: string, provider: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('customer_api_keys')
        .select('encrypted_key')
        .eq('customer_id', customerId)
        .eq('provider', provider)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('API key not found:', error);
        return null;
      }

      // Update last used timestamp
      await this.supabase
        .from('customer_api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('customer_id', customerId)
        .eq('provider', provider);

      // Decrypt and return
      // Decrypt using database function
      const { data: decryptedKey, error: decryptError } = await this.supabase.rpc(
        'decrypt_api_key',
        { encrypted_text: data.encrypted_key }
      );

      if (decryptError) {
        throw new Error('Failed to decrypt API key');
      }

      return decryptedKey;
    } catch (error) {
      console.error('Error retrieving API key:', error);
      return null;
    }
  }

  /**
   * List all stored API keys for a customer (without decrypting)
   */
  async listApiKeys(customerId: string): Promise<StoredApiKey[]> {
    try {
      const { data, error } = await this.supabase
        .from('customer_api_keys')
        .select('id, provider, key_name, key_hint, is_active, last_used_at')
        .eq('customer_id', customerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error listing API keys:', error);
        return [];
      }

      return data.map((key) => ({
        id: key.id,
        provider: key.provider,
        keyName: key.key_name,
        keyHint: key.key_hint,
        isActive: key.is_active,
        lastUsedAt: key.last_used_at ? new Date(key.last_used_at) : null,
      }));
    } catch (error) {
      console.error('Error in listApiKeys:', error);
      return [];
    }
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(
    customerId: string,
    keyId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('customer_api_keys')
        .update({ is_active: false })
        .eq('id', keyId)
        .eq('customer_id', customerId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Log the action
      await this.logAudit(customerId, 'api_key_revoked', { keyId });

      return { success: true };
    } catch (error) {
      console.error('Error revoking API key:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate an API key by testing it
   */
  private async validateApiKey(provider: string, apiKey: string): Promise<ApiKeyValidation> {
    try {
      switch (provider) {
        case 'openai':
          return await this.validateOpenAIKey(apiKey);

        case 'anthropic':
          return await this.validateAnthropicKey(apiKey);

        case 'stripe':
          return await this.validateStripeKey(apiKey);

        case 'analytics':
          // Google Analytics, Mixpanel, etc.
          return { isValid: true }; // Simplified for now

        default:
          return { isValid: true }; // Allow unknown providers
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }

  /**
   * Validate OpenAI API key
   */
  private async validateOpenAIKey(apiKey: string): Promise<ApiKeyValidation> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { isValid: false, error: 'Invalid API key' };
        }
        return { isValid: false, error: `API error: ${response.status}` };
      }

      // Get usage if available
      const usageResponse = await fetch('https://api.openai.com/v1/usage', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (usageResponse.ok) {
        const usage = await usageResponse.json();
        return {
          isValid: true,
          usage: {
            limit: usage.limit || 0,
            used: usage.used || 0,
            remaining: usage.remaining || 0,
          },
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Validate Anthropic API key
   */
  private async validateAnthropicKey(apiKey: string): Promise<ApiKeyValidation> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      });

      // 401 means invalid key, 400 might mean valid key but bad request
      if (response.status === 401) {
        return { isValid: false, error: 'Invalid API key' };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Validate Stripe API key (read-only)
   */
  private async validateStripeKey(apiKey: string): Promise<ApiKeyValidation> {
    try {
      // Check if it's a restricted key with read-only access
      if (!apiKey.startsWith('rk_')) {
        return {
          isValid: false,
          error: 'Please provide a restricted read-only Stripe key (starts with rk_)',
        };
      }

      const response = await fetch('https://api.stripe.com/v1/balance', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (response.status === 401) {
        return { isValid: false, error: 'Invalid API key' };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Encrypt an API key
   * In production, use KMS or similar service
   */
  private async encryptKey(apiKey: string): Promise<string> {
    // This is a simplified version - use proper KMS in production
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(
      process.env.ENCRYPTION_KEY || 'default-key-change-in-production',
      'utf-8'
    );
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, crypto.scryptSync(key, 'salt', 32), iv);

    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt an API key
   */
  private async decryptKey(encryptedData: string): Promise<string> {
    try {
      const parts = encryptedData.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const algorithm = 'aes-256-gcm';
      const key = Buffer.from(
        process.env.ENCRYPTION_KEY || 'default-key-change-in-production',
        'utf-8'
      );

      const decipher = crypto.createDecipheriv(algorithm, crypto.scryptSync(key, 'salt', 32), iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt API key');
    }
  }

  /**
   * Log audit event
   */
  private async logAudit(customerId: string, action: string, metadata: any): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        customer_id: customerId,
        action,
        metadata,
        entity_type: 'api_key',
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - audit logging shouldn't break the main flow
    }
  }
}

export default ApiKeyManager;
