# GitHub Repository Scorer

A static site built with Next.js that analyzes and scores GitHub repositories based on quality metrics like documentation, licensing, activity, and best practices.

## Features

-   **Comprehensive Scoring**: Analyzes README quality, license compliance, stars, forks, recent commits, CI/CD workflows, and more
-   **Static Site**: Exports to pure HTML/CSS/JS for GitHub Pages deployment
-   **Caching**: MongoDB integration for performance optimization
-   **Modern UI**: Beautiful, responsive design with Tailwind CSS
-   **Real-time Updates**: Live score animation and detailed breakdowns

## Scoring Metrics

-   **README Quality** (20%): Documentation completeness, structure, examples
-   **CI/CD Workflows** (20%): Automated testing and deployment practices
-   **Popularity** (18%): Stars and community engagement
-   **License** (15%): Legal compliance and license type
-   **Activity** (15%): Recent commits and maintenance
-   **Development** (12%): Forks and contributor interest

## Quick Start

1. **Clone and Install**

    ```bash
    git clone <your-repo-url>
    cd github-scorer
    npm install
    ```

2. **Development**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) and enter your GitHub token in the UI.

3. **Build and Deploy**
    ```bash
    npm run build
    ```
    The static files will be generated in the `out/` directory.

## Usage

1. **Get a GitHub Token**: Create a Personal Access Token at [GitHub Settings](https://github.com/settings/tokens) with `public_repo` scope
2. **Enter Token**: Paste your token in the secure input field on the homepage
3. **Analyze Repository**: Enter a repository URL or `owner/repo` format
4. **View Results**: See the comprehensive score breakdown and metrics

## Authentication

No server-side configuration needed! The app uses client-side authentication:

-   GitHub Personal Access Token is entered directly in the UI
-   Tokens are stored securely in browser memory only
-   No server-side environment variables required

## Deployment

### GitHub Pages (Recommended)

1. **Setup Repository**:

    - Create a new repository named `github-scorer` on GitHub
    - Push this code to the main branch

2. **Configure GitHub Pages**:

    - Go to repository Settings → Pages
    - Source: "GitHub Actions"
    - The included workflow will automatically build and deploy

3. **Access Site**:
    - Site will be available at `https://username.github.io/github-scorer`
    - Updates deploy automatically on push to main branch

### Manual Static Deployment

1. **Build Static Files**:

    ```bash
    npm run build
    ```

2. **Deploy `out/` Directory**:
    - Upload the contents of `out/` to any static hosting service
    - Examples: Netlify, Vercel, GitHub Pages, AWS S3, etc.

## Architecture

-   **Frontend**: Next.js 14 with React and Tailwind CSS
-   **API**: GitHub GraphQL API via @octokit/graphql (client-side)
-   **Caching**: localStorage with 1-hour TTL for performance
-   **Deployment**: Static export compatible with GitHub Pages
-   **Authentication**: Client-side GitHub token input (no server required)

## Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Build for production
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Run tests and ensure they pass
4. Submit a pull request

## License

MIT License - see LICENSE file for details
