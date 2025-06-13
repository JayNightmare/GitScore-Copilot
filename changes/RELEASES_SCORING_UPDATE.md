# Releases-Based Scoring Update

## Enhancement Overview
Updated the documentation scoring system to use **GitHub Releases** instead of CHANGELOG.md files for better accuracy and reliability.

## Why This Change?
- **More Reliable**: GitHub Releases are standardized and part of the platform
- **Better Data Quality**: Releases contain structured metadata (tags, dates, descriptions)
- **Automated Detection**: No need to parse markdown files for changelog content
- **Version Management**: Directly reflects the project's versioning practices

## Scoring Logic

### Before (Changelog-based):
```javascript
// Binary scoring: changelog exists or not
scores.changelog = changelogText && changelogText.length > 100 ? 1 : 0;
```

### After (Releases-based):
```javascript
// Graduated scoring based on release count
const releaseCount = repo.releases?.totalCount || 0;
if (releaseCount >= 5) {
    scores.releases = 1;    // 5+ releases = excellent versioning
} else if (releaseCount >= 2) {
    scores.releases = 0.7;  // 2-4 releases = good versioning  
} else if (releaseCount >= 1) {
    scores.releases = 0.4;  // 1 release = basic versioning
} else {
    scores.releases = 0;    // No releases
}
```

## Benefits

1. **More Nuanced Scoring**: Graduated scoring rewards active release management
2. **No File Parsing**: Relies on GitHub's structured API data
3. **Better Accuracy**: Reflects actual versioning practices vs just documentation
4. **Consistent Data**: All repositories have the same release count field

## Files Modified

- `lib/scoring.js` - Updated documentation scoring function
- `lib/GitScore-Copilot-service.js` - Removed CHANGELOG.md GraphQL query
- `__tests__/scoring.test.js` - Updated test data
- `test-data-collection.js` - Updated test data and descriptions

## Impact on Scoring

The documentation category now evaluates:
- **README Quality** (0-1) - Content analysis and structure
- **CONTRIBUTING Guide** (0 or 1) - Presence of contribution guidelines  
- **Code of Conduct** (0 or 1) - Community standards
- **Releases** (0-1) - Graduated scoring based on release count

This provides a more accurate assessment of project documentation and release management practices.
