const express = require('express');
const { register, Gauge, Counter, Histogram } = require('prom-client');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const app = express();

// Serve static files
app.use(express.static(__dirname));

// Define metrics
const flexSearchUsage = new Gauge({
  name: 'flexsearch_usage_total',
  help: 'Total FlexSearch implementations',
  labelNames: ['developer', 'team', 'feature']
});

const v0Usage = new Gauge({
  name: 'v0_generation_total',
  help: 'Total v0.dev generations',
  labelNames: ['developer', 'component_type']
});

const violations = new Counter({
  name: 'policy_violations_total',
  help: 'Total policy violations',
  labelNames: ['developer', 'violation_type', 'file']
});

const timeSaved = new Gauge({
  name: 'development_time_saved_hours',
  help: 'Hours saved through low-code practices',
  labelNames: ['team', 'tool']
});

const complianceScore = new Gauge({
  name: 'compliance_score',
  help: 'Overall compliance score (0-100)',
  labelNames: ['team']
});

const componentComplexity = new Histogram({
  name: 'component_complexity',
  help: 'Component complexity distribution',
  labelNames: ['type'],
  buckets: [5, 10, 15, 20, 25, 30, 40, 50, 100]
});

const prComplianceRate = new Gauge({
  name: 'pr_compliance_rate',
  help: 'Percentage of compliant PRs',
  labelNames: ['period']
});

// Collect metrics from file system
async function collectFileSystemMetrics() {
  try {
    // Read v0 generation stats
    const v0StatsPath = path.join(__dirname, '../.v0-stats.json');
    if (fs.existsSync(v0StatsPath)) {
      const stats = JSON.parse(fs.readFileSync(v0StatsPath, 'utf8'));
      
      // Update v0 metrics
      if (stats.topDevelopers) {
        stats.topDevelopers.forEach(dev => {
          v0Usage.set({ developer: dev.name, component_type: 'all' }, dev.count);
        });
      }
      
      if (stats.timeSaved) {
        timeSaved.set({ team: 'all', tool: 'v0dev' }, stats.timeSaved);
      }
    }
    
    // Read FlexSearch usage from codebase
    const { stdout: flexSearchCount } = await execPromise(
      'grep -r "FlexSearch\\|flexsearch\\|@flexsearch:" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" . | wc -l'
    ).catch(() => ({ stdout: '0' }));
    
    flexSearchUsage.set({ developer: 'all', team: 'all', feature: 'search' }, 
      parseInt(flexSearchCount.trim()) || 0);
    
    // Calculate time saved from FlexSearch
    const flexSearchImplementations = parseInt(flexSearchCount.trim()) || 0;
    const flexSearchTimeSaved = flexSearchImplementations * 40; // 40 hours per search feature
    timeSaved.set({ team: 'all', tool: 'flexsearch' }, flexSearchTimeSaved);
    
  } catch (error) {
    console.error('Error collecting file system metrics:', error);
  }
}

// Collect GitHub metrics (requires GITHUB_TOKEN)
async function collectGitHubMetrics() {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoName = process.env.REPO_NAME;
  
  if (!githubToken || !repoName) {
    console.log('GitHub metrics collection skipped (no token/repo configured)');
    return;
  }
  
  try {
    // This would normally make API calls to GitHub
    // For now, we'll simulate with local git commands
    
    // Count violations in recent commits
    const { stdout: recentViolations } = await execPromise(
      'git log --oneline -n 100 | grep -c "\\[violation\\]\\|\\[skip-check\\]"'
    ).catch(() => ({ stdout: '0' }));
    
    violations.inc({ 
      developer: 'team', 
      violation_type: 'commit', 
      file: 'various' 
    }, parseInt(recentViolations.trim()) || 0);
    
  } catch (error) {
    console.error('Error collecting GitHub metrics:', error);
  }
}

// Calculate overall compliance score
function calculateComplianceScore() {
  // Simplified scoring algorithm
  let score = 100;
  
  // For simplicity, we'll use hardcoded values or track them separately
  // In a real implementation, you'd query the actual metric values
  const violationCount = 0; // Will be tracked properly later
  const flexSearchCount = 10; // Example value
  const v0Count = 5; // Example value
  
  // Deduct points for violations
  score -= violationCount * 5;
  
  // Add points for tool usage
  score = Math.min(100, score + (flexSearchCount * 2) + (v0Count * 2));
  
  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  complianceScore.set({ team: 'all' }, score);
  
  return score;
}

// Collect all metrics
async function collectMetrics() {
  console.log('Collecting metrics...');
  
  await collectFileSystemMetrics();
  await collectGitHubMetrics();
  
  const score = calculateComplianceScore();
  
  // Set PR compliance rate (mock data for now)
  prComplianceRate.set({ period: 'week' }, 85);
  prComplianceRate.set({ period: 'month' }, 78);
  
  console.log(`Metrics collected. Compliance score: ${score}`);
}

// Serve dashboard HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  await collectMetrics();
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Dashboard data endpoint
app.get('/dashboard', async (req, res) => {
  await collectMetrics();
  
  // For dashboard, we'll return the current values we've set
  const dashboard = {
    complianceScore: calculateComplianceScore(),
    flexSearchImplementations: 10, // Example value
    v0Components: 5, // Example value
    totalTimeSaved: 240, // Example: 10 FlexSearch * 40 hours + 5 v0 * 4 hours
    prComplianceWeek: 85,
    prComplianceMonth: 78,
    timestamp: new Date().toISOString()
  };
  
  res.json(dashboard);
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Metrics collector running on port ${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`Dashboard data at http://localhost:${PORT}/dashboard`);
  
  // Collect metrics every 5 minutes
  setInterval(collectMetrics, 5 * 60 * 1000);
  
  // Initial collection
  collectMetrics();
});