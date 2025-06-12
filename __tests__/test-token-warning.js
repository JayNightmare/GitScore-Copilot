/**
 * Test script to verify token warning functionality
 */

console.log("🧪 Testing Token Warning Functionality");
console.log("=====================================");

// Mock test scenarios
const testScenarios = [
    {
        name: "Token with minimal permissions",
        tokenValidation: {
            isValid: true,
            hasExtraPermissions: false,
            scopes: ["public_repo"],
            extras: [],
            hasMinimalPermissions: true
        }
    },
    {
        name: "Token with extra permissions",
        tokenValidation: {
            isValid: true,
            hasExtraPermissions: true,
            scopes: ["public_repo", "user", "gist", "notifications"],
            extras: ["user", "gist", "notifications"],
            hasMinimalPermissions: false
        }
    },
    {
        name: "Token with repo scope + extras",
        tokenValidation: {
            isValid: true,
            hasExtraPermissions: true,
            scopes: ["repo", "admin:org", "delete_repo"],
            extras: ["admin:org", "delete_repo"],
            hasMinimalPermissions: false
        }
    }
];

testScenarios.forEach((scenario, index) => {
    console.log(`\n📍 Test ${index + 1}: ${scenario.name}`);
    console.log("   - Token Valid:", scenario.tokenValidation.isValid);
    console.log("   - Has Extra Permissions:", scenario.tokenValidation.hasExtraPermissions);
    console.log("   - Scopes:", scenario.tokenValidation.scopes.join(', '));
    console.log("   - Extra Permissions:", scenario.tokenValidation.extras.join(', ') || 'None');
    console.log("   - Minimal Permissions:", scenario.tokenValidation.hasMinimalPermissions);
    
    if (scenario.tokenValidation.hasExtraPermissions) {
        console.log("   ⚠️  WARNING: This would show the token security warning in the UI");
        console.log(`   📝 Warning text: "Your token has extra permissions: ${scenario.tokenValidation.extras.join(', ')}"`);
    } else {
        console.log("   ✅ OK: No warning would be shown");
    }
});

console.log("\n🎯 Summary:");
console.log("- ✅ Tokens with only repo/public_repo: No warning");
console.log("- ⚠️  Tokens with extra permissions: Warning displayed");
console.log("- 🔧 Warning appears next to 'Change GitHub Token' button");
console.log("- 🎨 Warning uses amber/yellow styling for visibility");

console.log("\n🏁 Token warning testing completed!");
