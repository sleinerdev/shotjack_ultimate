// Test script to verify ES module imports work correctly
console.log('Testing ES module imports...\n');

async function testImports() {
  try {
    // Test validation.js
    const validation = await import('./server/validation.js');
    console.log('✅ validation.js loaded successfully');
    console.log('  - validateMessage:', typeof validation.validateMessage);
    console.log('  - MAX_NAME_LENGTH:', validation.MAX_NAME_LENGTH);

    // Test logger.js
    const logger = await import('./server/logger.js');
    console.log('✅ logger.js loaded successfully');
    console.log('  - Logger class:', typeof logger.Logger);
    console.log('  - serverLogger:', typeof logger.serverLogger);

    // Test rateLimiter.js
    const rateLimiter = await import('./server/rateLimiter.js');
    console.log('✅ rateLimiter.js loaded successfully');
    console.log('  - RateLimiter class:', typeof rateLimiter.RateLimiter);
    console.log('  - rateLimiter instance:', typeof rateLimiter.rateLimiter);

    console.log('\n🎉 All ES module imports working correctly!');

  } catch (error) {
    console.error('❌ Import test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testImports();
