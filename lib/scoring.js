/**
 * Repository scoring algorithm that calculates weighted scores based on various metrics
 * Returns normalized 0-10 score with detailed breakdown of contributing factors
 * 
 * Scoring Categories:
 * - Documentation (20%): README, CONTRIBUTING, CoC, Releases
 * - Maintenance & Activity (20%): Recent commits, frequency, issue/PR management
 * - Quality & Testing (15%): CI pipeline, test coverage, linting, build status
 * - Community & Collaboration (15%): Contributors, discussions, response time
 * - Popularity & Reach (15%): Stars, forks, watchers, downloads
 * - Security & Dependency Health (15%): Vulnerability alerts, dependencies, signed commits
 */

/**
 * Scoring weights for different repository categories (must sum to 1.0)
 */
const CATEGORY_WEIGHTS = {
    documentation: 0.20,
    maintenance: 0.20,
    quality: 0.15,
    community: 0.15,
    popularity: 0.15,
    security: 0.15,
};

/**
 * Normalize a value between 0 and 1 using logarithmic scaling
 */
function normalizeLog(value, min = 0, max = 1000, base = 10) {
    if (value <= min) return 0;
    if (value >= max) return 1;
    return Math.log(value - min + 1) / Math.log(max - min + 1);
}

/**
 * Normalize a value between 0 and 1 using linear scaling
 */
function normalizeLinear(value, min = 0, max = 100) {
    if (value <= min) return 0;
    if (value >= max) return 1;
    return (value - min) / (max - min);
}

/**
 * 1. DOCUMENTATION SCORING (20%)
 * Evaluates README quality, CONTRIBUTING guide, Code of Conduct, and Releases
 */
function scoreDocumentation(repo, readmeText, contributingText) {
    const scores = {};
    
    // README Quality (0-1)
    let readmeScore = 0;
    const details = [];
    
    if (!readmeText) {
        scores.readme = 0;
        details.push("No README found");
    } else {
        const length = readmeText.length;
        const sections = (readmeText.match(/#{1,6}\s/g) || []).length;
        const codeBlocks = (readmeText.match(/```/g) || []).length / 2;
        const links = (readmeText.match(/\[.*?\]\(.*?\)/g) || []).length;
        const badges = (readmeText.match(/!\[.*?\]\(.*?\)/g) || []).length;
        
        // Basic content check (0.5 points)
        if (length > 500 && sections >= 2) {
            readmeScore += 0.5;
            details.push("has basic structure");
        }
        
        // Advanced content check (0.5 points)
        if (codeBlocks >= 1 && links >= 2 && badges >= 1) {
            readmeScore += 0.5;
            details.push("has examples and references");
        }
        
        scores.readme = Math.min(readmeScore, 1);
    }
    
    // CONTRIBUTING guide (0 or 1)
    scores.contributing = contributingText && contributingText.length > 100 ? 1 : 0;
    
    // Code of Conduct (0 or 1)
    scores.codeOfConduct = repo.codeOfConduct ? 1 : 0;
    
    // Releases (0-1) - graduated scoring based on number of releases
    const releaseCount = repo.releases?.totalCount || 0;
    if (releaseCount >= 5) {
        scores.releases = 1; // 5+ releases = excellent versioning
    } else if (releaseCount >= 2) {
        scores.releases = 0.7; // 2-4 releases = good versioning
    } else if (releaseCount >= 1) {
        scores.releases = 0.4; // 1 release = basic versioning
    } else {
        scores.releases = 0; // No releases
    }
    
    const avgScore = (scores.readme + scores.contributing + scores.codeOfConduct + scores.releases) / 4;
    
    return {
        score: avgScore,
        details: `README: ${readmeScore.toFixed(1)}, CoC: ${scores.codeOfConduct}, Releases: ${releaseCount}`,
        breakdown: scores
    };
}

/**
 * 2. MAINTENANCE & ACTIVITY SCORING (20%)
 * Evaluates recent commits, commit frequency, issue management, PR management
 */
function scoreMaintenance(repo, commitHistory) {
    const scores = {};
    const now = new Date();
    
    // Recent commits (0-1)
    const lastCommit = repo.pushedAt ? new Date(repo.pushedAt) : null;
    const daysSinceLastCommit = lastCommit ? Math.floor((now - lastCommit) / (1000 * 60 * 60 * 24)) : Infinity;
    
    if (daysSinceLastCommit <= 30) scores.recentCommits = 1;
    else if (daysSinceLastCommit <= 90) scores.recentCommits = 0.5;
    else scores.recentCommits = 0;
    
    // Commit frequency (0-1) - weekly commits over last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentCommits = commitHistory?.nodes?.filter(commit => 
        new Date(commit.committedDate) > threeMonthsAgo
    ) || [];
    const weeklyCommits = recentCommits.length / 12; // 12 weeks in 3 months
    scores.commitFrequency = Math.min(weeklyCommits / 2, 1); // normalize to 2 commits/week = 1.0
    
    // Issue management (0-1) - closed vs total issues
    const openIssues = repo.issues?.totalCount || 0;
    const closedIssues = repo.closedIssues?.totalCount || 0;
    const totalIssues = openIssues + closedIssues;
    scores.issueManagement = totalIssues > 0 ? closedIssues / totalIssues : 0.5;
    
    // PR management (0-1) - merged vs total PRs
    const openPRs = repo.pullRequests?.totalCount || 0;
    const mergedPRs = repo.mergedPullRequests?.totalCount || 0;
    const totalPRs = openPRs + mergedPRs;
    scores.prManagement = totalPRs > 0 ? mergedPRs / totalPRs : 0.5;
    
    const avgScore = (scores.recentCommits + scores.commitFrequency + scores.issueManagement + scores.prManagement) / 4;
    
    return {
        score: avgScore,
        details: `Last commit: ${daysSinceLastCommit}d ago, ${weeklyCommits.toFixed(1)} commits/week`,
        breakdown: scores
    };
}

/**
 * 3. QUALITY & TESTING SCORING (15%)
 * Evaluates CI pipeline, test coverage, linting, build status
 */
function scoreQuality(workflowData, repo) {
    const scores = {};
    
    // CI Pipeline presence (0 or 1)
    const hasWorkflows = workflowData?.repository?.object?.entries?.length > 0;
    scores.ciPipeline = hasWorkflows ? 1 : 0;
    
    // Test coverage (0-1) - would need to parse badges or use external API
    scores.testCoverage = 0; // Placeholder
    
    // Linting/Static analysis (0 or 1) - check for common config files
    scores.linting = 0; // Placeholder - would check for .eslintrc, .github/workflows with linting
    
    // Build status (0 or 1) - check for CI badges or successful workflows
    scores.buildStatus = hasWorkflows ? 0.5 : 0; // Partial credit for having workflows
    
    const avgScore = (scores.ciPipeline + scores.testCoverage + scores.linting + scores.buildStatus) / 4;
    
    return {
        score: avgScore,
        details: `CI: ${hasWorkflows ? 'Yes' : 'No'}, Workflows: ${workflowData?.repository?.object?.entries?.length || 0}`,
        breakdown: scores
    };
}

/**
 * 4. COMMUNITY & COLLABORATION SCORING (15%)
 * Evaluates contributors, discussions, issue response time
 */
function scoreCommunity(repo, commitHistory) {
    const scores = {};
    
    // Calculate unique contributors from commit history
    let contributorCount = 1; // Default to 1 (repo owner)
    
    if (commitHistory && commitHistory.nodes) {
        const uniqueContributors = new Set();
        
        commitHistory.nodes.forEach(commit => {
            const author = commit.author;
            if (author) {
                // Use GitHub username if available, otherwise email or name
                const identifier = author.user?.login || author.email || author.name;
                if (identifier) {
                    uniqueContributors.add(identifier.toLowerCase());
                }
            }
        });
        
        contributorCount = Math.max(uniqueContributors.size, 1);
    }
    
    // Unique contributors (0-1) - logarithmic scale: 1-5 contributors = 0-0.5, 5-50+ = 0.5-1.0
    scores.contributors = normalizeLog(contributorCount, 1, 50, 2);
    
    // Discussions/Wiki present (0 or 1)
    scores.discussions = (repo.hasDiscussionsEnabled || repo.hasWikiEnabled) ? 1 : 0;
    
    // Issue response time (0-1) - placeholder, would need issue timeline data
    scores.responseTime = 0.5; // Default neutral score
    
    // Community health (0 or 1)
    scores.communityHealth = repo.codeOfConduct ? 1 : 0;
    
    const avgScore = (scores.contributors + scores.discussions + scores.responseTime + scores.communityHealth) / 4;
    
    return {
        score: avgScore,
        details: `${contributorCount} active contributors, Discussions: ${repo.hasDiscussionsEnabled ? 'Yes' : 'No'}`,
        breakdown: scores
    };
}

/**
 * 5. POPULARITY & REACH SCORING (15%)
 * Evaluates stars, forks, watchers, downloads
 */
function scorePopularity(repo) {
    const scores = {};
    
    // Stars normalized (0-1) - logarithmic scale, cap at 1000+ stars
    scores.stars = normalizeLog(repo.stargazerCount || 0, 0, 1000);
    
    // Forks normalized (0-1) - logarithmic scale, cap at 100+ forks
    scores.forks = normalizeLog(repo.forkCount || 0, 0, 100);
    
    // Watchers (0-1) - linear scale, cap at 50+ watchers
    scores.watchers = normalizeLinear(repo.watchers?.totalCount || 0, 0, 50);
    
    // Downloads/Usage (0-1) - placeholder for npm/PyPI downloads
    scores.downloads = 0.5; // Default neutral score
    
    const avgScore = (scores.stars + scores.forks + scores.watchers + scores.downloads) / 4;
    
    return {
        score: avgScore,
        details: `${repo.stargazerCount || 0} stars, ${repo.forkCount || 0} forks, ${repo.watchers?.totalCount || 0} watchers`,
        breakdown: scores
    };
}

/**
 * 6. SECURITY & DEPENDENCY HEALTH SCORING (15%)
 * Evaluates vulnerability alerts, dependency updates, signed commits
 */
function scoreSecurity(repo) {
    const scores = {};
    
    // Vulnerability alerts/Dependabot (0 or 1)
    scores.vulnerabilityAlerts = repo.hasVulnerabilityAlertsEnabled ? 1 : 0;
    
    // Up-to-date dependencies (0-1) - placeholder, would need to analyze package files
    scores.dependencyHealth = 0.5; // Default neutral score
    
    // Signed commits (0 or 1) - placeholder, would need commit signature data
    scores.signedCommits = 0; // Default to 0
    
    // Security best practices (0 or 1) - check for security policy, etc.
    scores.securityPractices = repo.securityPolicyUrl ? 1 : 0;
    
    const avgScore = (scores.vulnerabilityAlerts + scores.dependencyHealth + scores.signedCommits + scores.securityPractices) / 4;
    
    return {
        score: avgScore,
        details: `Vulnerability alerts: ${repo.hasVulnerabilityAlertsEnabled ? 'Enabled' : 'Disabled'}`,
        breakdown: scores
    };
}

/**
 * Calculate overall repository score with comprehensive weighted metrics
 * Returns a score from 0-10 with detailed breakdown by category
 */
function calculateRepositoryScore(repoData, workflowData) {
    const repo = repoData.repository;
    const readmeText = repo.object?.text || repo.readmeObject?.text;
    const contributingText = repo.contributingObject?.text;
    const commitHistory = repo.defaultBranchRef?.target?.history;

    // Calculate scores for each category (each returns 0-1)
    const documentation = scoreDocumentation(repo, readmeText, contributingText);
    const maintenance = scoreMaintenance(repo, commitHistory);
    const quality = scoreQuality(workflowData, repo);
    const community = scoreCommunity(repo, commitHistory);
    const popularity = scorePopularity(repo);
    const security = scoreSecurity(repo);

    // Calculate weighted final score (0-1)
    const weightedScore = 
        documentation.score * CATEGORY_WEIGHTS.documentation +
        maintenance.score * CATEGORY_WEIGHTS.maintenance +
        quality.score * CATEGORY_WEIGHTS.quality +
        community.score * CATEGORY_WEIGHTS.community +
        popularity.score * CATEGORY_WEIGHTS.popularity +
        security.score * CATEGORY_WEIGHTS.security;

    // Convert to 0-10 scale
    const finalScore = Math.round(weightedScore * 10 * 10) / 10;

    // Create detailed breakdown for display
    const breakdown = {
        documentation: {
            score: Math.round(documentation.score * 10 * 10) / 10,
            details: documentation.details,
            weight: CATEGORY_WEIGHTS.documentation
        },
        maintenance: {
            score: Math.round(maintenance.score * 10 * 10) / 10,
            details: maintenance.details,
            weight: CATEGORY_WEIGHTS.maintenance
        },
        quality: {
            score: Math.round(quality.score * 10 * 10) / 10,
            details: quality.details,
            weight: CATEGORY_WEIGHTS.quality
        },
        community: {
            score: Math.round(community.score * 10 * 10) / 10,
            details: community.details,
            weight: CATEGORY_WEIGHTS.community
        },
        popularity: {
            score: Math.round(popularity.score * 10 * 10) / 10,
            details: popularity.details,
            weight: CATEGORY_WEIGHTS.popularity
        },
        security: {
            score: Math.round(security.score * 10 * 10) / 10,
            details: security.details,
            weight: CATEGORY_WEIGHTS.security
        }
    };

    return {
        score: Math.min(finalScore, 10),
        breakdown,
        repository: {
            name: repo.name,
            description: repo.description,
            url: repo.url,
            stars: repo.stargazerCount,
            forks: repo.forkCount,
            language: repo.languages?.edges?.[0]?.node?.name || "Unknown",
            updatedAt: repo.updatedAt,
            pushedAt: repo.pushedAt,
            hasIssuesEnabled: repo.hasIssuesEnabled,
            hasWikiEnabled: repo.hasWikiEnabled,
            hasDiscussionsEnabled: repo.hasDiscussionsEnabled,
        },
        metadata: {
            scoringVersion: "2.0",
            categories: Object.keys(CATEGORY_WEIGHTS),
            weights: CATEGORY_WEIGHTS,
            calculatedAt: new Date().toISOString()
        }
    };
}

module.exports = {
    calculateRepositoryScore,
};
