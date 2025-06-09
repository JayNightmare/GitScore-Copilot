/**
 * Unit tests for repository scoring algorithm
 * Tests individual metric calculations and overall scoring logic
 */

const { calculateRepositoryScore } = require("../lib/scoring.js");

describe("Repository Scoring", () => {
    const mockRepoData = {
        repository: {
            name: "test-repo",
            description: "A test repository",
            url: "https://github.com/test/test-repo",
            stargazerCount: 100,
            forkCount: 20,
            pushedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            licenseInfo: {
                name: "MIT License",
                key: "mit",
            },
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
                                author: { name: "Test" },
                            },
                            {
                                committedDate: new Date(
                                    Date.now() - 86400000
                                ).toISOString(),
                                author: { name: "Test" },
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
\`\`\`

## Contributing

Please read our contributing guidelines.

## License

MIT License`,
            },
            hasIssuesEnabled: true,
            hasWikiEnabled: true,
            hasProjectsEnabled: true,
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

    test("includes all expected breakdown metrics", () => {
        const result = calculateRepositoryScore(mockRepoData, mockWorkflowData);

        const expectedMetrics = [
            "readme",
            "license",
            "stars",
            "forks",
            "commits",
            "workflows",
            "issues",
            "topics",
            "languages",
            "freshness",
        ];

        expectedMetrics.forEach((metric) => {
            expect(result.breakdown).toHaveProperty(metric);
            expect(result.breakdown[metric]).toHaveProperty("score");
            expect(result.breakdown[metric]).toHaveProperty("details");
            expect(result.breakdown[metric]).toHaveProperty("weight");
        });
    });

    test("scores README quality correctly", () => {
        const result = calculateRepositoryScore(mockRepoData, mockWorkflowData);
        const readmeScore = result.breakdown.readme.score;

        expect(readmeScore).toBeGreaterThan(2); // Should score reasonably for the test README
        expect(readmeScore).toBeLessThanOrEqual(10);
    });

    test("scores license correctly", () => {
        const result = calculateRepositoryScore(mockRepoData, mockWorkflowData);
        const licenseScore = result.breakdown.license.score;

        expect(licenseScore).toBe(10); // MIT is a popular license
    });

    test("handles repository without README", () => {
        const dataWithoutReadme = {
            ...mockRepoData,
            repository: {
                ...mockRepoData.repository,
                object: null,
                readmeObject: null,
            },
        };

        const result = calculateRepositoryScore(
            dataWithoutReadme,
            mockWorkflowData
        );
        expect(result.breakdown.readme.score).toBe(0);
    });

    test("handles repository without license", () => {
        const dataWithoutLicense = {
            ...mockRepoData,
            repository: {
                ...mockRepoData.repository,
                licenseInfo: null,
            },
        };

        const result = calculateRepositoryScore(
            dataWithoutLicense,
            mockWorkflowData
        );
        expect(result.breakdown.license.score).toBe(0);
    });

    test("handles repository without workflows", () => {
        const result = calculateRepositoryScore(mockRepoData, null);
        expect(result.breakdown.workflows.score).toBe(0);
    });

    test("scores stars on logarithmic scale", () => {
        const highStarData = {
            ...mockRepoData,
            repository: {
                ...mockRepoData.repository,
                stargazerCount: 10000,
            },
        };

        const result = calculateRepositoryScore(highStarData, mockWorkflowData);
        expect(result.breakdown.stars.score).toBe(10);
    });

    test("penalizes stale repositories", () => {
        const staleData = {
            ...mockRepoData,
            repository: {
                ...mockRepoData.repository,
                pushedAt: new Date(
                    Date.now() - 365 * 24 * 60 * 60 * 1000 * 2
                ).toISOString(), // 2 years ago
            },
        };

        const result = calculateRepositoryScore(staleData, mockWorkflowData);
        expect(result.breakdown.freshness.score).toBeLessThan(3);
    });

    test("rewards recent activity", () => {
        const result = calculateRepositoryScore(mockRepoData, mockWorkflowData);
        expect(result.breakdown.freshness.score).toBeGreaterThan(8); // Recently updated
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
