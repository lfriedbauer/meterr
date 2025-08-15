/**
 * Deprecation Configuration
 * Simple tracking without suppression
 */

module.exports = {
  // Track deprecated components for visibility
  deprecatedComponents: {
    'toast': {
      replacement: 'sonner',
      migrationDeadline: '2025-03-01',
      documentationUrl: 'https://sonner.emilkowal.ski/docs',
      migrationEffort: 'low',
      breakingChangeVersion: '3.0.0'
    }
  },

  // Known deprecated packages (informational only)
  knownDeprecatedPackages: [
    '@supabase/auth-helpers-nextjs@0.10.0',
    '@types/flexsearch@0.7.42',
    '@types/bignumber.js@5.0.4',
    '@supabase/auth-helpers-shared@0.7.0',
    'are-we-there-yet@2.0.0',
    'boolean@3.2.0',
    'gauge@3.0.2',
    'glob@7.2.3',
    'inflight@1.0.6',
    'lodash.get@4.4.2',
    'node-domexception@1.0.0',
    'npmlog@5.0.1',
    'rimraf@2.7.1',
    'rimraf@3.0.2'
  ],

  // Migration status tracking
  migrations: {
    'toast-to-sonner': {
      status: 'planning',
      filesAffected: [], // Populate with: git grep -l "from '@/components/ui/toast'"
      estimatedEffort: '2-4 hours',
      priority: 'medium',
      owner: null,
      trackingIssue: null
    }
  },

  // Reporting configuration
  reporting: {
    outputPath: 'tools/enforcement/reports/deprecation-status.md',
    updateFrequency: 'weekly',
    includeMetrics: true,
    slackChannel: '#eng-deprecations'
  }
};