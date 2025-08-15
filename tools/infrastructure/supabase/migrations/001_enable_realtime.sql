-- Enable Realtime Publications for Cost Tracking Tables
-- Purpose: Enable real-time updates for dashboards and alerts

-- Create publication for real-time cost updates
CREATE PUBLICATION meterr_realtime FOR TABLE
  public.token_usage,
  public.api_costs,
  public.alerts,
  public.budgets,
  public.organizations,
  public.team_members;

-- Enable Realtime for specific tables
ALTER PUBLICATION meterr_realtime ADD TABLE public.token_usage;
ALTER PUBLICATION meterr_realtime ADD TABLE public.api_costs;
ALTER PUBLICATION meterr_realtime ADD TABLE public.alerts;
ALTER PUBLICATION meterr_realtime ADD TABLE public.budgets;

-- Create optimized indexes for real-time queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_token_usage_user_timestamp 
  ON public.token_usage(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_costs_org_timestamp 
  ON public.api_costs(organization_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alerts_user_status 
  ON public.alerts(user_id, status, created_at DESC);

-- Create materialized view for real-time cost aggregations
CREATE MATERIALIZED VIEW IF NOT EXISTS realtime_cost_summary AS
SELECT 
  u.id as user_id,
  u.email,
  o.id as org_id,
  o.name as org_name,
  DATE_TRUNC('hour', tu.created_at) as hour,
  SUM(tu.input_tokens + tu.output_tokens) as total_tokens,
  SUM(tu.cost_usd) as total_cost,
  COUNT(*) as request_count,
  AVG(tu.latency_ms) as avg_latency
FROM public.users u
JOIN public.organizations o ON u.organization_id = o.id
JOIN public.token_usage tu ON u.id = tu.user_id
WHERE tu.created_at > NOW() - INTERVAL '24 hours'
GROUP BY u.id, u.email, o.id, o.name, DATE_TRUNC('hour', tu.created_at);

-- Create refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_cost_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY realtime_cost_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule automatic refresh every 5 minutes
SELECT cron.schedule(
  'refresh-cost-summary',
  '*/5 * * * *',
  'SELECT refresh_cost_summary();'
);

-- Enable Realtime RLS policies
ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for real-time subscriptions
CREATE POLICY "Users can subscribe to their own token usage"
  ON public.token_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can subscribe to their org's costs"
  ON public.api_costs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND organization_id = api_costs.organization_id
    )
  );

CREATE POLICY "Users can subscribe to their alerts"
  ON public.alerts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can subscribe to their org's budgets"
  ON public.budgets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND organization_id = budgets.organization_id
    )
  );

-- Performance optimization for real-time queries
ALTER TABLE public.token_usage SET (fillfactor = 90);
ALTER TABLE public.api_costs SET (fillfactor = 90);
VACUUM ANALYZE public.token_usage;
VACUUM ANALYZE public.api_costs;