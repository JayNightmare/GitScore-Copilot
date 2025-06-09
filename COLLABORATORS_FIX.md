# Collaborators Permission Fix

## Issue
The GitHub Repository Scorer was encountering the error:
```
Error: Request failed due to following response errors: - You do not have permission to view repository collaborators.
```

## Root Cause
The GraphQL query was attempting to fetch the `collaborators` field from the GitHub API, which requires special permissions that most personal access tokens don't have, especially for private repositories or organization repositories.

## Solution
**Removed the `collaborators` field from all GraphQL queries** and updated the contributor counting logic to rely exclusively on commit history analysis.

### Changes Made:
1. **GitScore-Copilot-service.js**: Removed `collaborators` and `mentionableUsers` fields from GraphQL query
2. **github.js**: Removed `collaborators` field from GraphQL query  
3. **Test files**: Updated test data to remove collaborators field references
4. **Scoring logic**: Already uses commit history for contributor counting (no changes needed)

## Benefits
- ✅ No more permission errors when analyzing repositories
- ✅ More accurate contributor counting using actual commit data
- ✅ Works with standard `public_repo` token permissions
- ✅ Compatible with both public and private repositories (when token has access)

## Token Requirements
The scorer now works with minimal GitHub token permissions:
- `public_repo` scope for public repositories
- `repo` scope for private repositories (if needed)

No special collaborator access permissions required!

## Technical Details
The contributor counting now works by:
1. Fetching the last 100 commits from the default branch
2. Extracting unique contributors using GitHub username, email, or name
3. Calculating a logarithmic score based on contributor count (1-50+ range)

This approach is more accurate than the collaborators API since it reflects actual code contributions rather than just repository access permissions.
