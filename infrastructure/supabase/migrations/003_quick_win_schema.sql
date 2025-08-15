-- Enable pgvector extension for embedding storage
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable encryption for API keys
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  status TEXT DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'paused', 'churned')),
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CUSTOMER API KEYS (Encrypted)
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL, -- Encrypted with pgcrypto
  key_hint TEXT, -- Last 4 characters for identification
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, provider, key_name)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_customer_api_keys_lookup ON customer_api_keys(customer_id, provider, is_active);

-- =====================================================
-- USAGE PATTERNS (Metadata Only - No Prompts)
-- =====================================================
CREATE TABLE IF NOT EXISTS usage_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'openai',
  model TEXT NOT NULL,
  
  -- Metadata only - never store actual prompts
  token_count INTEGER NOT NULL,
  cost_usd DECIMAL(10, 6) NOT NULL,
  has_code_content BOOLEAN DEFAULT false,
  question_type TEXT, -- 'simple_qa', 'analysis', 'creative', 'code'
  response_time_ms INTEGER,
  
  -- Embedding vector for pattern detection
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  
  -- Clustering information
  cluster_id INTEGER,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Timestamps
  usage_timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_usage_patterns_embedding ON usage_patterns 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_usage_patterns_time ON usage_patterns(customer_id, usage_timestamp DESC);

-- =====================================================
-- OPTIMIZATION OPPORTUNITIES
-- =====================================================
CREATE TABLE IF NOT EXISTS optimization_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Optimization details
  opportunity_type TEXT NOT NULL, -- 'model_substitution', 'caching', 'batching'
  current_model TEXT NOT NULL,
  recommended_model TEXT NOT NULL,
  
  -- Financial impact
  current_monthly_cost DECIMAL(10, 2) NOT NULL,
  projected_monthly_cost DECIMAL(10, 2) NOT NULL,
  monthly_savings DECIMAL(10, 2) GENERATED ALWAYS AS (current_monthly_cost - projected_monthly_cost) STORED,
  
  -- Risk assessment
  confidence_level TEXT NOT NULL CHECK (confidence_level IN ('high', 'medium', 'low')),
  risk_score INTEGER CHECK (risk_score >= 1 AND risk_score <= 10),
  
  -- Implementation
  implementation_code TEXT,
  implementation_guide JSONB,
  
  -- Status tracking
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'presented', 'implemented', 'validated', 'rejected')),
  presented_at TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ,
  validated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for Quick Win queries
CREATE INDEX IF NOT EXISTS idx_opportunities_quick_win ON optimization_opportunities(
  customer_id, 
  confidence_level, 
  monthly_savings DESC
) WHERE status = 'identified';

-- =====================================================
-- QUICK WINS (First optimization shown to customer)
-- =====================================================
CREATE TABLE IF NOT EXISTS quick_wins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES optimization_opportunities(id),
  
  -- Quick Win details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  monthly_savings DECIMAL(10, 2) NOT NULL,
  confidence_percentage INTEGER CHECK (confidence_percentage >= 0 AND confidence_percentage <= 100),
  
  -- Customer action tracking
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  clicked_at TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ,
  
  -- Validation
  quality_maintained BOOLEAN,
  actual_savings DECIMAL(10, 2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id) -- Only one Quick Win per customer
);

-- =====================================================
-- CUSTOMER METRICS (Bring Your Own Metrics)
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Metric definition
  metric_name TEXT NOT NULL,
  metric_source TEXT NOT NULL, -- 'google_analytics', 'stripe', 'custom', etc.
  endpoint_url TEXT,
  
  -- Success criteria
  baseline_value DECIMAL(20, 4),
  acceptable_range_min DECIMAL(20, 4),
  acceptable_range_max DECIMAL(20, 4),
  
  -- Current measurements
  current_value DECIMAL(20, 4),
  last_measured_at TIMESTAMPTZ,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(customer_id, metric_name)
);

-- =====================================================
-- SAVINGS VALIDATIONS (FIXED)
-- =====================================================
CREATE TABLE IF NOT EXISTS savings_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES optimization_opportunities(id),
  
  -- Validation period
  validation_start_date DATE NOT NULL,
  validation_end_date DATE NOT NULL,
  
  -- Cost comparison
  baseline_cost DECIMAL(10, 2) NOT NULL,
  optimized_cost DECIMAL(10, 2) NOT NULL,
  actual_savings DECIMAL(10, 2) NOT NULL, -- Changed from GENERATED to regular column
  
  -- Quality metrics
  quality_metrics JSONB NOT NULL, -- Store all customer metrics
  quality_maintained BOOLEAN DEFAULT true,
  
  -- Billing (30% of savings)
  billable_amount DECIMAL(10, 2) NOT NULL, -- Changed from GENERATED to regular column
  invoice_id TEXT,
  
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'disputed', 'rejected')),
  validated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDIT LOG (For compliance and debugging)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_customer ON audit_logs(customer_id, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to encrypt API keys
CREATE OR REPLACE FUNCTION encrypt_api_key(key_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- In production, use environment variable for encryption key
  RETURN pgp_sym_encrypt(key_text, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt API keys
CREATE OR REPLACE FUNCTION decrypt_api_key(encrypted_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- In production, use environment variable for encryption key
  RETURN pgp_sym_decrypt(encrypted_text::bytea, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate cosine similarity
CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector)
RETURNS FLOAT AS $$
BEGIN
  RETURN 1 - (a <=> b);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate actual savings (for triggers)
CREATE OR REPLACE FUNCTION calculate_actual_savings()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actual_savings = NEW.baseline_cost - NEW.optimized_cost;
  NEW.billable_amount = NEW.actual_savings * 0.30;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT AND CALCULATIONS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_api_keys_updated_at BEFORE UPDATE ON customer_api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_optimization_opportunities_updated_at BEFORE UPDATE ON optimization_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_metrics_updated_at BEFORE UPDATE ON customer_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_validations_updated_at BEFORE UPDATE ON savings_validations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to calculate savings and billing amounts
CREATE TRIGGER calculate_savings_before_insert_update BEFORE INSERT OR UPDATE ON savings_validations
  FOR EACH ROW EXECUTE FUNCTION calculate_actual_savings();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON optimization_opportunities(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_validations_status ON savings_validations(customer_id, validation_status);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE customers IS 'Core customer accounts using meterr';
COMMENT ON TABLE customer_api_keys IS 'Encrypted storage of customer API keys - they own their keys';
COMMENT ON TABLE usage_patterns IS 'Metadata only - no prompts stored, only patterns and embeddings';
COMMENT ON TABLE optimization_opportunities IS 'Identified cost savings opportunities';
COMMENT ON TABLE quick_wins IS 'First optimization shown to prove value quickly';
COMMENT ON TABLE customer_metrics IS 'Customer-defined success metrics (Bring Your Own Metrics)';
COMMENT ON TABLE savings_validations IS 'Validated savings for billing (30% of proven savings)';
COMMENT ON TABLE audit_logs IS 'Compliance and debugging audit trail';

COMMENT ON COLUMN usage_patterns.embedding IS 'OpenAI text-embedding-3-small vectors (1536 dimensions)';
COMMENT ON COLUMN customer_api_keys.encrypted_key IS 'Customer API key encrypted with pgcrypto';
COMMENT ON COLUMN savings_validations.billable_amount IS '30% of actual savings (our fee) - calculated via trigger';