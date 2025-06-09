/**
 * Unit tests for repository scoring algorithm
 * Tests individual category calculations and overall scoring logic
 */

const { calculateRepositoryScore } = require("../lib/scoring.js");

describe("Repository Scoring v2.0", () => {
    const mockRepoData = {
        repository: {
            name: "test-repo",
            description: "A test repository for testing purposes",
            url: "https://github.com/test/test-repo",
            stargazerCount: 150,
            forkCount: 25,
            pushedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            watchers: { totalCount: 10 },
            issues: { totalCount: 5 },
            closedIssues: { totalCount: 20 },
            pullRequests: { totalCount: 2 },
            mergedPullRequests: { totalCount: 8 },
            releases: { totalCount: 3 },
            licenseInfo: {
                name: "MIT License",
                key: "mit",
            },
            codeOfConduct: {
                name: "Contributor Covenant",
                key: "contributor_covenant"
            },
            securityPolicyUrl: "https://github.com/test/test-repo/security/policy",
            repositoryTopics: {
                nodes: [
                    { topic: { name: "javascript" } },
                    { topic: { name: "react" } },
                ],
            },
            languages: {
                edges: [
                    { node: { name: "JavaScript" }, size: 1000 },
                    { node: { name: "CSS" }, size: 500 },
                ],
            },
            defaultBranchRef: {
                target: {
                    history: {
                        totalCount: 150,
                        nodes: [
                            {
                                committedDate: new Date().toISOString(),
                                author: { 
                                    name: "Alice Developer",
                                    email: "alice@example.com",
                                    user: { login: "alice-dev" }
                                },
                                signature: { isValid: true }
                            },
                            {
                                committedDate: new Date(
                                    Date.now() - 86400000
                                ).toISOString(),
                                author: { 
                                    name: "Bob Contributor",
                                    email: "bob@example.com",
                                    user: { login: "bob-contrib" }
                                },
                                signature: { isValid: false }
                            },
                            {
                                committedDate: new Date(
                                    Date.now() - 2 * 86400000
                                ).toISOString(),
                                author: { 
                                    name: "Charlie Coder",
                                    email: "charlie@example.com",
                                    user: { login: "charlie-codes" }
                                },
                                signature: { isValid: true }
                            },
                        ],
                    },
                },
            },
            object: {
                text: `# Test Repository

This is a comprehensive test repository with multiple sections.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`javascript
const test = require('./test');
test.run();
\`\`\`

## Contributing

Please read our contributing guidelines.

## License

MIT License`,
            },
            contributingObject: {
                text: `# Contributing Guidelines

We welcome contributions to this project! Please follow these guidelines:

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Code Style

Please follow our code style guidelines.`
            },
            hasIssuesEnabled: true,
            hasWikiEnabled: true,
            hasProjectsEnabled: true,
            hasDiscussionsEnabled: true,
            hasVulnerabilityAlertsEnabled: true,
        },
    };

    const mockWorkflowData = {
        repository: {
            object: {
                entries: [
                    { name: "ci.yml", type: "blob" },
                    { name: "deploy.yml", type: "blob" },
                ],
            },
        },
    };

    test("calculates overall score correctly", () => {
        const result = calculateRepositoryScore(mockRepoData, mockWorkflowData);

        expect(result).toHaveProperty("score");
        expect(result).toHaveProperty("breakdown");
        expect(result).toHaveProperty("repository");

        expect(result.score).toBeGreaterThan(0);
        expect(result.score).toBeLessThanOrEqual(10);
        expect(typeof result.score).toBe("number");
    });

    test("includes all expected breakdown categories", () => {
        const result = calculateRepositoryScore(mockRepoData, mockWorkflowData);

        const expectedCategories = [
            "documentation",
            "maintenance", 
            "quality",
            "community",
            "popularity",
            "security"
        ];

        expectedCategories.forEach((category) => {
            expect(result.breakdown).toHaveProperty(category);
            expect(result.breakdown[category]).toHaveProperty("score");
            expect(result.breakdown[category]).toHaveProperty("details");
            expect(result.breakdown[category]).toHaveProperty("weight");
            expect(result.breakdown[category].score).toBeGreaterThanOrEqual(0);
            expect(result.breakdown[category].score).toBeLessThanOrEqual(10);
        });
    });

    test("includes metadata about scoring version", () => {
        const result = calculateRepositoryScore(mockRepoData, mockWorkflowData);
        
        expect(result.metadata).toHaveProperty("scoringVersion");
        expect(result.metadata).toHaveProperty("categories");
        expect(result.metadata).toHaveProperty("weights");
        expect(result.metadata).toHaveProperty("calculatedAt");
        expect(result.metadata.scoringVersion).toBe("2.0");
    });

    test("scores documentation category correctly", () => {
        const result = calculateRepositoryScore(mockRepoData, mockWorkflowData);
        const docScore = result.breakdown.documentation.score;

        // Documentation should score well with good README, CoC, and releases
        expect(docScore).toBeGreaterThan(2); // Should score reasonably for the test README
        expect(docScore).toBeLessThanOrEqual(10);
    });

    test("scores maintenance category correctly", () => {
        const result = calculateRepositoryScore(mockRepoData, mockWorkflowData);
        const maintenanceScore = result.breakdown.maintenance.score;

        // Should score well with recent commits and good issue/PR management
        expect(maintenanceScore).toBeGreaterThan(0);
        expect(maintenanceScore).toBeLessThanOrEqual(10);
    });

    test("scores popularity category correctly", () => {
        const result = calculateRepositoryScore(mockRepoData, mockWorkflowData);
        const popularityScore = result.breakdown.popularity.score;

        // Should score based on stars, forks, watchers
        expect(popularityScore).toBeGreaterThan(0);
        expect(popularityScore).toBeLessThanOrEqual(10);
    });

    test("handles repository without README", () => {
        const dataWithoutReadme = {
            ...mockRepoData,
            repository: {
                ...mockRepoData.repository,
                object: null,
                readmeObject: null,
                contributingObject: null,
            },
        };

        const result = calculateRepositoryScore(
            dataWithoutReadme,
            mockWorkflowData
        );
        // Documentation score should be lower without README, CONTRIBUTING, and Releases
        expect(result.breakdown.documentation.score).toBeLessThan(5);
    });

    test("handles repository without workflows", () => {
        const dataWithoutWorkflows = {
            repository: {
                object: {
                    entries: [],
                },
            },
        };

        const result = calculateRepositoryScore(
            mockRepoData,
            dataWithoutWorkflows
        );
        // Quality score should be lower without CI/CD
        expect(result.breakdown.quality.score).toBeLessThan(7);
    });

    test("handles repository with high popularity metrics", () => {
        const highPopularityData = {
            ...mockRepoData,
            repository: {
                ...mockRepoData.repository,
                stargazerCount: 5000,
                forkCount: 500,
                watchers: { totalCount: 100 }
            },
        };

        const result = calculateRepositoryScore(highPopularityData, mockWorkflowData);
        expect(result.breakdown.popularity.score).toBeGreaterThan(7);
    });

    test("rewards repositories with good community features", () => {
        const result = calculateRepositoryScore(mockRepoData, mockWorkflowData);
        const communityScore = result.breakdown.community.score;
        
        // Should score well with multiple contributors, discussions, and CoC
        expect(communityScore).toBeGreaterThan(3);
        expect(communityScore).toBeLessThanOrEqual(10);
    });

    test("validates score bounds", () => {
        const result = calculateRepositoryScore(mockRepoData, mockWorkflowData);

        // Overall score should be between 0 and 10
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(10);

        // All individual scores should be between 0 and 10
        Object.values(result.breakdown).forEach((metric) => {
            expect(metric.score).toBeGreaterThanOrEqual(0);
            expect(metric.score).toBeLessThanOrEqual(10);
        });
    });
});
