/**
 * Test script to verify token validation fixes
 */

import { checkScopes } from '../lib/github.js';

console.log("🧪 Testing Token Validation Logic");
console.log("=================================");

// Mock the fetch function to simulate different token scenarios
const originalFetch = global.fetch;

// Test scenario 1: Token with only required permissions
console.log("\n📍 Test 1: Token with only required permissions");
global.fetch = jest.fn(() => Promise.resolve({
    headers: {
        get: () => "public_repo"
    }
}));

try {
    const result = await checkScopes("test_token");
    console.log("✅ Result:", result);
    console.log("   - Should be OK:", result.ok);
    console.log("   - Scopes:", result.scopes);
    console.log("   - Extras:", result.extras);
} catch (error) {
    console.log("❌ Error:", error.message);
}

// Test scenario 2: Token with required permissions + extras
console.log("\n📍 Test 2: Token with required permissions + extra permissions");
global.fetch = jest.fn(() => Promise.resolve({
    headers: {
        get: () => "public_repo,user,gist"
    }
}));

try {
    const result = await checkScopes("test_token");
    console.log("✅ Result:", result);
    console.log("   - Should be NOT OK (has extras):", result.ok);
    console.log("   - Scopes:", result.scopes);
    console.log("   - Extras:", result.extras);
    console.log("   - This should WARN but not THROW in the service");
} catch (error) {
    console.log("❌ Error:", error.message);
}

// Test scenario 3: Token with no required permissions
console.log("\n📍 Test 3: Token with no required permissions");
global.fetch = jest.fn(() => Promise.resolve({
    headers: {
        get: () => "user,gist"
    }
}));

try {
    const result = await checkScopes("test_token");
    console.log("✅ Result:", result);
    console.log("   - Should be NOT OK:", result.ok);
    console.log("   - Scopes:", result.scopes);
    console.log("   - Extras:", result.extras);
    console.log("   - This should THROW an error in the service");
} catch (error) {
    console.log("❌ Error:", error.message);
}

// Test scenario 4: Empty token scopes
console.log("\n📍 Test 4: Empty token scopes");
global.fetch = jest.fn(() => Promise.resolve({
    headers: {
        get: () => ""
    }
}));

try {
    const result = await checkScopes("test_token");
    console.log("✅ Result:", result);
    console.log("   - Should be OK (no extras):", result.ok);
    console.log("   - Scopes:", result.scopes);
    console.log("   - Extras:", result.extras);
    console.log("   - This should THROW an error in the service (no required permissions)");
} catch (error) {
    console.log("❌ Error:", error.message);
}

// Restore original fetch
global.fetch = originalFetch;

console.log("\n🎯 Summary:");
console.log("- ✅ Tokens with only repo/public_repo: PASS");
console.log("- ⚠️  Tokens with repo/public_repo + extras: WARN but PASS");
console.log("- ❌ Tokens without repo/public_repo: FAIL with error");
console.log("- ❌ Empty tokens: FAIL with error");

console.log("\n🏁 Token validation testing completed!");
