/**
 * API endpoint for calculating and returning repository scores
 * Handles caching, data fetching, and score computation
 */

const { fetchRepositoryData, fetchWorkflowData } = require('../../../../lib/github.js');
const { calculateRepositoryScore } = require('../../../../lib/scoring.js');
const { getCachedScore, cacheScore } = require('../../../../lib/mongodb.js');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { owner, repo } = req.query;
  
  if (!owner || !repo) {
    return res.status(400).json({ error: 'Owner and repo parameters are required' });
  }
  
  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GitHub token not configured' });
  }
  
  try {
    // Check cache first
    const cached = await getCachedScore(owner, repo);
    if (cached) {
      console.log(`Cache hit for ${owner}/${repo}`);
      return res.status(200).json({
        ...cached,
        cached: true,
        cacheAge: Math.floor((new Date() - new Date(cached.createdAt)) / 1000 / 60) // minutes
      });
    }
    
    console.log(`Fetching fresh data for ${owner}/${repo}`);
    
    // Fetch repository data from GitHub
    const [repoData, workflowData] = await Promise.all([
      fetchRepositoryData(owner, repo),
      fetchWorkflowData(owner, repo)
    ]);
    
    if (!repoData?.repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    
    // Calculate score
    const scoreResult = calculateRepositoryScore(repoData, workflowData);
    
    // Prepare response data
    const responseData = {
      owner,
      repo,
      ...scoreResult,
      cached: false,
      generatedAt: new Date().toISOString(),
      rateLimit: repoData.rateLimit
    };
    
    // Cache the result
    await cacheScore(owner, repo, responseData);
    
    return res.status(200).json(responseData);
    
  } catch (error) {
    console.error('Score calculation error:', error);
    
    if (error.message.includes('Not Found')) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({ error: 'GitHub API rate limit exceeded' });
    }
    
    return res.status(500).json({ 
      error: 'Failed to calculate score',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
