/**
 * Repository scoring algorithm that calculates weighted scores based on various metrics
 * Returns normalized 0-10 score with detailed breakdown of contributing factors
 */

/**
 * Scoring weights for different repository metrics
 */
const WEIGHTS = {
    readme: 2.0, // Documentation quality
    license: 1.5, // Legal compliance
    stars: 1.8, // Community popularity
    forks: 1.2, // Developer interest
    commits: 1.5, // Development activity
    workflows: 2.0, // CI/CD practices
    issues: 0.8, // Community engagement
    topics: 1.0, // Discoverability
    languages: 1.0, // Technical diversity
    freshness: 1.3, // Recent activity
};

/**
 * Calculate README quality score (0-10)
 */
function scoreReadme(readmeText) {
    if (!readmeText) return { score: 0, details: "No README found" };

    const length = readmeText.length;
    const sections = (readmeText.match(/#{1,6}\s/g) || []).length;
    const codeBlocks = (readmeText.match(/```/g) || []).length / 2;
    const links = (readmeText.match(/\[.*?\]\(.*?\)/g) || []).length;
    const badges = (readmeText.match(/!\[.*?\]\(.*?\)/g) || []).length;

    let score = 0;
    const details = [];

    // Length scoring
    if (length > 5000) {
        score += 3;
        details.push("Comprehensive documentation");
    } else if (length > 2000) {
        score += 2;
        details.push("Good documentation length");
    } else if (length > 500) {
        score += 1;
        details.push("Basic documentation");
    } else {
        details.push("Documentation too brief");
    }

    // Structure scoring
    if (sections >= 5) {
        score += 2;
        details.push("Well-structured sections");
    } else if (sections >= 3) {
        score += 1;
        details.push("Some structure");
    }

    // Code examples
    if (codeBlocks >= 3) {
        score += 2;
        details.push("Good code examples");
    } else if (codeBlocks >= 1) {
        score += 1;
        details.push("Some code examples");
    }

    // Links and references
    if (links >= 3) {
        score += 1;
        details.push("External references");
    }

    // Badges (CI, version, etc.)
    if (badges >= 2) {
        score += 2;
        details.push("Status badges present");
    } else if (badges >= 1) {
        score += 1;
        details.push("Some badges");
    }

    return { score: Math.min(score, 10), details: details.join(", ") };
}

/**
 * Calculate license score (0-10)
 */
function scoreLicense(licenseInfo) {
    if (!licenseInfo) return { score: 0, details: "No license" };

    const popularLicenses = [
        "mit",
        "apache-2.0",
        "gpl-3.0",
        "bsd-3-clause",
        "bsd-2-clause",
    ];
    const isPopular = popularLicenses.includes(licenseInfo.key);

    return {
        score: isPopular ? 10 : 7,
        details: `${licenseInfo.name}${isPopular ? " (popular)" : ""}`,
    };
}

/**
 * Calculate popularity score based on stars (0-10)
 */
function scoreStars(starCount) {
    if (starCount === 0) return { score: 0, details: "No stars" };

    // Logarithmic scaling for stars
    let score;
    if (starCount >= 10000) score = 10;
    else if (starCount >= 5000) score = 9;
    else if (starCount >= 1000) score = 8;
    else if (starCount >= 500) score = 7;
    else if (starCount >= 100) score = 6;
    else if (starCount >= 50) score = 5;
    else if (starCount >= 20) score = 4;
    else if (starCount >= 10) score = 3;
    else if (starCount >= 5) score = 2;
    else score = 1;

    return { score, details: `${starCount} stars` };
}

/**
 * Calculate development activity score (0-10)
 */
function scoreCommits(commitHistory) {
    if (!commitHistory || commitHistory.totalCount === 0) {
        return { score: 0, details: "No commits" };
    }

    const totalCommits = commitHistory.totalCount;
    const recentCommits = commitHistory.nodes || [];

    // Check recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = recentCommits.filter(
        (commit) => new Date(commit.committedDate) > thirtyDaysAgo
    ).length;

    let score = Math.min(Math.log10(totalCommits + 1) * 2, 7);

    // Bonus for recent activity
    if (recentActivity >= 5) score += 3;
    else if (recentActivity >= 2) score += 2;
    else if (recentActivity >= 1) score += 1;

    return {
        score: Math.min(score, 10),
        details: `${totalCommits} total commits, ${recentActivity} recent`,
    };
}

/**
 * Calculate CI/CD workflow score (0-10)
 */
function scoreWorkflows(workflowData) {
    if (!workflowData?.repository?.object?.entries) {
        return { score: 0, details: "No CI/CD workflows" };
    }

    const workflows = workflowData.repository.object.entries;
    const workflowCount = workflows.length;

    if (workflowCount === 0) return { score: 0, details: "No workflows" };

    const score = Math.min(workflowCount * 3, 10);
    return { score, details: `${workflowCount} workflow(s)` };
}

/**
 * Calculate freshness score based on recent activity (0-10)
 */
function scoreFreshness(pushedAt, updatedAt) {
    const now = new Date();
    const lastPush = new Date(pushedAt);
    const daysSinceUpdate = Math.floor(
        (now - lastPush) / (1000 * 60 * 60 * 24)
    );

    let score;
    if (daysSinceUpdate <= 7) score = 10;
    else if (daysSinceUpdate <= 30) score = 8;
    else if (daysSinceUpdate <= 90) score = 6;
    else if (daysSinceUpdate <= 180) score = 4;
    else if (daysSinceUpdate <= 365) score = 2;
    else score = 0;

    return { score, details: `Updated ${daysSinceUpdate} days ago` };
}

/**
 * Calculate overall repository score with weighted metrics
 */
function calculateRepositoryScore(repoData, workflowData) {
    const repo = repoData.repository;

    // Calculate individual metric scores
    const readmeText = repo.object?.text || repo.readmeObject?.text;
    const readmeScore = scoreReadme(readmeText);
    const licenseScore = scoreLicense(repo.licenseInfo);
    const starsScore = scoreStars(repo.stargazerCount);
    const forksScore = scoreStars(repo.forkCount); // Use same scaling
    const commitsScore = scoreCommits(repo.defaultBranchRef?.target?.history);
    const workflowsScore = scoreWorkflows(workflowData);
    const freshnessScore = scoreFreshness(repo.pushedAt, repo.updatedAt);

    // Simple scores for other metrics
    const topicsScore = {
        score: Math.min((repo.repositoryTopics?.nodes?.length || 0) * 2, 10),
        details: `${repo.repositoryTopics?.nodes?.length || 0} topics`,
    };

    const languagesScore = {
        score: Math.min((repo.languages?.edges?.length || 0) * 2, 10),
        details: `${repo.languages?.edges?.length || 0} languages`,
    };

    const issuesScore = {
        score: repo.hasIssuesEnabled ? 5 : 0,
        details: repo.hasIssuesEnabled ? "Issues enabled" : "Issues disabled",
    };

    // Calculate weighted total
    const metrics = {
        readme: { ...readmeScore, weight: WEIGHTS.readme },
        license: { ...licenseScore, weight: WEIGHTS.license },
        stars: { ...starsScore, weight: WEIGHTS.stars },
        forks: { ...forksScore, weight: WEIGHTS.forks },
        commits: { ...commitsScore, weight: WEIGHTS.commits },
        workflows: { ...workflowsScore, weight: WEIGHTS.workflows },
        issues: { ...issuesScore, weight: WEIGHTS.issues },
        topics: { ...topicsScore, weight: WEIGHTS.topics },
        languages: { ...languagesScore, weight: WEIGHTS.languages },
        freshness: { ...freshnessScore, weight: WEIGHTS.freshness },
    };

    const totalWeight = Object.values(WEIGHTS).reduce(
        (sum, weight) => sum + weight,
        0
    );
    const weightedSum = Object.entries(metrics).reduce((sum, [key, metric]) => {
        return sum + metric.score * metric.weight;
    }, 0);

    const finalScore = Math.round((weightedSum / totalWeight) * 100) / 100;

    return {
        score: Math.min(finalScore, 10),
        breakdown: metrics,
        repository: {
            name: repo.name,
            description: repo.description,
            url: repo.url,
            stars: repo.stargazerCount,
            forks: repo.forkCount,
            language: repo.languages?.edges?.[0]?.node?.name || "Unknown",
            updatedAt: repo.updatedAt,
        },
    };
}

module.exports = {
    calculateRepositoryScore,
};
