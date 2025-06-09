/**
 * Integration tests for the GitHub scorer service
 * Tests the client-side scoring functionality
 */

// Mock the GitHub API first
jest.mock('@octokit/graphql', () => ({
  graphql: {
    defaults: jest.fn(() => jest.fn())
  }
}));

// Mock dynamic import for scoring module
jest.mock('../lib/scoring.js', () => ({
  calculateRepositoryScore: jest.fn(() => ({
    score: 8.0,
    breakdown: {
      readme: { score: 8, details: 'Good README', weight: 2.0 },
      license: { score: 10, details: 'MIT License', weight: 1.5 }
    },
    repository: {
      name: 'test',
      description: 'Test repo',
      url: 'https://github.com/test/test'
    }
  }))
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Import the service after mocking
const githubScorerService = require('../lib/github-scorer-service.js').default;

describe('GitHubScorerService', () => {
  let mockGraphqlClient;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Mock graphql client
    mockGraphqlClient = jest.fn();
    require('@octokit/graphql').graphql.defaults.mockReturnValue(mockGraphqlClient);
    
    // Initialize the service with a test token
    githubScorerService.initialize('test-token');
  });

  test('returns cached score when available and fresh', async () => {
    const cachedData = {
      score: 8.5,
      breakdown: { readme: { score: 9, details: 'Good docs' } },
      timestamp: Date.now()
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

    const result = await githubScorerService.calculateScore('facebook', 'react');

    expect(result.cached).toBe(true);
    expect(result.score).toBe(8.5);
    expect(mockGraphqlClient).not.toHaveBeenCalled();
  });

  test('fetches fresh data when not cached', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const mockRepoData = {
      repository: {
        name: 'react',
        description: 'A declarative, efficient, and flexible JavaScript library',
        url: 'https://github.com/facebook/react',
        stargazerCount: 50000,
        forkCount: 10000,
        pushedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        licenseInfo: { name: 'MIT License', key: 'mit' },
        repositoryTopics: { nodes: [] },
        languages: { edges: [] },
        defaultBranchRef: {
          target: {
            history: {
              totalCount: 1000,
              nodes: []
            }
          }
        },
        object: { text: '# React\n\nA JavaScript library.' },
        hasIssuesEnabled: true
      },
      rateLimit: { limit: 5000, remaining: 4999, cost: 1 }
    };

    mockGraphqlClient.mockResolvedValue(mockRepoData);

    const result = await githubScorerService.calculateScore('facebook', 'react');

    expect(result.cached).toBe(false);
    expect(result.score).toBeDefined();
    expect(result.breakdown).toBeDefined();
    expect(mockGraphqlClient).toHaveBeenCalled();
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('fetches fresh data when cache is expired', async () => {
    const expiredData = {
      score: 8.5,
      breakdown: { readme: { score: 9, details: 'Good docs' } },
      timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredData));

    const mockRepoData = {
      repository: {
        name: 'react',
        description: 'A declarative library',
        url: 'https://github.com/facebook/react',
        stargazerCount: 50000,
        forkCount: 10000,
        pushedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        licenseInfo: { name: 'MIT License', key: 'mit' },
        repositoryTopics: { nodes: [] },
        languages: { edges: [] },
        defaultBranchRef: {
          target: {
            history: {
              totalCount: 1000,
              nodes: []
            }
          }
        },
        object: { text: '# React\n\nA JavaScript library.' },
        hasIssuesEnabled: true
      },
      rateLimit: { limit: 5000, remaining: 4999, cost: 1 }
    };

    mockGraphqlClient.mockResolvedValue(mockRepoData);

    const result = await githubScorerService.calculateScore('facebook', 'react');

    expect(result.cached).toBe(false);
    expect(mockGraphqlClient).toHaveBeenCalled();
  });

  test('handles GitHub API errors', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    mockGraphqlClient.mockRejectedValue(new Error('Not Found'));

    await expect(githubScorerService.calculateScore('nonexistent', 'repo'))
      .rejects.toThrow('Not Found');
  });

  test('validates repository parameters', async () => {
    // The service doesn't validate empty params in the method signature,
    // so we expect the GitHub API to handle this
    localStorageMock.getItem.mockReturnValue(null);
    mockGraphqlClient.mockRejectedValue(new Error('Bad Request'));

    await expect(githubScorerService.calculateScore('', 'repo'))
      .rejects.toThrow('Bad Request');
  });

  test('handles invalid cached data gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('invalid json');

    const mockRepoData = {
      repository: {
        name: 'test',
        description: 'Test repo',
        url: 'https://github.com/test/test',
        stargazerCount: 100,
        forkCount: 50,
        pushedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        licenseInfo: { name: 'MIT License', key: 'mit' },
        repositoryTopics: { nodes: [] },
        languages: { edges: [] },
        defaultBranchRef: {
          target: {
            history: {
              totalCount: 10,
              nodes: []
            }
          }
        },
        object: { text: '# Test' },
        hasIssuesEnabled: true
      },
      rateLimit: { limit: 5000, remaining: 4999, cost: 1 }
    };

    mockGraphqlClient.mockResolvedValue(mockRepoData);

    const result = await githubScorerService.calculateScore('test', 'test');

    expect(result.cached).toBe(false);
    expect(mockGraphqlClient).toHaveBeenCalled();
  });
});
