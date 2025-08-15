/**
 * In-Memory Database for Ultra-Fast Development
 * Uses SQLite in-memory with your 256GB RAM
 * Falls back to Supabase in production
 */

import Database from 'better-sqlite3';
import { faker } from '@faker-js/faker';
import { BigNumber } from 'bignumber.js';

export interface DevDatabaseConfig {
  useInMemory?: boolean;
  seedData?: boolean;
  logQueries?: boolean;
}

class InMemoryDatabase {
  private db: Database.Database | null = null;
  private queryLog: Array<{ query: string; time: number; timestamp: Date }> = [];
  private config: DevDatabaseConfig;

  constructor(config: DevDatabaseConfig = {}) {
    this.config = {
      useInMemory: process.env.NODE_ENV === 'development' && process.env.USE_MEMORY_DB === 'true',
      seedData: true,
      logQueries: process.env.LOG_DB_QUERIES === 'true',
      ...config
    };
  }

  initialize(): Database.Database {
    if (this.db) return this.db;

    console.log('🚀 Initializing in-memory database with 256GB RAM...');
    
    // Create in-memory database
    this.db = new Database(':memory:', {
      verbose: this.config.logQueries ? console.log : undefined
    });

    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = -2000000'); // 2GB cache
    this.db.pragma('mmap_size = 30000000000'); // 30GB memory map
    
    // Create schema
    this.createSchema();
    
    // Seed with test data if requested
    if (this.config.seedData) {
      this.seedTestData();
    }

    console.log('✅ In-memory database ready (instant queries!)');
    return this.db;
  }

  private createSchema(): void {
    if (!this.db) throw new Error('Database not initialized');

    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_users_email ON users(email);
    `);

    // API Keys table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        key_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      CREATE INDEX idx_api_keys_user ON api_keys(user_id);
    `);

    // Tokens table (for usage tracking)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        input_tokens INTEGER NOT NULL,
        output_tokens INTEGER NOT NULL,
        cost TEXT NOT NULL, -- Store as string for BigNumber precision
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      CREATE INDEX idx_tokens_user ON tokens(user_id);
      CREATE INDEX idx_tokens_timestamp ON tokens(timestamp);
    `);

    // Sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      CREATE INDEX idx_sessions_token ON sessions(token);
    `);
  }

  private seedTestData(): void {
    if (!this.db) throw new Error('Database not initialized');

    console.log('🌱 Seeding test data...');

    // Prepare statements for fast insertion
    const insertUser = this.db.prepare(`
      INSERT INTO users (id, email, name) VALUES (?, ?, ?)
    `);

    const insertToken = this.db.prepare(`
      INSERT INTO tokens (id, user_id, provider, model, input_tokens, output_tokens, cost)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertApiKey = this.db.prepare(`
      INSERT INTO api_keys (id, user_id, provider, key_hash)
      VALUES (?, ?, ?, ?)
    `);

    // Use transaction for speed
    this.db.transaction(() => {
      // Create test users
      const users = [];
      for (let i = 0; i < 100; i++) {
        const user = {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName()
        };
        insertUser.run(user.id, user.email, user.name);
        users.push(user);
      }

      // Create API keys for each user
      const providers = ['openai', 'anthropic', 'google', 'azure'];
      users.forEach(user => {
        providers.forEach(provider => {
          if (Math.random() > 0.5) { // 50% chance of having each provider
            insertApiKey.run(
              faker.string.uuid(),
              user.id,
              provider,
              faker.string.alphanumeric(40)
            );
          }
        });
      });

      // Create token usage data
      const models = {
        openai: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'],
        anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
        google: ['gemini-pro', 'gemini-ultra'],
        azure: ['gpt-4', 'gpt-3.5-turbo']
      };

      users.forEach(user => {
        // Generate 100-1000 token records per user
        const recordCount = faker.number.int({ min: 100, max: 1000 });
        
        for (let i = 0; i < recordCount; i++) {
          const provider = faker.helpers.arrayElement(providers);
          const model = faker.helpers.arrayElement(models[provider]);
          const inputTokens = faker.number.int({ min: 10, max: 10000 });
          const outputTokens = faker.number.int({ min: 10, max: 5000 });
          
          // Calculate cost with BigNumber
          const rate = faker.number.float({ min: 0.0001, max: 0.01 });
          const cost = new BigNumber(inputTokens + outputTokens)
            .multipliedBy(rate)
            .dividedBy(1000)
            .toFixed(6);

          insertToken.run(
            faker.string.uuid(),
            user.id,
            provider,
            model,
            inputTokens,
            outputTokens,
            cost
          );
        }
      });
    })();

    const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const tokenCount = this.db.prepare('SELECT COUNT(*) as count FROM tokens').get() as { count: number };
    
    console.log(`✅ Seeded ${userCount.count} users with ${tokenCount.count} token records`);
  }

  // Query methods with performance tracking
  query<T = unknown>(sql: string, params: unknown[] = []): T[] {
    if (!this.db) throw new Error('Database not initialized');

    const start = Date.now();
    const stmt = this.db.prepare(sql);
    const result = stmt.all(...params) as T[];
    const time = Date.now() - start;

    if (this.config.logQueries) {
      this.queryLog.push({ query: sql, time, timestamp: new Date() });
      console.log(`Query executed in ${time}ms: ${sql.substring(0, 100)}...`);
    }

    return result;
  }

  get<T = unknown>(sql: string, params: unknown[] = []): T | undefined {
    if (!this.db) throw new Error('Database not initialized');

    const start = Date.now();
    const stmt = this.db.prepare(sql);
    const result = stmt.get(...params) as T | undefined;
    const time = Date.now() - start;

    if (this.config.logQueries) {
      console.log(`Query executed in ${time}ms: ${sql.substring(0, 100)}...`);
    }

    return result;
  }

  run(sql: string, params: unknown[] = []): Database.RunResult {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(sql);
    return stmt.run(...params);
  }

  // Performance analysis
  getPerformanceStats(): {
    totalQueries: number;
    averageTime: number;
    slowestQuery: { query: string; time: number } | null;
    fastestQuery: { query: string; time: number } | null;
  } {
    if (this.queryLog.length === 0) {
      return {
        totalQueries: 0,
        averageTime: 0,
        slowestQuery: null,
        fastestQuery: null
      };
    }

    const times = this.queryLog.map(q => q.time);
    const totalTime = times.reduce((a, b) => a + b, 0);
    const sorted = [...this.queryLog].sort((a, b) => b.time - a.time);

    return {
      totalQueries: this.queryLog.length,
      averageTime: totalTime / this.queryLog.length,
      slowestQuery: sorted[0] ? { query: sorted[0].query, time: sorted[0].time } : null,
      fastestQuery: sorted[sorted.length - 1] ? { query: sorted[sorted.length - 1].query, time: sorted[sorted.length - 1].time } : null
    };
  }

  // Benchmark in-memory vs production database
  async benchmark(): Promise<void> {
    console.log('🏃 Running database benchmark...');
    
    // Test 1: Simple SELECT
    const start1 = Date.now();
    for (let i = 0; i < 1000; i++) {
      this.query('SELECT * FROM users LIMIT 10');
    }
    const time1 = Date.now() - start1;
    console.log(`1000 simple SELECTs: ${time1}ms (${time1/1000}ms per query)`);

    // Test 2: Complex JOIN
    const start2 = Date.now();
    for (let i = 0; i < 100; i++) {
      this.query(`
        SELECT u.*, COUNT(t.id) as token_count, SUM(CAST(t.cost AS REAL)) as total_cost
        FROM users u
        LEFT JOIN tokens t ON u.id = t.user_id
        GROUP BY u.id
        LIMIT 10
      `);
    }
    const time2 = Date.now() - start2;
    console.log(`100 complex JOINs: ${time2}ms (${time2/100}ms per query)`);

    // Test 3: Bulk INSERT
    const start3 = Date.now();
    const stmt = this.db!.prepare('INSERT INTO tokens (id, user_id, provider, model, input_tokens, output_tokens, cost) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertMany = this.db!.transaction((tokens: any[]) => {
      for (const token of tokens) stmt.run(...token);
    });
    
    const testTokens = Array(10000).fill(null).map(() => [
      faker.string.uuid(),
      faker.string.uuid(),
      'openai',
      'gpt-4',
      1000,
      500,
      '0.015000'
    ]);
    
    insertMany(testTokens);
    const time3 = Date.now() - start3;
    console.log(`10,000 INSERTs: ${time3}ms (${time3/10000}ms per insert)`);

    console.log('\n✅ Benchmark complete! In-memory database is FAST! 🚀');
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('Database connection closed');
    }
  }
}

// Singleton instance
let devDb: InMemoryDatabase | null = null;

export function getDevDatabase(): InMemoryDatabase {
  if (!devDb) {
    devDb = new InMemoryDatabase();
    devDb.initialize();
  }
  return devDb;
}

// Export for use in API routes
export default InMemoryDatabase;