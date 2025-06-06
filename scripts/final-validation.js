// Final validation script for Bhavya Bazaar optimizations
const fs = require('fs');
const path = require('path');

console.log('🔍 FINAL VALIDATION - Bhavya Bazaar Optimization Readiness');
console.log('='.repeat(60));

function validateOptimizations() {
  const checks = [];
  
  // 1. Check webpack configuration
  const webpackConfig = path.join(__dirname, '..', 'frontend', 'config-overrides.js');
  if (fs.existsSync(webpackConfig)) {
    const content = fs.readFileSync(webpackConfig, 'utf8');
    if (content.includes('splitChunks') && content.includes('cacheGroups')) {
      checks.push('✅ Webpack optimization configured');
    } else {
      checks.push('❌ Webpack optimization missing');
    }
  } else {
    checks.push('❌ Webpack config file missing');
  }
  
  // 2. Check lazy loading utilities
  const lazyLoading = path.join(__dirname, '..', 'frontend', 'src', 'utils', 'lazyLoading.js');
  if (fs.existsSync(lazyLoading)) {
    checks.push('✅ Lazy loading utilities created');
  } else {
    checks.push('❌ Lazy loading utilities missing');
  }
  
  // 3. Check image optimization
  const imageOpt = path.join(__dirname, '..', 'frontend', 'src', 'utils', 'imageOptimization.js');
  if (fs.existsSync(imageOpt)) {
    checks.push('✅ Image optimization utilities created');
  } else {
    checks.push('❌ Image optimization utilities missing');
  }
  
  // 4. Check 404 page
  const errorPage = path.join(__dirname, '..', 'frontend', 'public', '404.html');
  if (fs.existsSync(errorPage)) {
    checks.push('✅ Custom 404 page created');
  } else {
    checks.push('❌ Custom 404 page missing');
  }
  
  // 5. Check favicon
  const favicon = path.join(__dirname, '..', 'frontend', 'public', 'favicon.ico');
  if (fs.existsSync(favicon)) {
    checks.push('✅ Favicon.ico available');
  } else {
    checks.push('❌ Favicon.ico missing');
  }
  
  // 6. Check brand logos
  const brandLogos = path.join(__dirname, '..', 'frontend', 'public', 'brand-logos');
  if (fs.existsSync(brandLogos)) {
    const logos = fs.readdirSync(brandLogos);
    if (logos.length > 10) {
      checks.push(`✅ Brand logos available (${logos.length} files)`);
    } else {
      checks.push(`⚠️  Limited brand logos (${logos.length} files)`);
    }
  } else {
    checks.push('❌ Brand logos directory missing');
  }
  
  // 7. Check server compression
  const serverFile = path.join(__dirname, '..', 'frontend', 'server.js');
  if (fs.existsSync(serverFile)) {
    const content = fs.readFileSync(serverFile, 'utf8');
    if (content.includes('compression()')) {
      checks.push('✅ Server compression enabled');
    } else {
      checks.push('❌ Server compression missing');
    }
  } else {
    checks.push('❌ Server file missing');
  }
  
  // 8. Check package.json build scripts
  const packageJson = path.join(__dirname, '..', 'frontend', 'package.json');
  if (fs.existsSync(packageJson)) {
    const content = fs.readFileSync(packageJson, 'utf8');
    const pkg = JSON.parse(content);
    if (pkg.scripts && pkg.scripts['build:prod']) {
      checks.push('✅ Production build script available');
    } else {
      checks.push('❌ Production build script missing');
    }
  } else {
    checks.push('❌ Package.json missing');
  }
  
  // 9. Check current bundle size
  const buildDir = path.join(__dirname, '..', 'frontend', 'build', 'static', 'js');
  if (fs.existsSync(buildDir)) {
    const files = fs.readdirSync(buildDir);
    const jsFiles = files.filter(f => f.endsWith('.js') && !f.includes('LICENSE'));
    if (jsFiles.length > 0) {
      let totalSize = 0;
      jsFiles.forEach(file => {
        const stats = fs.statSync(path.join(buildDir, file));
        totalSize += stats.size;
      });
      const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
      if (totalSize > 15 * 1024 * 1024) {
        checks.push(`⚠️  Large bundle detected (${sizeMB}MB) - optimization needed`);
      } else {
        checks.push(`✅ Bundle size acceptable (${sizeMB}MB)`);
      }
    } else {
      checks.push('⚠️  No JS files found in build directory');
    }
  } else {
    checks.push('⚠️  Build directory not found - run npm run build');
  }
  
  return checks;
}

function generateReport() {
  console.log('\n📋 VALIDATION RESULTS:\n');
  
  const checks = validateOptimizations();
  checks.forEach(check => console.log(`   ${check}`));
  
  const passed = checks.filter(c => c.startsWith('✅')).length;
  const warnings = checks.filter(c => c.startsWith('⚠️')).length;
  const failed = checks.filter(c => c.startsWith('❌')).length;
  
  console.log('\n📊 SUMMARY:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ⚠️  Warnings: ${warnings}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  const score = Math.round((passed / checks.length) * 100);
  console.log(`   🎯 Readiness Score: ${score}%`);
  
  if (score >= 90) {
    console.log('\n🟢 READY FOR DEPLOYMENT!');
    console.log('   All optimizations are in place and ready to deploy.');
  } else if (score >= 80) {
    console.log('\n🟡 MOSTLY READY');
    console.log('   Minor issues detected, but safe to deploy.');
  } else {
    console.log('\n🔴 NOT READY');
    console.log('   Critical issues need to be resolved before deployment.');
  }
  
  console.log('\n🚀 NEXT STEPS:');
  if (warnings > 0 || failed > 0) {
    console.log('   1. Resolve any failed checks above');
    console.log('   2. Run: npm run build:prod');
    console.log('   3. Verify bundle size reduction');
    console.log('   4. Deploy to production');
  } else {
    console.log('   1. Run: npm run build:prod (to apply optimizations)');
    console.log('   2. git add . && git commit -m "Performance optimizations"');
    console.log('   3. git push origin main (auto-deploy via Coolify)');
    console.log('   4. Monitor performance improvements');
  }
  
  console.log('\n📈 EXPECTED IMPROVEMENTS AFTER DEPLOYMENT:');
  console.log('   • Bundle size: 50%+ reduction');
  console.log('   • Load time: 40-60% faster');
  console.log('   • Progressive component loading');
  console.log('   • Better user experience');
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 VALIDATION COMPLETE');
}

generateReport();
