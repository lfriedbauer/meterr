# METERR Performance & Hardware Optimization - Claude Context

## DEVELOPMENT ENVIRONMENT
- CPU: AMD Ryzen 9 9950X (32 threads)
- GPU: NVIDIA RTX 5070 Ti (16GB VRAM, CUDA 13.0)
- RAM: 256GB DDR5
- OS: Windows 11 Pro

## MANDATORY PERFORMANCE PATTERNS

### PARALLEL PROCESSING (USE ALL 32 THREADS)

#### Build & Test Commands
```json
// ALWAYS use these in package.json
{
  "scripts": {
    "build": "turbo build --concurrency=32",
    "test": "jest --maxWorkers=32",
    "test:watch": "jest --watch --maxWorkers=32",
    "lint": "eslint . --parallel --cache",
    "typecheck": "tsc --build --incremental",
    "dev": "next dev --turbo"
  }
}
```

#### Jest Configuration
```javascript
// jest.config.js - REQUIRED
module.exports = {
  maxWorkers: 32,
  workerThreads: true,
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  coverageProvider: 'v8',
  testTimeout: 30000,
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: {
        incremental: true
      }
    }
  }
};
```

#### Worker Thread Pool for Heavy Operations
```typescript
// REQUIRED for CPU-intensive operations
import { Worker } from 'worker_threads';
import os from 'os';

const WORKER_POOL_SIZE = 32;

class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{ task: unknown; resolve: Function; reject: Function }> = [];
  private activeWorkers = 0;
  
  constructor(workerScript: string) {
    for (let i = 0; i < WORKER_POOL_SIZE; i++) {
      const worker = new Worker(workerScript);
      worker.on('message', (result) => this.handleResult(worker, result));
      worker.on('error', (error) => this.handleError(worker, error));
      this.workers.push(worker);
    }
  }
  
  async execute<T>(task: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processQueue();
    });
  }
  
  async processBatch<T>(items: T[], processor: (item: T) => Promise<any>): Promise<any[]> {
    const chunkSize = Math.ceil(items.length / 32);
    const chunks = Array.from({ length: 32 }, (_, i) => 
      items.slice(i * chunkSize, (i + 1) * chunkSize)
    );
    
    return Promise.all(chunks.map(chunk => 
      this.execute({ type: 'PROCESS_CHUNK', data: chunk })
    ));
  }
}

// USE FOR: Token processing, data transformation, file parsing
const workerPool = new WorkerPool('./workers/processor.js');
```

### GPU ACCELERATION (RTX 5070 Ti with CUDA)

#### Token Processing with GPU
```typescript
// REQUIRED for token counting operations
const GPU_CONFIG = {
  device: 0, // RTX 5070 Ti
  memoryPool: 16 * 1024 * 1024 * 1024, // 16GB VRAM
  batchSize: 10000, // Process 10k tokens at once
  tensorCores: true,
  fp16: true // Use half precision for 2x speed
};

// For large token batches
async function processTokensGPU(texts: string[]): Promise<number[]> {
  if (texts.length < 100) {
    // Use CPU for small batches
    return processTokensCPU(texts);
  }
  
  // Use GPU for large batches
  const batches = [];
  for (let i = 0; i < texts.length; i += GPU_CONFIG.batchSize) {
    batches.push(texts.slice(i, i + GPU_CONFIG.batchSize));
  }
  
  return Promise.all(batches.map(batch => 
    gpuTokenizer.process(batch)
  ));
}
```

### MEMORY OPTIMIZATION (256GB RAM)

#### Aggressive Caching Strategy
```typescript
// REQUIRED: Use available RAM for caching
const CACHE_CONFIG = {
  maxSize: 50 * 1024 * 1024 * 1024, // 50GB cache
  ttl: 3600000, // 1 hour TTL
  checkPeriod: 600000 // Check every 10 minutes
};

class MegaCache {
  private cache = new Map<string, { data: unknown; size: number; timestamp: number }>();
  private totalSize = 0;
  
  set(key: string, value: unknown): void {
    const size = this.getObjectSize(value);
    
    // With 256GB RAM, we rarely need to evict
    if (this.totalSize + size > CACHE_CONFIG.maxSize) {
      this.evictLRU(); // Only if necessary
    }
    
    this.cache.set(key, {
      data: value,
      size,
      timestamp: Date.now()
    });
    
    this.totalSize += size;
  }
  
  // Preload entire datasets
  async preloadAll(): Promise<void> {
    const datasets = ['users', 'tokens', 'transactions'];
    await Promise.all(datasets.map(async (name) => {
      const data = await db[name].findMany();
      this.set(`dataset:${name}`, data);
    }));
  }
}

const megaCache = new MegaCache();
```

#### Development Database Configuration
```typescript
// REQUIRED for development - use in-memory when possible
import Database from 'better-sqlite3';

const DEV_DB_CONFIG = {
  memory: true, // Use RAM for database
  readonly: false,
  timeout: 5000,
  verbose: process.env.DEBUG ? logger.debug : null
};

// For development: entire DB in memory
const db = process.env.NODE_ENV === 'development' 
  ? new Database(':memory:', DEV_DB_CONFIG)
  : new Database('./data.db');
```

### BUILD & COMPILATION OPTIMIZATION

#### Next.js Configuration
```javascript
// next.config.js - REQUIRED
module.exports = {
  experimental: {
    cpus: 32, // Use all CPU cores
    workerThreads: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
    optimizeCss: true,
    turbo: {
      resolveAlias: {
        underscore: 'lodash',
        mocha: { browser: 'mocha/browser-entry.js' }
      }
    }
  },
  
  webpack: (config, { isServer }) => {
    // Parallel processing
    config.parallelism = 32;
    
    // Massive cache for fast rebuilds
    config.cache = {
      type: 'filesystem',
      allowCollectingMemory: true,
      memoryCacheSize: 4 * 1024 * 1024 * 1024, // 4GB
      compression: false, // No compression (we have the RAM)
      hashAlgorithm: 'xxhash64', // Faster hashing
      idleTimeout: 60000,
      idleTimeoutForInitialStore: 0,
      maxMemoryGenerations: 1
    };
    
    // Split chunks optimally
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxAsyncRequests: 32,
        maxInitialRequests: 32,
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2
          }
        }
      }
    };
    
    return config;
  }
};
```

#### TypeScript Configuration
```json
// tsconfig.json - REQUIRED optimizations
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "assumeChangesOnlyAffectDirectDependencies": true
  }
}
```

### DATABASE CONNECTION OPTIMIZATION

```typescript
// REQUIRED: Maximum connections for your hardware
import { Pool } from 'pg';

const dbPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // Optimization for your hardware
  max: 100, // 100 connections
  min: 20, // Keep 20 always ready
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  
  // PostgreSQL optimizations
  statement_timeout: 30000,
  query_timeout: 30000,
  application_name: 'meterr',
  
  // Parallel query execution
  options: '-c max_parallel_workers_per_gather=16 -c max_parallel_workers=32'
});

// REQUIRED: Bulk operations with BigNumber for costs
import { BigNumber } from 'bignumber.js';

async function bulkInsertTokens(tokens: Token[]): Promise<void> {
  const BATCH_SIZE = 10000; // Large batches with your RAM
  
  const batches = [];
  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    batches.push(tokens.slice(i, i + BATCH_SIZE));
  }
  
  // Insert all batches in parallel
  await Promise.all(batches.map(batch => 
    dbPool.query(
      `INSERT INTO tokens (id, user_id, count, cost) 
       VALUES ${batch.map(() => '($1, $2, $3, $4)').join(',')}`,
      batch.flatMap(t => [t.id, t.userId, t.count, new BigNumber(t.cost).toFixed(6)])
    )
  ));
}
```

### DEVELOPMENT WORKFLOW OPTIMIZATION

#### VS Code Settings
```json
// .vscode/settings.json - REQUIRED
{
  "typescript.tsserver.maxTsServerMemory": 16384,
  "typescript.tsserver.experimental.enableProjectDiagnostics": true,
  "typescript.tsserver.useSyntaxServer": "auto",
  "files.watcherExclude": {
    "**/node_modules/**": false // Watch everything with 256GB RAM
  },
  "search.maxResults": null,
  "terminal.integrated.env.windows": {
    "NODE_OPTIONS": "--max-old-space-size=32768"
  }
}
```

#### Environment Variables
```bash
# .env.local - REQUIRED for development
NODE_OPTIONS="--max-old-space-size=32768 --max-semi-space-size=512"
UV_THREADPOOL_SIZE=32
FORCE_COLOR=1
NEXT_TELEMETRY_DISABLED=1
```

## PERFORMANCE TARGETS (YOUR HARDWARE)

| Operation | Target | Measurement Method |
|-----------|--------|-------------------|
| Full build | <10 seconds | `time pnpm build` |
| Test suite | <5 seconds | `time pnpm test` |
| Hot reload | <100ms | Browser DevTools |
| Token processing | 1M tokens/sec | GPU benchmark |
| DB query | <5ms | Query profiler |
| API response | <10ms | Response headers |

## MONITORING COMMANDS

```bash
# Monitor CPU usage
wmic cpu get loadpercentage /value

# Monitor memory usage
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value

# Monitor GPU usage
nvidia-smi -l 1

# Monitor build performance
pnpm build --profile

# Monitor test performance
pnpm test --verbose --detectOpenHandles
```

## CRITICAL RULES

1. ALWAYS use --maxWorkers=32 for Jest
2. ALWAYS use --concurrency=32 for Turbo
3. ALWAYS batch database operations (10K+ records)
4. ALWAYS use GPU for token batches >100
5. NEVER limit cache size below 1GB
6. NEVER use synchronous file operations
7. NEVER process large arrays serially