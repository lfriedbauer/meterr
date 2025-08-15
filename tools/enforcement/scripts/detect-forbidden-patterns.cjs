const fs = require('fs');
const glob = require('glob');

const FORBIDDEN_PATTERNS = {
  authentication: [
    /(?:class|function)\s+\w*Auth(?:entication|Service)/g,
    /jwt\.(?:sign|verify|decode)(?!\s*\/\/\s*@approved)/g,
    /bcrypt\.(?:hash|compare)(?!\s*\/\/\s*@approved)/g
  ],
  payments: [
    /(?:stripe|paypal|square|braintree)\.(?!.*@meterr)/gi,
    /credit.*card.*(?:process|charge|validate)(?!\s*\/\/\s*@approved)/gi
  ],
  search: [
    /(?:class|function)\s+\w*Search(?:Engine|Service)/g,
    /\.(?:indexOf|includes|match|search).*(?:query|term)(?!\s*\/\/\s*@approved)/g
  ],
  complexUI: [
    /(?:class|const|function)\s+\w*(?:Modal|Dialog|Dropdown|Carousel)/g,
    /styled\.(?:div|span|button).*{[\s\S]{100,}}/g
  ]
};

const EVIDENCE_KEYWORDS = [
  '@research:search', '@v0:', '@flexsearch:', '@approved'
];

async function scanFiles() {
  const files = glob.sync('**/*.{js,jsx,ts,tsx}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**', 'scripts/**', '**/.turbo/**', '**/build/**', '**/.next/**', 'docs-portal/**']
  });
  
  const violations = [];
  
  for (const file of files) {
    // Skip if it's a directory
    try {
      if (fs.statSync(file).isDirectory()) {
        continue;
      }
    } catch (error) {
      continue;
    }
    
    const content = fs.readFileSync(file, 'utf-8');
    
    for (const [category, patterns] of Object.entries(FORBIDDEN_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          const hasEvidence = EVIDENCE_KEYWORDS.some(keyword => 
            content.includes(keyword)
          );
          
          if (!hasEvidence) {
            violations.push({ file, category });
          }
        }
      }
    }
  }
  
  if (violations.length > 0) {
    console.error('\n❌ Found forbidden custom implementations:');
    violations.forEach(v => {
      console.error(`📁 ${v.file}: ${v.category}`);
    });
    console.error('\n💡 Add evidence comments like:');
    console.error('   // @research:search - researched alternatives');
    console.error('   // @v0:component-name - generated using v0.dev');
    console.error('   // @flexsearch:implementation - uses FlexSearch');
    console.error('   // @approved - architecture team approval');
    process.exit(1);
  } else {
    console.log('✅ No forbidden patterns detected - low-code compliance check passed!');
  }
}

scanFiles().catch(console.error);