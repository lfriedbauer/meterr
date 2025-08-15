-- =====================================================
-- Vector Similarity Search Functions
-- =====================================================

-- Function to find similar usage patterns using cosine similarity
CREATE OR REPLACE FUNCTION match_usage_patterns(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  customer_id uuid
)
RETURNS TABLE (
  id uuid,
  model text,
  token_count int,
  cost_usd decimal,
  question_type text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.id,
    up.model,
    up.token_count,
    up.cost_usd,
    up.question_type,
    1 - (up.embedding <=> query_embedding) AS similarity
  FROM usage_patterns up
  WHERE 
    up.customer_id = match_usage_patterns.customer_id
    AND up.embedding IS NOT NULL
    AND 1 - (up.embedding <=> query_embedding) > match_threshold
  ORDER BY up.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get cluster statistics
CREATE OR REPLACE FUNCTION get_cluster_stats(customer_id uuid)
RETURNS TABLE (
  cluster_id int,
  pattern_count bigint,
  total_cost decimal,
  total_tokens bigint,
  avg_tokens decimal,
  dominant_model text,
  dominant_question_type text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.cluster_id,
    COUNT(*) as pattern_count,
    SUM(up.cost_usd) as total_cost,
    SUM(up.token_count) as total_tokens,
    AVG(up.token_count) as avg_tokens,
    MODE() WITHIN GROUP (ORDER BY up.model) as dominant_model,
    MODE() WITHIN GROUP (ORDER BY up.question_type) as dominant_question_type
  FROM usage_patterns up
  WHERE 
    up.customer_id = get_cluster_stats.customer_id
    AND up.cluster_id IS NOT NULL
  GROUP BY up.cluster_id
  ORDER BY total_cost DESC;
END;
$$;

-- Function to find optimization candidates
CREATE OR REPLACE FUNCTION find_optimization_candidates(
  customer_id uuid,
  min_monthly_savings decimal DEFAULT 100
)
RETURNS TABLE (
  current_model text,
  recommended_model text,
  pattern_count bigint,
  current_monthly_cost decimal,
  projected_monthly_cost decimal,
  monthly_savings decimal,
  confidence_level text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH pattern_summary AS (
    SELECT
      model,
      question_type,
      COUNT(*) as pattern_count,
      SUM(cost_usd) * 30 as monthly_cost, -- Approximate monthly
      AVG(token_count) as avg_tokens,
      AVG(confidence_score) as avg_confidence
    FROM usage_patterns
    WHERE 
      customer_id = find_optimization_candidates.customer_id
      AND usage_timestamp > NOW() - INTERVAL '30 days'
    GROUP BY model, question_type
  ),
  optimization_opportunities AS (
    SELECT
      ps.model as current_model,
      CASE
        WHEN ps.model = 'gpt-4' AND ps.question_type = 'simple_qa' AND ps.avg_tokens < 500 
          THEN 'gpt-4o-mini'
        WHEN ps.model = 'gpt-4' AND ps.question_type IN ('simple_qa', 'analysis') AND ps.avg_tokens < 1000
          THEN 'gpt-3.5-turbo'
        WHEN ps.model = 'gpt-3.5-turbo' AND ps.avg_tokens < 200
          THEN 'gpt-4o-mini'
        ELSE NULL
      END as recommended_model,
      ps.pattern_count,
      ps.monthly_cost as current_monthly_cost,
      CASE
        WHEN ps.model = 'gpt-4' AND ps.question_type = 'simple_qa' AND ps.avg_tokens < 500 
          THEN ps.monthly_cost * 0.005 -- gpt-4o-mini is ~0.5% of gpt-4 cost
        WHEN ps.model = 'gpt-4' AND ps.question_type IN ('simple_qa', 'analysis') AND ps.avg_tokens < 1000
          THEN ps.monthly_cost * 0.033 -- gpt-3.5-turbo is ~3.3% of gpt-4 cost
        WHEN ps.model = 'gpt-3.5-turbo' AND ps.avg_tokens < 200
          THEN ps.monthly_cost * 0.15 -- gpt-4o-mini is ~15% of gpt-3.5-turbo cost
        ELSE ps.monthly_cost
      END as projected_monthly_cost,
      CASE
        WHEN ps.avg_confidence > 0.9 THEN 'high'
        WHEN ps.avg_confidence > 0.7 THEN 'medium'
        ELSE 'low'
      END as confidence_level
    FROM pattern_summary ps
  )
  SELECT
    oo.current_model,
    oo.recommended_model,
    oo.pattern_count,
    oo.current_monthly_cost,
    oo.projected_monthly_cost,
    (oo.current_monthly_cost - oo.projected_monthly_cost) as monthly_savings,
    oo.confidence_level
  FROM optimization_opportunities oo
  WHERE 
    oo.recommended_model IS NOT NULL
    AND (oo.current_monthly_cost - oo.projected_monthly_cost) >= min_monthly_savings
  ORDER BY (oo.current_monthly_cost - oo.projected_monthly_cost) DESC;
END;
$$;

-- Index for faster vector searches
CREATE INDEX IF NOT EXISTS idx_usage_patterns_embedding_ops 
ON usage_patterns 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION match_usage_patterns TO authenticated;
GRANT EXECUTE ON FUNCTION get_cluster_stats TO authenticated;
GRANT EXECUTE ON FUNCTION find_optimization_candidates TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION match_usage_patterns IS 'Find similar usage patterns using cosine similarity on embeddings';
COMMENT ON FUNCTION get_cluster_stats IS 'Get statistics for clustered usage patterns';
COMMENT ON FUNCTION find_optimization_candidates IS 'Find model substitution opportunities with savings potential';