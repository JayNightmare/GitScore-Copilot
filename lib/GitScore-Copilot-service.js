/**
 * Client-side GitHub scoring service
 * Handles direct API calls to GitHub GraphQL and local storage caching
 */

import { graphql } from "@octokit/graphql";
import { checkScopes } from "./github.js";


class GitHubScorerService {
    constructor() {
        this.githubGraphQL = null;
        this.tokenValidation = null; // Store token validation results
    }

    // Initialize with GitHub token (from user input or environment)
    async initialize(token) {
      console.log("🔑 Initializing GitHub API client...");
      
      if (!token || token.trim().length === 0) {
        throw new Error("GitHub token is required to access repository data.");
      }

      // Validate token format
      if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
        console.warn("⚠️  Token format doesn't match expected GitHub personal access token format.");
      }

      const { ok, scopes, extras } = await checkScopes(token);

      // Store validation results for UI access
      this.tokenValidation = {
        isValid: true,
        hasExtraPermissions: !ok && extras.length > 0,
        scopes,
        extras,
        hasMinimalPermissions: ok
      };

      // Check if token has required permissions
      const hasRequiredPermissions = scopes.includes("repo") || scopes.includes("public_repo");
      
      if (!hasRequiredPermissions) {
        this.tokenValidation.isValid = false;
        throw new Error(
          "Token must have 'repo' or 'public_repo' permissions to access repository data. " +
          `Current scopes: ${scopes.length > 0 ? scopes.join(', ') : 'none'}`
        );
      }

      // Provide feedback on token permissions
      if (scopes.includes("repo")) {
        console.log("✅ Token has 'repo' scope - can access public and private repositories");
      } else if (scopes.includes("public_repo")) {
        console.log("✅ Token has 'public_repo' scope - can access public repositories");
      }

      if (!ok && extras.length > 0) {
        console.warn(
          `⚠️  Token has extra permissions you don't really need: ${extras.join(
            ", "
          )}. Consider using a narrower-scoped token for better security.`
        );
      } else {
        console.log("✅ Token has minimal required permissions - excellent security practice!");
      }
      
      this.githubGraphQL = graphql.defaults({
        headers: { authorization: `token ${token}` },
      });

      console.log("🚀 GitHub API client initialized successfully");
    }

    // Get token validation status
    getTokenValidation() {
      return this.tokenValidation;
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
    }    // Fetch repository data from GitHub
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
          issues(states: OPEN) {
            totalCount
          }
          closedIssues: issues(states: CLOSED) {
            totalCount
          }
          pullRequests(states: OPEN) {
            totalCount
          }
          mergedPullRequests: pullRequests(states: MERGED) {
            totalCount
          }          releases {
            totalCount
          }
          licenseInfo {
            name
            key
          }
          codeOfConduct {
            name
            key
          }
          securityPolicyUrl
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
                history(first: 100) {
                  totalCount
                  nodes {
                    committedDate
                    author {
                      name
                      email
                      user {
                        login
                      }
                    }
                    signature {
                      isValid
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
          }          contributingObject: object(expression: "HEAD:CONTRIBUTING.md") {
            ... on Blob {
              text
            }
          }
          hasIssuesEnabled
          hasWikiEnabled
          hasProjectsEnabled
          hasDiscussionsEnabled
          hasVulnerabilityAlertsEnabled
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
        const { calculateRepositoryScore } = await import("./scoring.js");
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

const gitHubScorerServiceInstance = new GitHubScorerService();
export default gitHubScorerServiceInstance;
