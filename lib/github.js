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
};
