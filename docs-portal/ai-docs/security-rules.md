# Security Rules

## Input Validation
- Validate ALL inputs with Zod
- Sanitize user content
- Limit payload sizes (<1MB)
- Reject suspicious patterns

## Authentication
- Use Supabase Auth exclusively
- Verify JWT on every request
- Check permissions per resource
- Session timeout: 24 hours

## Data Protection
- Encrypt API keys (AES-256)
- Use row-level security
- Never log sensitive data
- Hash passwords with bcrypt

## API Security
- Rate limit all endpoints
- CORS: Allow only known origins
- Use HTTPS exclusively
- Validate webhook signatures

## Code Security
- No eval() or Function()
- No user input in queries
- Use parameterized statements
- Escape HTML output

## Monitoring
- Log all auth failures
- Alert on rate limit breaches
- Track API key usage
- Monitor for anomalies