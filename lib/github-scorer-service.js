/**
 * Client-side GitHub scoring service
 * Handles direct API calls to GitHub GraphQL and local storage caching
 */

import { graphql } from "@octokit/graphql";

class GitHubScorerService {
    constructor() {
        this.githubGraphQL = null;
    }

    // Initialize with GitHub token (from user input or environment)
    initialize(token) {
        this.githubGraphQL = graphql.defaults({
            headers: {
                authorization: `token ${token}`,
            },
        });
    }

    // Get cached score from localStorage
    getCachedScore(owner, repo) {
        try {
            const key = `github-score-${owner}-${repo}`;
            const cached = localStorage.getItem(key);
            if (cached) {
                const data = JSON.parse(cached);
                // Check if cache is less than 1 hour old
                const cacheAge = Date.now() - data.timestamp;
                if (cacheAge < 3600000) {
                    // 1 hour
                    return data;
                }
            }
            return null;
        } catch (error) {
            console.error("Cache retrieval error:", error);
            return null;
        }
    }

    // Cache score in localStorage
    cacheScore(owner, repo, scoreData) {
        try {
            const key = `github-score-${owner}-${repo}`;
            const data = {
                ...scoreData,
                timestamp: Date.now(),
            };
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error("Cache storage error:", error);
            return false;
        }
    }

    // Fetch repository data from GitHub
    async fetchRepositoryData(owner, repo) {
        if (!this.githubGraphQL) {
            throw new Error("Service not initialized with GitHub token");
        }

        const query = `
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          name
          description
          url
          isPrivate
          createdAt
          updatedAt
          pushedAt
          stargazerCount
          forkCount
          watchers {
            totalCount
          }
          issues {
            totalCount
          }
          pullRequests {
            totalCount
          }
          releases {
            totalCount
          }
          licenseInfo {
            name
            key
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 10) {
                  totalCount
                  nodes {
                    committedDate
                    author {
                      name
                    }
                  }
                }
              }
            }
          }
          object(expression: "HEAD:README.md") {
            ... on Blob {
              text
            }
          }
          readmeObject: object(expression: "HEAD:README.rst") {
            ... on Blob {
              text
            }
          }
          hasIssuesEnabled
          hasWikiEnabled
          hasProjectsEnabled
          vulnerabilityAlerts {
            totalCount
          }
        }
        rateLimit {
          limit
          cost
          remaining
          resetAt
        }
      }
    `;

        return await this.githubGraphQL(query, { owner, repo });
    }

    // Fetch workflow data
    async fetchWorkflowData(owner, repo) {
        if (!this.githubGraphQL) {
            throw new Error("Service not initialized with GitHub token");
        }

        try {
            const query = `
        query($owner: String!, $repo: String!) {
          repository(owner: $owner, name: $repo) {
            object(expression: "HEAD:.github/workflows") {
              ... on Tree {
                entries {
                  name
                  type
                }
              }
            }
          }
        }
      `;

            return await this.githubGraphQL(query, { owner, repo });
        } catch (error) {
            console.error("GitHub Workflow API Error:", error);
            return null;
        }
    }

    // Calculate repository score
    async calculateScore(owner, repo) {
        // Check cache first
        const cached = this.getCachedScore(owner, repo);
        if (cached) {
            return {
                ...cached,
                cached: true,
                cacheAge: Math.floor(
                    (Date.now() - cached.timestamp) / 1000 / 60
                ), // minutes
            };
        }

        // Fetch fresh data
        const [repoData, workflowData] = await Promise.all([
            this.fetchRepositoryData(owner, repo),
            this.fetchWorkflowData(owner, repo),
        ]);

        if (!repoData?.repository) {
            throw new Error("Repository not found");
        }

        // Import and use scoring logic
        const { calculateRepositoryScore } = await import("../lib/scoring.js");
        const scoreResult = calculateRepositoryScore(repoData, workflowData);

        const responseData = {
            owner,
            repo,
            ...scoreResult,
            cached: false,
            generatedAt: new Date().toISOString(),
            rateLimit: repoData.rateLimit,
        };

        // Cache the result
        this.cacheScore(owner, repo, responseData);

        return responseData;
    }
}

export default new GitHubScorerService();
