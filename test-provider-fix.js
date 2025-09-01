#!/usr/bin/env node

/**
 * Simple test script to verify the provider manager fix
 * This script tests that getAvailableProviders() only returns providers with API keys
 */

import { simpleAIProviderManager } from '../src/services/ai/simple-provider.js';

console.log('Testing AI Provider Manager Fix');
console.log('================================');

const availableProviders = simpleAIProviderManager.getAvailableProviders();
console.log('Available providers:', availableProviders);

if (availableProviders.length === 0) {
  console.log('✅ SUCCESS: No providers are available (as expected without API keys)');
} else {
  console.log("❌ ISSUE: Some providers are marked as available when they shouldn't be");
  console.log("This might indicate the fix didn't work properly");
}

console.log('\nTest completed.');
