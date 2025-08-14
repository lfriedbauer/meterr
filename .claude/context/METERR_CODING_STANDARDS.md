# METERR Code Optimization Standards - Claude Context

## MANDATORY OPTIMIZATION PATTERNS

### TypeScript Optimizations (ALWAYS APPLY)

#### Use `satisfies` for Type Safety
```typescript
// ✅ REQUIRED - preserves literal types
const config = {
  port: 3000,
  host: 'localhost'
} satisfies Config;

// ❌ FORBIDDEN - loses type information
const config = { port: 3000 } as Config;
```

#### Destructuring & Spread
```typescript
// ✅ REQUIRED - efficient destructuring
const { userId, ...metadata } = request;
const combined = { ...defaults, ...overrides };

// ❌ FORBIDDEN - manual property copying
const userId = request.userId;
const metadata = Object.assign({}, request);
```

#### Utility Types (USE THESE)
```typescript
// ALWAYS use utility types instead of manual definitions
type UserUpdate = Partial<User>;
type UserPublic = Pick<User, 'id' | 'email'>;
type UserSafe = Omit<User, 'password'>;
type Frozen = Readonly<Data>;
```

### React Performance Patterns (ENFORCE)

#### Component Memoization
```typescript
// ✅ REQUIRED for expensive components
export const ExpensiveList = memo(({ items }: Props) => {
  return items.map(item => <Item key={item.id} {...item} />);
}, (prev, next) => prev.items.length === next.items.length);

// ✅ REQUIRED for computed values
const expensiveValue = useMemo(
  () => calculateTokenCost(tokens, model),
  [tokens, model]
);
```

#### Dynamic Imports
```typescript
// ✅ REQUIRED for heavy components
const ChartComponent = dynamic(() => import('@/components/Chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});
```

#### Custom Hook Patterns
```typescript
// ✅ REQUIRED structure for custom hooks
function useTokenData(provider: string) {
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const abortController = useRef<AbortController>();
  
  const fetchData = useCallback(async () => {
    abortController.current?.abort();
    abortController.current = new AbortController();
    
    try {
      const result = await fetch(url, { 
        signal: abortController.current.signal 
      });
      setData(await result.json());
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error);
      }
    }
  }, [provider]);
  
  useEffect(() => {
    fetchData();
    return () => abortController.current?.abort();
  }, [fetchData]);
  
  return useMemo(() => ({ data, loading, refetch: fetchData }), 
    [data, loading, fetchData]
  );
}
```

### API Route Optimization (REQUIRED PATTERNS)

#### Response Helpers
```typescript
// CREATE AND USE THESE HELPERS
const apiResponse = {
  success: <T>(data: T, meta?: object) => 
    NextResponse.json({ data, meta }, { status: 200 }),
    
  error: (message: string, code: string, status = 400) =>
    NextResponse.json({ error: message, code }, { status }),
    
  unauthorized: () =>
    NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, 
      { status: 401 })
};

// USE IN ALL ROUTES
export async function POST(request: Request) {
  const auth = await withAuth(request);
  if (!auth.ok) return apiResponse.unauthorized();
  
  const validation = schema.safeParse(await request.json());
  if (!validation.success) {
    return apiResponse.error('Invalid input', 'VALIDATION_ERROR');
  }
  
  const result = await processRequest(validation.data);
  return apiResponse.success(result, { cached: false });
}
```

### Functional Programming (ENFORCE)

#### Result Type Pattern
```typescript
// ALWAYS use Result for operations that can fail
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

const Ok = <T>(value: T): Result<T> => ({ ok: true, value });
const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// USE IN ALL ASYNC OPERATIONS
async function fetchUserData(id: string): Promise<Result<User>> {
  try {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) return Err(new Error('USER_NOT_FOUND'));
    return Ok(user);
  } catch (error) {
    return Err(error);
  }
}
```

### Bundle Optimization (MANDATORY)

#### Tree Shaking
```typescript
// ✅ REQUIRED - named imports
import { calculateCost } from '@/utils/cost';

// ❌ FORBIDDEN - namespace imports
import * as cost from '@/utils/cost';
```

#### Code Splitting
```typescript
// ✅ REQUIRED for admin routes
const AdminPanel = lazy(() => import('./AdminPanel'));
```

### Database Query Optimization

#### Batch Operations
```typescript
// ✅ REQUIRED for multiple operations
const results = await db.$transaction([
  db.user.update({ where: { id }, data: userData }),
  db.token.createMany({ data: tokens })
]);
```

#### Select Only Required Fields
```typescript
// ✅ REQUIRED - specific fields
const user = await db.user.findUnique({
  where: { id },
  select: { id: true, email: true, name: true }
});
```

## ENFORCEMENT RULES

1. ALWAYS use Result types for fallible operations
2. ALWAYS memoize expensive computations
3. ALWAYS use dynamic imports for heavy components
4. ALWAYS batch database operations
5. NEVER use type assertions when satisfies works
6. NEVER import entire libraries
7. NEVER use SELECT * in queries
8. NEVER use any type

## PERFORMANCE OPTIMIZATION
See `.claude/context/METERR_PERFORMANCE_OPTIMIZATION.md` for hardware-specific patterns.

## PERFORMANCE TARGETS

- API Response: <200ms (p95)
- React Render: <16ms
- Bundle Size: <500KB
- Database Query: <50ms