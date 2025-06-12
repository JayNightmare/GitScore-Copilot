/**
 * GitHub GraphQL API client for fetching repository and user data
 * Uses @octokit/graphql with authentication token from environment
 */

const { graphql } = require("@octokit/graphql");

const githubGraphQL = graphql.defaults({
    headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
});

async function checkScopes(token) {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${token}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Invalid GitHub token. Please check your token and try again.");
      } else if (res.status === 403) {
        throw new Error("Token access forbidden. Your token may be expired or revoked.");
      } else {
        throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
      }
    }

    const raw = res.headers.get("x-oauth-scopes") || "";
    const scopes = raw.split(",").map((s) => s.trim().toLowerCase()).filter(s => s.length > 0);
    const allowed = new Set(["repo", "public_repo"]);

    const extras = scopes.filter((s) => !allowed.has(s));

    return {
      ok: extras.length === 0,
      scopes,
      extras,
    };
  } catch (error) {
    if (error.message.includes("GitHub API error") || error.message.includes("Invalid") || error.message.includes("forbidden")) {
      throw error;
    }
    throw new Error(`Failed to validate token: ${error.message}`);
  }
}

/**
 * Fetch comprehensive repository data including metrics for scoring
 */
async function fetchRepositoryData(owner, repo) {
    try {
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
          }
          releases {
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
                history(first: 50) {
                  totalCount
                  nodes {
                    committedDate
                    author {
                      name
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

        const result = await githubGraphQL(query, { owner, repo });
        return result;
    } catch (error) {
        console.error("GitHub API Error:", error);
        throw new Error(`Failed to fetch repository data: ${error.message}`);
    }
}

/**
 * Fetch user/organization data for additional context
 */
async function fetchUserData(login) {
    try {
        const query = `
      query($login: String!) {
        user(login: $login) {
          name
          login
          bio
          company
          location
          email
          websiteUrl
          twitterUsername
          createdAt
          followers {
            totalCount
          }
          following {
            totalCount
          }
          repositories {
            totalCount
          }
          contributionsCollection {
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
          }
        }
        organization(login: $login) {
          name
          login
          description
          websiteUrl
          email
          createdAt
          membersWithRole {
            totalCount
          }
          repositories {
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

        const result = await githubGraphQL(query, { login });
        return result;
    } catch (error) {
        console.error("GitHub User API Error:", error);
        return null;
    }
}

/**
 * Check if repository has CI/CD workflows
 */
async function fetchWorkflowData(owner, repo) {
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

        const result = await githubGraphQL(query, { owner, repo });
        return result;
    } catch (error) {
        console.error("GitHub Workflow API Error:", error);
        return null;
    }
}

module.exports = {
    fetchRepositoryData,
    fetchUserData,
    fetchWorkflowData,
    checkScopes
};
