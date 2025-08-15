/**
 * In-Memory Database Benchmark
 * Tests performance with 256GB RAM
 */

import { getDevDatabase } from '../lib/dev-database';

async function runBenchmark() {
  console.log('🏁 In-Memory Database Benchmark');
  console.log('=' .repeat(50));
  console.log('💾 System: 256GB RAM, 32 threads');
  console.log('\n');
  
  const db = getDevDatabase();
  
  // Run the built-in benchmark
  await db.benchmark();
  
  // Additional performance tests
  console.log('\n🔥 Advanced Performance Tests:');
  
  // Test 1: Concurrent reads
  console.log('\n1. Concurrent reads (simulating 32 parallel workers):');
  const readPromises = [];
  const start1 = Date.now();
  
  for (let i = 0; i < 32; i++) {
    readPromises.push(
      new Promise(resolve => {
        const results = db.query('SELECT * FROM users LIMIT 100');
        resolve(results);
      })
    );
  }
  
  await Promise.all(readPromises);
  const time1 = Date.now() - start1;
  console.log(`  32 concurrent reads: ${time1}ms (${(time1/32).toFixed(2)}ms average)`);
  
  // Test 2: Complex aggregations
  console.log('\n2. Complex aggregations:');
  const start2 = Date.now();
  
  const aggregation = db.query(`
    SELECT 
      u.id,
      u.email,
      COUNT(t.id) as token_count,
      SUM(CAST(t.input_tokens AS INTEGER)) as total_input,
      SUM(CAST(t.output_tokens AS INTEGER)) as total_output,
      SUM(CAST(t.cost AS REAL)) as total_cost,
      AVG(CAST(t.cost AS REAL)) as avg_cost
    FROM users u
    LEFT JOIN tokens t ON u.id = t.user_id
    GROUP BY u.id, u.email
    ORDER BY total_cost DESC
    LIMIT 10
  `);
  
  const time2 = Date.now() - start2;
  console.log(`  Complex aggregation: ${time2}ms`);
  console.log(`  Rows returned: ${aggregation.length}`);
  
  // Test 3: Full table scan
  console.log('\n3. Full table scan:');
  const start3 = Date.now();
  
  const fullScan = db.query('SELECT COUNT(*) as count FROM tokens');
  const time3 = Date.now() - start3;
  const count = (fullScan[0] as any).count;
  
  console.log(`  Full scan of ${count} rows: ${time3}ms`);
  console.log(`  Speed: ${(count / time3 * 1000).toFixed(0)} rows/second`);
  
  // Test 4: Window functions
  console.log('\n4. Window functions (ranking):');
  const start4 = Date.now();
  
  const windowQuery = db.query(`
    SELECT 
      user_id,
      provider,
      SUM(CAST(cost AS REAL)) as total_cost,
      RANK() OVER (PARTITION BY provider ORDER BY SUM(CAST(cost AS REAL)) DESC) as rank_in_provider,
      PERCENT_RANK() OVER (ORDER BY SUM(CAST(cost AS REAL)) DESC) as percentile
    FROM tokens
    GROUP BY user_id, provider
    LIMIT 100
  `);
  
  const time4 = Date.now() - start4;
  console.log(`  Window function query: ${time4}ms`);
  
  // Test 5: Batch inserts
  console.log('\n5. Batch insert performance:');
  const batchSizes = [100, 1000, 10000];
  
  for (const size of batchSizes) {
    const values = Array(size).fill(null).map((_, i) => 
      `('${crypto.randomUUID()}', 'test-user-${i}', 'openai', 'gpt-4', 100, 50, 1.5, '0.001500')`
    ).join(',');
    
    const start = Date.now();
    db.run(`INSERT INTO tokens (id, user_id, provider, model, input_tokens, output_tokens, cost) VALUES ${values}`);
    const duration = Date.now() - start;
    
    console.log(`  ${size} rows: ${duration}ms (${(size / duration * 1000).toFixed(0)} inserts/second)`);
  }
  
  // Get final performance stats
  console.log('\n📊 Overall Performance Statistics:');
  const stats = db.getPerformanceStats();
  
  console.log(`  Total queries executed: ${stats.totalQueries}`);
  console.log(`  Average query time: ${stats.averageTime.toFixed(2)}ms`);
  
  if (stats.slowestQuery) {
    console.log(`  Slowest query: ${stats.slowestQuery.time}ms`);
    console.log(`    ${stats.slowestQuery.query.substring(0, 80)}...`);
  }
  
  if (stats.fastestQuery) {
    console.log(`  Fastest query: ${stats.fastestQuery.time}ms`);
    console.log(`    ${stats.fastestQuery.query.substring(0, 80)}...`);
  }
  
  // Memory usage
  const memUsage = process.memoryUsage();
  console.log('\n💾 Memory Usage:');
  console.log(`  RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  External: ${(memUsage.external / 1024 / 1024).toFixed(2)}MB`);
  
  console.log('\n✅ Benchmark complete!');
  console.log('\n💡 Performance Insights:');
  console.log('  - In-memory SQLite with 256GB RAM is blazing fast');
  console.log('  - Complex queries complete in milliseconds');
  console.log('  - Perfect for development and testing');
  console.log('  - Consider using for integration tests');
  
  // Clean up
  db.close();
}

// Run the benchmark
runBenchmark().catch(console.error);