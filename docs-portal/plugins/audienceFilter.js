const visit = require('unist-util-visit');

// Plugin to filter content based on audience
function audienceFilter(options = {}) {
  const defaultAudience = options.defaultAudience || 'human';
  
  return (tree, file) => {
    const frontmatter = file.data.frontMatter || {};
    const targetAudience = frontmatter.audience || defaultAudience;
    
    // Add audience metadata
    if (!frontmatter.audience) {
      frontmatter.audience = [defaultAudience];
    } else if (typeof frontmatter.audience === 'string') {
      frontmatter.audience = [frontmatter.audience];
    }
    
    // Process conditional blocks
    visit(tree, 'html', (node, index, parent) => {
      // Look for audience-specific HTML comments
      // <!-- audience: human --> ... <!-- /audience -->
      // <!-- audience: ai --> ... <!-- /audience -->
      const audienceMatch = node.value.match(/<!-- audience: (\w+) -->/);
      if (audienceMatch) {
        const blockAudience = audienceMatch[1];
        if (!frontmatter.audience.includes(blockAudience)) {
          // Remove this block if not for current audience
          parent.children.splice(index, 1);
          return index; // Skip to next
        }
      }
    });
    
    // Process inline audience tags
    visit(tree, 'paragraph', (node) => {
      node.children = node.children.filter(child => {
        if (child.type === 'text') {
          // Remove inline audience tags like {human: text} or {ai: text}
          child.value = child.value.replace(
            /\{(human|ai):\s*([^}]+)\}/g,
            (match, audience, content) => {
              return frontmatter.audience.includes(audience) ? content : '';
            }
          );
        }
        return true;
      });
    });
  };
}

module.exports = audienceFilter;