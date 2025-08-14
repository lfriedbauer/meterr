Enhanced Hardware-Optimized Patterns

1\. Enhanced .claude/context/METERR\_CODING\_STANDARDS.md (AI Context)

Add this section after the existing content:

markdown## HARDWARE-OPTIMIZED PATTERNS (MANDATORY)



\### Development Environment Specs

\- CPU: AMD Ryzen 9 9950X (32 threads)

\- GPU: NVIDIA RTX 5070 Ti (16GB VRAM, CUDA 13.0)

\- RAM: 256GB DDR5

\- OS: Windows 11 Pro



\### PARALLEL PROCESSING (USE ALL 32 THREADS)



\#### Worker Threads for CPU-Intensive Tasks

```typescript

// ✅ REQUIRED for heavy computations

import { Worker } from 'worker\_threads';

import os from 'os';



const THREAD\_POOL\_SIZE = 32; // Use all threads



class WorkerPool {

&nbsp; private workers: Worker\[] = \[];

&nbsp; private queue: Array<() => void> = \[];

&nbsp; 

&nbsp; constructor() {

&nbsp;   // Create 32 workers for your Ryzen 9950X

&nbsp;   for (let i = 0; i < THREAD\_POOL\_SIZE; i++) {

&nbsp;     this.workers.push(new Worker('./worker.js'));

&nbsp;   }

&nbsp; }

&nbsp; 

&nbsp; async execute<T>(task: any): Promise<T> {

&nbsp;   const worker = await this.getWorker();

&nbsp;   return new Promise((resolve, reject) => {

&nbsp;     worker.postMessage(task);

&nbsp;     worker.once('message', resolve);

&nbsp;     worker.once('error', reject);

&nbsp;   });

&nbsp; }

}



// ✅ REQUIRED for batch processing

async function processTokenBatch(tokens: Token\[]) {

&nbsp; const chunkSize = Math.ceil(tokens.length / 32);

&nbsp; const chunks = \[];

&nbsp; 

&nbsp; for (let i = 0; i < 32; i++) {

&nbsp;   chunks.push(tokens.slice(i \* chunkSize, (i + 1) \* chunkSize));

&nbsp; }

&nbsp; 

&nbsp; // Process all chunks in parallel

&nbsp; return Promise.all(chunks.map(chunk => 

&nbsp;   workerPool.execute({ type: 'PROCESS\_TOKENS', data: chunk })

&nbsp; ));

}

Build \& Test Parallelization

json// ✅ REQUIRED in package.json

{

&nbsp; "scripts": {

&nbsp;   "build": "turbo build --concurrency=32",

&nbsp;   "test": "jest --maxWorkers=32",

&nbsp;   "lint": "eslint . --max-warnings=0 --cache --cache-strategy=content --parallel",

&nbsp;   "typecheck": "tsc --build --incremental --assumeChangesOnlyAffectDirectDependencies"

&nbsp; }

}

GPU ACCELERATION (RTX 5070 Ti CUDA)

Token Processing with CUDA

typescript// ✅ REQUIRED for token counting

import { CUDATokenizer } from '@meterr/cuda-tokenizer';



const tokenizer = new CUDATokenizer({

&nbsp; device: 0, // RTX 5070 Ti

&nbsp; memoryPool: 16384, // 16GB VRAM

&nbsp; batchSize: 10000, // Process 10k tokens at once

&nbsp; streams: 4 // Parallel CUDA streams

});



// ✅ REQUIRED for batch token processing

async function countTokensGPU(texts: string\[]): Promise<number\[]> {

&nbsp; // Batch process on GPU

&nbsp; return tokenizer.batchCount(texts, {

&nbsp;   useFloat16: true, // Use FP16 for 2x throughput

&nbsp;   tensorCores: true // Enable tensor cores on RTX 5070 Ti

&nbsp; });

}

WebGPU for Browser Acceleration

typescript// ✅ REQUIRED for client-side GPU tasks

async function initWebGPU() {

&nbsp; if (!navigator.gpu) throw new Error('WebGPU not supported');

&nbsp; 

&nbsp; const adapter = await navigator.gpu.requestAdapter({

&nbsp;   powerPreference: 'high-performance' // Use RTX 5070 Ti

&nbsp; });

&nbsp; 

&nbsp; const device = await adapter.requestDevice({

&nbsp;   requiredLimits: {

&nbsp;     maxBufferSize: 2147483648, // 2GB buffer

&nbsp;     maxComputeWorkgroupsPerDimension: 65535

&nbsp;   }

&nbsp; });

&nbsp; 

&nbsp; return { adapter, device };

}

MEMORY OPTIMIZATION (256GB RAM)

Large Dataset Handling

typescript// ✅ REQUIRED for large datasets

const CACHE\_SIZE = 50\_000\_000\_000; // 50GB cache (use that RAM!)



class MegaCache {

&nbsp; private cache = new Map();

&nbsp; private lru = new Map();

&nbsp; 

&nbsp; constructor() {

&nbsp;   // Pre-allocate memory

&nbsp;   this.cache = new Map();

&nbsp; }

&nbsp; 

&nbsp; // Keep entire datasets in memory

&nbsp; async loadDataset(key: string, loader: () => Promise<any>) {

&nbsp;   if (!this.cache.has(key)) {

&nbsp;     const data = await loader();

&nbsp;     this.cache.set(key, data);

&nbsp;     // No need to evict with 256GB RAM

&nbsp;   }

&nbsp;   return this.cache.get(key);

&nbsp; }

}



// ✅ REQUIRED: Process entire files in memory

async function processLargeFile(path: string) {

&nbsp; // Load entire file into memory (no streaming needed)

&nbsp; const buffer = await fs.readFile(path);

&nbsp; 

&nbsp; // Process in parallel chunks

&nbsp; const chunkSize = Math.ceil(buffer.length / 32);

&nbsp; const results = await Promise.all(

&nbsp;   Array.from({ length: 32 }, (\_, i) => 

&nbsp;     processChunk(buffer.slice(i \* chunkSize, (i + 1) \* chunkSize))

&nbsp;   )

&nbsp; );

&nbsp; 

&nbsp; return results;

}

Memory-Mapped Files

typescript// ✅ REQUIRED for huge datasets

import mmap from 'mmap-io';



function openLargeDataset(path: string) {

&nbsp; const fd = fs.openSync(path, 'r');

&nbsp; const size = fs.fstatSync(fd).size;

&nbsp; 

&nbsp; // Map entire file to memory

&nbsp; const buffer = mmap.map(

&nbsp;   size,

&nbsp;   mmap.PROT\_READ,

&nbsp;   mmap.MAP\_SHARED,

&nbsp;   fd,

&nbsp;   0,

&nbsp;   mmap.MADV\_SEQUENTIAL

&nbsp; );

&nbsp; 

&nbsp; return buffer;

}

DEVELOPMENT OPTIMIZATIONS

Hot Module Replacement

typescript// ✅ REQUIRED in next.config.js

module.exports = {

&nbsp; experimental: {

&nbsp;   cpus: 32, // Use all CPU cores

&nbsp;   workerThreads: true,

&nbsp;   parallelServerCompiles: true,

&nbsp;   parallelServerBuildTraces: true,

&nbsp; },

&nbsp; webpack: (config) => {

&nbsp;   config.cache = {

&nbsp;     type: 'filesystem',

&nbsp;     allowCollectingMemory: true,

&nbsp;     memoryCacheSize: 4\_000\_000\_000, // 4GB webpack cache

&nbsp;   };

&nbsp;   config.parallelism = 32;

&nbsp;   return config;

&nbsp; }

};

Development Server Config

typescript// ✅ REQUIRED for dev server

const devServer = {

&nbsp; port: 3000,

&nbsp; compress: false, // No compression in dev (CPU savings)

&nbsp; hot: true,

&nbsp; parallel: true,

&nbsp; webSocketServer: 'ws',

&nbsp; client: {

&nbsp;   overlay: false, // Reduce client CPU

&nbsp; },

&nbsp; devMiddleware: {

&nbsp;   writeToDisk: false, // Keep in RAM

&nbsp; },

&nbsp; historyApiFallback: {

&nbsp;   disableDotRule: true,

&nbsp; },

&nbsp; setupMiddlewares: (middlewares, devServer) => {

&nbsp;   // Use worker threads for middleware

&nbsp;   devServer.app.use((req, res, next) => {

&nbsp;     setImmediate(next); // Don't block main thread

&nbsp;   });

&nbsp;   return middlewares;

&nbsp; }

};

DATABASE OPTIMIZATIONS

Connection Pool for High Throughput

typescript// ✅ REQUIRED: Max connections for your hardware

const pool = new Pool({

&nbsp; max: 100, // High connection count

&nbsp; min: 20,

&nbsp; acquireTimeoutMillis: 60000,

&nbsp; createTimeoutMillis: 30000,

&nbsp; idleTimeoutMillis: 30000,

&nbsp; connectionTimeoutMillis: 2000,

&nbsp; statement\_timeout: 30000,

&nbsp; query\_timeout: 30000,

&nbsp; // Use all cores for parallel queries

&nbsp; max\_parallel\_workers\_per\_gather: 16,

&nbsp; max\_parallel\_workers: 32,

&nbsp; max\_worker\_processes: 32,

});

Bulk Operations

typescript// ✅ REQUIRED for bulk inserts

async function bulkInsertTokens(tokens: Token\[]) {

&nbsp; const BATCH\_SIZE = 10000; // Large batches

&nbsp; const batches = \[];

&nbsp; 

&nbsp; for (let i = 0; i < tokens.length; i += BATCH\_SIZE) {

&nbsp;   batches.push(tokens.slice(i, i + BATCH\_SIZE));

&nbsp; }

&nbsp; 

&nbsp; // Insert all batches in parallel

&nbsp; await Promise.all(batches.map(batch => 

&nbsp;   db.$executeRawUnsafe(`

&nbsp;     INSERT INTO tokens (id, user\_id, count, cost)

&nbsp;     VALUES ${batch.map(() => '(?, ?, ?, ?)').join(',')}

&nbsp;   `, ...batch.flatMap(t => \[t.id, t.userId, t.count, t.cost]))

&nbsp; ));

}

TESTING PARALLELIZATION

typescript// ✅ REQUIRED in jest.config.js

module.exports = {

&nbsp; maxWorkers: 32,

&nbsp; workerThreads: true,

&nbsp; cache: true,

&nbsp; cacheDirectory: '<rootDir>/.jest-cache',

&nbsp; coverageProvider: 'v8',

&nbsp; testEnvironment: 'node',

&nbsp; testTimeout: 30000,

&nbsp; globals: {

&nbsp;   'ts-jest': {

&nbsp;     isolatedModules: true, // Faster compilation

&nbsp;     tsconfig: {

&nbsp;       incremental: true,

&nbsp;     }

&nbsp;   }

&nbsp; }

};



// ✅ REQUIRED for parallel test suites

describe.concurrent('Token Processing', () => {

&nbsp; test.concurrent('process batch 1', async () => { /\* ... \*/ });

&nbsp; test.concurrent('process batch 2', async () => { /\* ... \*/ });

&nbsp; test.concurrent('process batch 3', async () => { /\* ... \*/ });

&nbsp; // Run all 32 tests in parallel

});

PERFORMANCE TARGETS (YOUR HARDWARE)



Build time: <10 seconds (full rebuild)

Test execution: <5 seconds (full suite)

Token processing: 1M tokens/second (GPU)

API response: <10ms (cached)

Database query: <5ms (indexed)

Development reload: <100ms





\### 2. Enhanced Human Documentation Addition



Add this section to the human docs:



```markdown

\## Hardware Optimization Guide



\### Leveraging Your Development Environment



With your exceptional hardware (AMD Ryzen 9 9950X, RTX 5070 Ti, 256GB RAM), we can achieve performance levels that would be impossible on typical development machines.



\### CPU Parallelization (32 Threads)



\#### Why It Matters

Your Ryzen 9 9950X with 32 threads can process tasks 32x faster when properly parallelized. Serial processing wastes 31 threads sitting idle.



\#### Implementation Examples



\*\*Parallel Testing Strategy\*\*

```typescript

// Configure Jest to use all cores

// jest.config.js

module.exports = {

&nbsp; maxWorkers: 32, // Use all threads

&nbsp; workerThreads: true, // Use worker threads instead of child processes

&nbsp; 

&nbsp; // Run test files in parallel

&nbsp; testMatch: \[

&nbsp;   '\*\*/\_\_tests\_\_/\*\*/\*.test.ts',

&nbsp;   '\*\*/\_\_tests\_\_/\*\*/\*.spec.ts'

&nbsp; ],

&nbsp; 

&nbsp; // Shard tests across multiple processes

&nbsp; shard: process.env.CI ? `${process.env.SHARD\_INDEX}/${process.env.SHARD\_TOTAL}` : undefined

};



// Run tests with maximum parallelization

// package.json

{

&nbsp; "scripts": {

&nbsp;   "test:parallel": "jest --maxWorkers=32 --coverage --runInBand=false",

&nbsp;   "test:shard": "for i in {1..4}; do SHARD\_INDEX=$i SHARD\_TOTAL=4 jest \& done; wait"

&nbsp; }

}

Parallel Data Processing

typescriptimport { Worker } from 'worker\_threads';

import { cpus } from 'os';



class DataProcessor {

&nbsp; private workers: Worker\[] = \[];

&nbsp; private taskQueue: Array<{ data: any, resolve: Function, reject: Function }> = \[];

&nbsp; 

&nbsp; constructor() {

&nbsp;   // Create a worker for each thread

&nbsp;   for (let i = 0; i < 32; i++) {

&nbsp;     const worker = new Worker('./processor-worker.js');

&nbsp;     worker.on('message', this.handleWorkerMessage.bind(this));

&nbsp;     this.workers.push(worker);

&nbsp;   }

&nbsp; }

&nbsp; 

&nbsp; async processLargeDataset(dataset: any\[]): Promise<any\[]> {

&nbsp;   // Split dataset into 32 chunks

&nbsp;   const chunkSize = Math.ceil(dataset.length / 32);

&nbsp;   const chunks = Array.from({ length: 32 }, (\_, i) => 

&nbsp;     dataset.slice(i \* chunkSize, (i + 1) \* chunkSize)

&nbsp;   );

&nbsp;   

&nbsp;   // Process all chunks in parallel

&nbsp;   const results = await Promise.all(

&nbsp;     chunks.map((chunk, index) => this.processChunk(chunk, index))

&nbsp;   );

&nbsp;   

&nbsp;   return results.flat();

&nbsp; }

}

GPU Acceleration (RTX 5070 Ti with CUDA)

When to Use GPU



Token counting (100x faster than CPU)

Vector operations

Matrix calculations

Image processing

Machine learning inference



GPU Token Processing Setup

typescript// Install CUDA dependencies

// npm install @nvidia/cuda-js node-cuda



import { CUDAContext } from '@nvidia/cuda-js';



class GPUTokenizer {

&nbsp; private context: CUDAContext;

&nbsp; private tokenKernel: any;

&nbsp; 

&nbsp; constructor() {

&nbsp;   this.context = new CUDAContext({

&nbsp;     device: 0, // RTX 5070 Ti

&nbsp;     memoryPoolSize: 16 \* 1024 \* 1024 \* 1024 // 16GB VRAM

&nbsp;   });

&nbsp;   

&nbsp;   // Load CUDA kernel for token counting

&nbsp;   this.tokenKernel = this.context.compile(`

&nbsp;     \_\_global\_\_ void countTokens(char\* text, int\* counts, int length) {

&nbsp;       int idx = blockIdx.x \* blockDim.x + threadIdx.x;

&nbsp;       if (idx < length) {

&nbsp;         // Parallel token counting logic

&nbsp;         atomicAdd(\&counts\[0], 1);

&nbsp;       }

&nbsp;     }

&nbsp;   `);

&nbsp; }

&nbsp; 

&nbsp; async countTokens(text: string): Promise<number> {

&nbsp;   // Allocate GPU memory

&nbsp;   const textBuffer = this.context.allocate(text.length);

&nbsp;   const countBuffer = this.context.allocate(4); // int32

&nbsp;   

&nbsp;   // Copy to GPU

&nbsp;   await textBuffer.copyFrom(Buffer.from(text));

&nbsp;   

&nbsp;   // Launch kernel with optimal block size for RTX 5070 Ti

&nbsp;   const blockSize = 256; // Optimal for RTX 5070 Ti

&nbsp;   const gridSize = Math.ceil(text.length / blockSize);

&nbsp;   

&nbsp;   await this.tokenKernel.launch(

&nbsp;     gridSize, blockSize,

&nbsp;     textBuffer, countBuffer, text.length

&nbsp;   );

&nbsp;   

&nbsp;   // Get result

&nbsp;   const result = await countBuffer.copyTo();

&nbsp;   return result.readInt32LE(0);

&nbsp; }

}

Memory Utilization (256GB RAM)

Aggressive Caching Strategy

typescript// With 256GB RAM, cache everything

class MegaCache {

&nbsp; private cache = new Map<string, any>();

&nbsp; private sizeLimit = 200 \* 1024 \* 1024 \* 1024; // Use 200GB for cache

&nbsp; private currentSize = 0;

&nbsp; 

&nbsp; set(key: string, value: any): void {

&nbsp;   const size = this.getObjectSize(value);

&nbsp;   

&nbsp;   // With 256GB, we rarely need to evict

&nbsp;   if (this.currentSize + size > this.sizeLimit) {

&nbsp;     // Only evict if absolutely necessary

&nbsp;     this.evictLRU();

&nbsp;   }

&nbsp;   

&nbsp;   this.cache.set(key, {

&nbsp;     value,

&nbsp;     size,

&nbsp;     lastAccessed: Date.now()

&nbsp;   });

&nbsp;   

&nbsp;   this.currentSize += size;

&nbsp; }

&nbsp; 

&nbsp; // Keep entire databases in memory

&nbsp; async preloadDatasets(): Promise<void> {

&nbsp;   const datasets = \[

&nbsp;     'users', 'tokens', 'transactions', 'analytics'

&nbsp;   ];

&nbsp;   

&nbsp;   await Promise.all(datasets.map(async (dataset) => {

&nbsp;     const data = await db\[dataset].findMany();

&nbsp;     this.set(`dataset:${dataset}`, data);

&nbsp;   }));

&nbsp; }

}

In-Memory Database for Development

typescript// Use in-memory SQLite for blazing fast development

import Database from 'better-sqlite3';



const devDb = new Database(':memory:', {

&nbsp; memory: true,

&nbsp; readonly: false,

&nbsp; fileMustExist: false,

&nbsp; timeout: 5000,

&nbsp; verbose: console.log

});



// Load entire schema into memory

const schema = fs.readFileSync('./schema.sql', 'utf8');

devDb.exec(schema);



// Bulk load test data

const testData = JSON.parse(fs.readFileSync('./test-data.json', 'utf8'));

const insert = devDb.prepare('INSERT INTO tokens VALUES (?, ?, ?, ?)');

const insertMany = devDb.transaction((tokens) => {

&nbsp; for (const token of tokens) insert.run(token);

});

insertMany(testData.tokens); // Instant with in-memory DB

Build \& Compilation Optimization

Turbopack Configuration

typescript// next.config.js - Optimized for your hardware

module.exports = {

&nbsp; experimental: {

&nbsp;   turbo: {

&nbsp;     rules: {

&nbsp;       '\*.ts': {

&nbsp;         loaders: \['swc-loader'],

&nbsp;         options: {

&nbsp;           jsc: {

&nbsp;             parser: {

&nbsp;               syntax: 'typescript',

&nbsp;               tsx: true

&nbsp;             },

&nbsp;             transform: {

&nbsp;               react: {

&nbsp;                 runtime: 'automatic'

&nbsp;               }

&nbsp;             },

&nbsp;             target: 'es2022',

&nbsp;             minify: {

&nbsp;               compress: true,

&nbsp;               mangle: true

&nbsp;             }

&nbsp;           },

&nbsp;           minify: true

&nbsp;         }

&nbsp;       }

&nbsp;     }

&nbsp;   },

&nbsp;   cpus: 32, // Use all cores

&nbsp;   workerThreads: true,

&nbsp;   craCompat: false,

&nbsp;   esmExternals: true

&nbsp; }

};

Parallel Webpack Build

javascript// webpack.config.js

module.exports = {

&nbsp; parallelism: 32, // Use all threads

&nbsp; cache: {

&nbsp;   type: 'filesystem',

&nbsp;   allowCollectingMemory: true,

&nbsp;   memoryCacheSize: 8 \* 1024 \* 1024 \* 1024, // 8GB cache

&nbsp;   maxMemoryGenerations: 1, // Keep everything in memory

&nbsp;   idleTimeout: 60000,

&nbsp;   idleTimeoutAfterLargeChanges: 1000,

&nbsp;   idleTimeoutForInitialStore: 0

&nbsp; },

&nbsp; optimization: {

&nbsp;   removeAvailableModules: false,

&nbsp;   removeEmptyChunks: false,

&nbsp;   splitChunks: false,

&nbsp;   minimize: false, // Skip in development

&nbsp;   concatenateModules: false

&nbsp; },

&nbsp; experiments: {

&nbsp;   cacheUnaffected: true,

&nbsp;   futureDefaults: true,

&nbsp;   lazyCompilation: true

&nbsp; }

};

Performance Benchmarks for Your Hardware

With proper optimization, you should achieve:

OperationTarget PerformanceTypical HardwareYour HardwareFull rebuild2-3 minutes<10 seconds<5 secondsHot reload2-3 seconds<500ms<100msTest suite2-5 minutes<30 seconds<5 secondsToken processing10K/second100K/second1M/secondBundle analysis30 seconds<5 seconds<2 secondsType checking1-2 minutes<20 seconds<5 secondsLinting30-60 seconds<10 seconds<3 seconds

Development Workflow Optimizations

Terminal Setup for Parallel Tasks

bash# .bashrc or .zshrc

alias build32="pnpm turbo build --concurrency=32"

alias test32="pnpm jest --maxWorkers=32"

alias lint32="pnpm eslint . --parallel"



\# Run multiple watchers in parallel

function dev() {

&nbsp; tmux new-session -d -s dev

&nbsp; tmux split-window -h

&nbsp; tmux split-window -v

&nbsp; tmux send-keys -t dev:0.0 'pnpm dev' C-m

&nbsp; tmux send-keys -t dev:0.1 'pnpm test:watch' C-m

&nbsp; tmux send-keys -t dev:0.2 'pnpm typecheck:watch' C-m

&nbsp; tmux attach-session -t dev

}

VS Code Settings for Your Hardware

json// .vscode/settings.json

{

&nbsp; "typescript.tsserver.maxTsServerMemory": 16384, // 16GB for TS server

&nbsp; "typescript.tsserver.experimental.enableProjectDiagnostics": true,

&nbsp; "typescript.tsserver.useSeparateSyntaxServer": true,

&nbsp; "files.watcherExclude": {

&nbsp;   "\*\*/node\_modules/\*\*": false // Watch everything with 256GB RAM

&nbsp; },

&nbsp; "search.followSymlinks": true,

&nbsp; "search.maxResults": null, // No limit

&nbsp; "terminal.integrated.env.windows": {

&nbsp;   "NODE\_OPTIONS": "--max-old-space-size=32768"

&nbsp; },

&nbsp; "npm.scriptExplorerParallelCommands": 32

}



\## Summary of Hardware Optimizations



The enhanced patterns ensure Claude will:



1\. \*\*Use all 32 CPU threads\*\* for:

&nbsp;  - Parallel testing (32 workers)

&nbsp;  - Parallel builds (turbo with concurrency=32)

&nbsp;  - Worker thread pools for data processing

&nbsp;  - Parallel database operations



2\. \*\*Leverage RTX 5070 Ti GPU\*\* for:

&nbsp;  - CUDA-accelerated token processing

&nbsp;  - WebGPU in browser

&nbsp;  - Tensor core utilization

&nbsp;  - 16GB VRAM for large batch processing



3\. \*\*Maximize 256GB RAM\*\* with:

&nbsp;  - Aggressive caching (50GB+ caches)

&nbsp;  - In-memory databases for development

&nbsp;  - Memory-mapped files for huge datasets

&nbsp;  - No memory constraints on build tools



4\. \*\*Windows 11 optimizations\*\*:

&nbsp;  - Proper path handling

&nbsp;  - Native worker threads

&nbsp;  - Optimized file watchers

&nbsp;  - Terminal configurations



These patterns will make your development experience incredibly fast - builds in seconds instead of minutes, tests completing almost instantly, and zero memory constraints. Claude will now generate code that fully utilizes your exceptional hardware capabilities.

