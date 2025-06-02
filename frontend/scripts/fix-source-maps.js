const fs = require('fs');
const path = require('path');

// Fix source map issues by removing problematic source map references
const problematicPackages = [
  'timeago.js'
];

function fixSourceMaps() {
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  
  problematicPackages.forEach(packageName => {
    const packagePath = path.join(nodeModulesPath, packageName);
    
    if (fs.existsSync(packagePath)) {
      // Find all .js files in the package
      function processDir(dirPath) {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
          const itemPath = path.join(dirPath, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            processDir(itemPath);
          } else if (item.endsWith('.js')) {
            // Remove source map references
            let content = fs.readFileSync(itemPath, 'utf8');
            if (content.includes('//# sourceMappingURL=')) {
              content = content.replace(/\/\/# sourceMappingURL=.*$/gm, '');
              fs.writeFileSync(itemPath, content, 'utf8');
              console.log(`Fixed source map in: ${itemPath}`);
            }
          }
        });
      }
      
      processDir(packagePath);
    }
  });
}

fixSourceMaps();
console.log('Source map fix completed!');
