# METERR Security - Claude Context

## Critical Security Rules

### API Keys
- NEVER log API keys
- NEVER put keys in error messages
- NEVER commit keys to git
- ALWAYS mask keys: `sk-...xxx`
- ALWAYS encrypt before storage

### Code Patterns

```typescript
// Mask API keys
function maskKey(key: string): string {
  return `${key.slice(0,6)}...${key.slice(-4)}`;
}

// Validate all inputs
const schema = z.object({
  text: z.string().max(100000),
  model: z.enum(["gpt-4", "claude-3"])
});

// Parameterized queries
db.query("SELECT * FROM users WHERE id = $1", [userId]);
```

## Security Checklist

### Every Commit
- [ ] No hardcoded secrets
- [ ] No sensitive data in logs
- [ ] Input validation present
- [ ] Error messages sanitized

### API Routes Must Have
- [ ] Authentication check
- [ ] Input validation (Zod)
- [ ] Rate limiting
- [ ] Error handling

## Environment Variables

```bash
# Required in .env.local
DATABASE_URL=
ENCRYPTION_KEY=
SUPABASE_SERVICE_KEY=

# NEVER commit .env.local
```

## Row-Level Security

```sql
-- Every table needs RLS
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation"
ON token_usage
USING (org_id = auth.jwt() ->> 'org_id');
```

## Common Vulnerabilities

1. **API key in URL**: Use headers instead
2. **SQL injection**: Use parameterized queries
3. **XSS**: Never use dangerouslySetInnerHTML
4. **Secrets in git**: Check .gitignore

## Security Commands

```bash
pnpm audit         # Check vulnerabilities
pnpm audit fix     # Fix issues
pnpm test:security # Security tests
```

## Incident Response

Key leaked:
1. Revoke immediately
2. Notify customer
3. Fix vulnerability
4. Audit for others

---

*Security implementation reference for meterr.ai*