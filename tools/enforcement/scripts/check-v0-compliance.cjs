const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { execSync } = require('child_process');

class ComponentComplexityDetector {
  analyzeComponent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Parse the file
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy']
      });
      
      let metrics = {
        jsxElements: 0,
        stateVariables: 0,
        eventHandlers: 0,
        conditionalRendering: 0,
        cssInJs: 0,
        customHooks: 0,
        effectHooks: 0,
        contextUsage: 0
      };
      
      traverse(ast, {
        JSXElement() { 
          metrics.jsxElements++; 
        },
        JSXFragment() { 
          metrics.jsxElements++; 
        },
        CallExpression(path) {
          const calleeName = path.node.callee.name;
          if (calleeName === 'useState') {
            metrics.stateVariables++;
          } else if (calleeName === 'useEffect' || calleeName === 'useLayoutEffect') {
            metrics.effectHooks++;
          } else if (calleeName === 'useContext') {
            metrics.contextUsage++;
          } else if (calleeName && calleeName.startsWith('use') && calleeName.length > 3) {
            metrics.customHooks++;
          }
          
          // Check for styled-components or emotion
          if (path.node.callee.object && 
              (path.node.callee.object.name === 'styled' || 
               path.node.callee.object.name === 'css')) {
            metrics.cssInJs++;
          }
        },
        JSXAttribute(path) {
          if (path.node.name.name && path.node.name.name.startsWith('on')) {
            metrics.eventHandlers++;
          }
        },
        ConditionalExpression(path) { 
          // Check if it's within JSX
          if (path.findParent(p => p.isJSXElement())) {
            metrics.conditionalRendering++; 
          }
        },
        LogicalExpression(path) {
          // Check for && rendering patterns
          if (path.node.operator === '&&' && path.findParent(p => p.isJSXElement())) {
            metrics.conditionalRendering++;
          }
        }
      });
      
      // Calculate complexity score
      const complexity = 
        metrics.jsxElements * 2 +
        metrics.stateVariables * 3 +
        metrics.eventHandlers * 4 +
        metrics.conditionalRendering * 3 +
        metrics.cssInJs * 2 +
        metrics.customHooks * 3 +
        metrics.effectHooks * 4 +
        metrics.contextUsage * 2;
      
      // Check for evidence of v0.dev generation
      const hasGenerationProof = 
        content.includes('@v0:') || 
        content.includes('Generated with v0') ||
        content.includes('v0.dev') ||
        content.includes('// v0 ');
      
      return {
        ...metrics,
        complexity,
        shouldUseV0: complexity > 15,
        hasGenerationProof,
        recommendation: this.getRecommendation(complexity, metrics)
      };
    } catch (error) {
      // If we can't parse the file, skip it
      return {
        complexity: 0,
        shouldUseV0: false,
        hasGenerationProof: false,
        error: error.message
      };
    }
  }
  
  getRecommendation(complexity, metrics) {
    if (complexity < 10) return 'Simple component - custom implementation acceptable';
    if (complexity < 15) return 'Consider using v0.dev for faster development';
    if (complexity < 25) return 'v0.dev strongly recommended for this complexity';
    return 'Complex component - v0.dev required to maintain consistency';
  }
}

function getStagedFiles() {
  try {
    const diff = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
    return diff
      .split('\n')
      .filter(f => f.match(/\.(jsx|tsx)$/))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function main() {
  const stagedFiles = getStagedFiles();
  
  if (stagedFiles.length === 0) {
    console.log('ℹ️  No React/TypeScript components to check');
    return;
  }
  
  const detector = new ComponentComplexityDetector();
  const violations = [];
  const warnings = [];
  
  console.log('\n📊 Analyzing component complexity...\n');
  
  stagedFiles.forEach(file => {
    const fullPath = path.resolve(file);
    if (!fs.existsSync(fullPath)) return;
    
    const analysis = detector.analyzeComponent(fullPath);
    
    if (analysis.error) {
      console.log(`   ⚠️  ${file}: Parse error - skipping`);
      return;
    }
    
    console.log(`   ${file}:`);
    console.log(`      Complexity: ${analysis.complexity}`);
    console.log(`      ${analysis.recommendation}`);
    
    if (analysis.shouldUseV0 && !analysis.hasGenerationProof) {
      if (analysis.complexity > 25) {
        violations.push({ 
          file, 
          complexity: analysis.complexity,
          metrics: analysis.metrics
        });
      } else {
        warnings.push({ 
          file, 
          complexity: analysis.complexity,
          recommendation: analysis.recommendation
        });
      }
    } else if (analysis.hasGenerationProof) {
      console.log(`      ✅ v0.dev evidence found`);
    }
  });
  
  if (warnings.length > 0) {
    console.warn('\n⚠️  Components that would benefit from v0.dev:');
    warnings.forEach(w => {
      console.warn(`   ${w.file} (complexity: ${w.complexity})`);
      console.warn(`      ${w.recommendation}`);
    });
  }
  
  if (violations.length > 0) {
    console.error('\n❌ Complex UI components require v0.dev generation:');
    violations.forEach(v => {
      console.error(`   ${v.file} (complexity: ${v.complexity})`);
      console.error(`      JSX Elements: ${v.metrics.jsxElements}`);
      console.error(`      State Variables: ${v.metrics.stateVariables}`);
      console.error(`      Event Handlers: ${v.metrics.eventHandlers}`);
    });
    console.error('\n💡 How to fix:');
    console.error('   1. Visit v0.dev and describe your component');
    console.error('   2. Generate and customize the component');
    console.error('   3. Add @v0:component-name comment to the file');
    console.error('   4. Or add // Generated with v0 at the top');
    process.exit(1);
  } else if (warnings.length === 0) {
    console.log('\n✅ v0.dev compliance check passed!');
  }
}

// Only run if executed directly
if (require.main === module) {
  main();
}