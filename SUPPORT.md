# Support

This document outlines the various support resources available for GitScore users and contributors.

## Getting Help

### Documentation

Before seeking support, please check:
- [README](README.md) for general information and quick start guide
- [CONTRIBUTING](CONTRIBUTING.md) for guidelines on how to contribute
- [SECURITY](SECURITY.md) for security-related concerns
- [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) for community guidelines

### Asking Questions

If you need help with GitScore, you have several options:

1. **GitHub Issues**: For bugs, feature requests, or documentation improvements, [create a new issue](https://github.com/[your-username]/GitScore-Copilot/issues/new) on our repository. Please use the appropriate issue template and provide as much context as possible.

2. **Discussions**: For general questions, ideas, or to share your experience, use [GitHub Discussions](https://github.com/[your-username]/GitScore-Copilot/discussions) (if enabled).

3. **Contact**: For sensitive inquiries, security issues, or other concerns, please contact the maintainers directly at [INSERT CONTACT EMAIL].

## FAQ

### How do I get a GitHub token?

Create a Personal Access Token at [GitHub Settings](https://github.com/settings/tokens) with the `public_repo` scope.

### Is my GitHub token safe?

Yes! Your GitHub token is:
- Never stored in cookies or local storage
- Never sent to our servers
- Only used for client-side API calls to GitHub

### How is the repository score calculated?

The score is based on six main categories:
- Documentation (20%)
- Maintenance & Activity (20%)
- Quality & Testing (15%)
- Community & Collaboration (15%)
- Popularity & Reach (15%)
- Security & Dependency Health (15%)

For more details, see the Scoring Metrics section in our [README](README.md).

### Can I analyze private repositories?

Yes, as long as your GitHub token has access to the private repository you want to analyze.

### How is data cached?

We use MongoDB to cache repository analysis results, which helps improve performance for frequently requested repositories. No personal or sensitive information is stored in the cache.

## Support Tiers

### Community Support

Community support is provided by volunteers through GitHub Issues and Discussions.

### Maintainer Support

Project maintainers monitor issues and provide responses as time permits. There is no guaranteed response time for community support.

## Providing Feedback

We value your feedback! Please let us know how we can improve GitScore by:
- Opening an issue for bugs or feature requests
- Participating in discussions
- Contributing pull requests (see [CONTRIBUTING](CONTRIBUTING.md))

## Future Support Plans

As GitScore grows, we plan to expand our support options, potentially including:
- Comprehensive documentation website
- Video tutorials
- Integration guides
- Community forums

Stay tuned for updates!
