/**
 * GPU Token Counting Benchmark
 * Compares GPU vs CPU performance
 */

import { GPUTokenizer } from '../lib/gpu-tokenizer';

const SAMPLE_TEXTS = [
  'Hello world',
  'The quick brown fox jumps over the lazy dog',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  // Add a long text (simulating a typical API response)
  Array(1000)
    .fill('This is a test sentence. ')
    .join(''),
  // Add a very long text (simulating a large document)
  Array(10000)
    .fill('This is a test sentence. ')
    .join(''),
];

async function benchmarkGPU() {
  console.log('🚀 Starting GPU token counting benchmark...');
  const tokenizer = new GPUTokenizer();

  try {
    await tokenizer.initialize();

    // Warm-up
    await tokenizer.countTokens(['warmup']);

    // Benchmark different batch sizes
    const batchSizes = [1, 10, 100, 1000];

    for (const batchSize of batchSizes) {
      const texts = Array(batchSize).fill(SAMPLE_TEXTS[2]); // Use medium-length text

      const start = Date.now();
      const counts = await tokenizer.countTokens(texts);
      const duration = Date.now() - start;

      console.log(`\nBatch size ${batchSize}:`);
      console.log(`  Time: ${duration}ms`);
      console.log(`  Throughput: ${((batchSize / duration) * 1000).toFixed(2)} texts/second`);
      console.log(`  Avg time per text: ${(duration / batchSize).toFixed(2)}ms`);
    }

    // Benchmark different text lengths
    console.log('\n📏 Testing different text lengths:');
    for (let i = 0; i < SAMPLE_TEXTS.length; i++) {
      const start = Date.now();
      const [count] = await tokenizer.countTokens([SAMPLE_TEXTS[i]]);
      const duration = Date.now() - start;

      console.log(`\nText ${i + 1} (${SAMPLE_TEXTS[i].length} chars):`);
      console.log(`  Tokens: ${count}`);
      console.log(`  Time: ${duration}ms`);
      console.log(
        `  Speed: ${((SAMPLE_TEXTS[i].length / duration) * 1000).toFixed(2)} chars/second`
      );
    }

    // Test GPU availability
    console.log('\n🎮 GPU Status:');
    console.log(`  Available: ${tokenizer.isGPUAvailable()}`);

    // Memory usage test
    console.log('\n💾 Memory test with large batch:');
    const largeBatch = Array(10000).fill(SAMPLE_TEXTS[1]);
    const memBefore = process.memoryUsage().heapUsed / 1024 / 1024;

    const start = Date.now();
    await tokenizer.countTokens(largeBatch);
    const duration = Date.now() - start;

    const memAfter = process.memoryUsage().heapUsed / 1024 / 1024;

    console.log(`  Processed: ${largeBatch.length} texts`);
    console.log(`  Time: ${duration}ms`);
    console.log(`  Memory used: ${(memAfter - memBefore).toFixed(2)}MB`);
    console.log(`  Throughput: ${((largeBatch.length / duration) * 1000).toFixed(2)} texts/second`);
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
  } finally {
    tokenizer.close();
  }
}

// CPU comparison (simple approximation)
async function benchmarkCPU() {
  console.log('\n🖥️ CPU token counting (approximation) benchmark...');

  function approximateTokenCount(text: string): number {
    // Simple approximation: ~1 token per 4 characters
    return Math.ceil(text.length / 4);
  }

  const batchSizes = [1, 10, 100, 1000, 10000];

  for (const batchSize of batchSizes) {
    const texts = Array(batchSize).fill(SAMPLE_TEXTS[2]);

    const start = Date.now();
    const counts = texts.map(approximateTokenCount);
    const duration = Date.now() - start;

    console.log(`\nBatch size ${batchSize}:`);
    console.log(`  Time: ${duration}ms`);
    console.log(`  Throughput: ${((batchSize / duration) * 1000).toFixed(2)} texts/second`);
  }
}

// Run benchmarks
async function main() {
  console.log('🏁 Token Counting Benchmark');
  console.log('='.repeat(50));

  await benchmarkGPU();
  await benchmarkCPU();

  console.log('\n✅ Benchmark complete!');
  console.log('\n💡 Recommendation:');
  console.log('  - Use GPU for batch processing (>100 texts)');
  console.log('  - Use CPU approximation for single texts');
  console.log('  - Consider caching results for repeated texts');
}

main().catch(console.error);
