-- Enable pg_crypto Extension and Implement Field-Level Encryption
-- Purpose: Encrypt sensitive data like API keys and billing information

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create secure key storage table (managed by Supabase Vault)
CREATE TABLE IF NOT EXISTS vault.encryption_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_name VARCHAR(255) UNIQUE NOT NULL,
  key_value TEXT NOT NULL, -- Encrypted by Supabase Vault
  created_at TIMESTAMPTZ DEFAULT NOW(),
  rotated_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Create encryption/decryption functions
CREATE OR REPLACE FUNCTION vault.get_encryption_key()
RETURNS TEXT AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Get active encryption key from vault
  SELECT key_value INTO encryption_key
  FROM vault.encryption_keys
  WHERE key_name = 'api_key_master'
  AND is_active = true
  LIMIT 1;
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'No active encryption key found';
  END IF;
  
  RETURN encryption_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Encrypt function for API keys
CREATE OR REPLACE FUNCTION public.encrypt_api_key(plain_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    pgp_sym_encrypt(
      plain_text,
      vault.get_encryption_key(),
      'compress-algo=1, cipher-algo=aes256'
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrypt function for API keys (restricted access)
CREATE OR REPLACE FUNCTION public.decrypt_api_key(encrypted_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Only allow decryption for authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for decryption';
  END IF;
  
  RETURN pgp_sym_decrypt(
    decode(encrypted_text, 'base64'),
    vault.get_encryption_key()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add encrypted columns to existing tables
ALTER TABLE public.api_keys 
  ADD COLUMN IF NOT EXISTS key_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS key_hash_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS billing_details_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS payment_method_encrypted TEXT;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS payment_info_encrypted TEXT;

-- Migrate existing data to encrypted columns
UPDATE public.api_keys
SET 
  key_encrypted = public.encrypt_api_key(key_value),
  key_hash_encrypted = public.encrypt_api_key(key_hash)
WHERE key_encrypted IS NULL;

UPDATE public.organizations
SET 
  billing_details_encrypted = public.encrypt_api_key(billing_details::text)
WHERE billing_details IS NOT NULL 
  AND billing_details_encrypted IS NULL;

UPDATE public.users
SET 
  payment_info_encrypted = public.encrypt_api_key(payment_info::text)
WHERE payment_info IS NOT NULL 
  AND payment_info_encrypted IS NULL;

-- Create secure views for accessing encrypted data
CREATE OR REPLACE VIEW public.api_keys_secure AS
SELECT 
  id,
  user_id,
  name,
  provider,
  -- Only show last 4 characters of decrypted key
  CASE 
    WHEN auth.uid() = user_id THEN 
      '****' || RIGHT(public.decrypt_api_key(key_encrypted), 4)
    ELSE NULL
  END as key_masked,
  created_at,
  last_used,
  is_active
FROM public.api_keys;

-- Create audit log for encryption operations
CREATE TABLE IF NOT EXISTS public.encryption_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  operation VARCHAR(50) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger to log encryption/decryption operations
CREATE OR REPLACE FUNCTION log_encryption_operation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.encryption_audit_log (
    user_id,
    operation,
    table_name,
    record_id,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers
CREATE TRIGGER audit_api_keys_encryption
  AFTER INSERT OR UPDATE OF key_encrypted ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION log_encryption_operation();

-- Create key rotation function
CREATE OR REPLACE FUNCTION vault.rotate_encryption_keys()
RETURNS void AS $$
DECLARE
  new_key_id UUID;
BEGIN
  -- Generate new encryption key
  INSERT INTO vault.encryption_keys (key_name, key_value)
  VALUES ('api_key_master', gen_random_bytes(32)::text)
  RETURNING id INTO new_key_id;
  
  -- Deactivate old keys
  UPDATE vault.encryption_keys
  SET is_active = false, rotated_at = NOW()
  WHERE key_name = 'api_key_master'
  AND id != new_key_id;
  
  -- Re-encrypt all sensitive data with new key
  -- This would be done in batches in production
  UPDATE public.api_keys
  SET key_encrypted = public.encrypt_api_key(
    public.decrypt_api_key(key_encrypted)
  ),
  encryption_version = encryption_version + 1;
  
  -- Log rotation event
  INSERT INTO public.encryption_audit_log (
    operation,
    table_name,
    record_id
  ) VALUES (
    'KEY_ROTATION',
    'vault.encryption_keys',
    new_key_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule key rotation every 90 days
SELECT cron.schedule(
  'rotate-encryption-keys',
  '0 0 1 */3 *',
  'SELECT vault.rotate_encryption_keys();'
);