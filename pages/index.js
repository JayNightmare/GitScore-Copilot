/**
 * Main application page with repository search and score display
 * Features animated score counter, detailed breakdown visualisation, and dark mode
 */

import { useState } from "react";
import Head from "next/head";
import CountUp from "react-countup";
import GitHubScorerService from "../lib/GitScore-Copilot-service";
import { useDarkMode } from "../lib/useDarkMode";

export default function Home() {
    const [input, setInput] = useState("");
    const [githubToken, setGithubToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [showTokenInput, setShowTokenInput] = useState(true);
    const { darkMode, toggleDarkMode } = useDarkMode();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!input.trim()) return;

        if (!githubToken.trim()) {
            setError("Please enter your GitHub token first");
            return;
        }

        // Parse owner/repo from input
        const match = input
            .trim()
            .match(/(?:https?:\/\/github\.com\/)?([^\/]+)\/([^\/\s]+)/);
        if (!match) {
            setError(
                'Please enter a valid repository in format "owner/repo" or GitHub URL'
            );
            return;
        }

        const [, owner, repo] = match;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Initialise service with token
            GitHubScorerService.initialize(githubToken);

            // Calculate score
            const data = await GitHubScorerService.calculateScore(owner, repo);
            setResult(data);

            // Hide token input after successful request
            setShowTokenInput(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 7) return "text-score-high";
        if (score >= 4) return "text-score-medium";
        return "text-score-low";
    };

    const getScoreBackground = (score) => {
        if (score >= 7) return "bg-score-high";
        if (score >= 4) return "bg-score-medium";
        return "bg-score-low";
    };

    return (
        <>
            <Head>
                <title>GitHub Repository Scorer</title>
                <meta
                    name="description"
                    content="Analyse and score GitHub repositories based on quality metrics"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Dark Mode Toggle */}
            <button
                onClick={toggleDarkMode}
                className="dark-mode-toggle"
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
                {darkMode ? (
                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                )}
            </button>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center">
                            <h1 className="text-5xl font-bold text-primary mb-3 tracking-tight">
                                GitHub Repository Scorer
                            </h1>
                            <p className="text-xl text-secondary max-w-2xl mx-auto">
                                Analyse repository quality with comprehensive scoring metrics
                            </p>
                            <div className="mt-4 flex justify-center space-x-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                    ✨ Enhanced with Dark Mode
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                    🇬🇧 UK English
                                </span>
                            </div>
                        </div>
                    </div>
                </header>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Search Form */}
                    <div className="card-gradient rounded-xl shadow-xl p-8 mb-10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {showTokenInput && (
                                <div className="space-y-2">
                                    <label
                                        htmlFor="token-input"
                                        className="block text-sm font-semibold text-primary mb-2"
                                    >
                                        GitHub Personal Access Token
                                    </label>
                                    <input
                                        id="token-input"
                                        type="password"
                                        value={githubToken}
                                        onChange={(e) =>
                                            setGithubToken(e.target.value)
                                        }
                                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        className="input-field"
                                        disabled={loading}
                                    />
                                    <p className="text-xs text-secondary mt-2">
                                        Create a token at{" "}
                                        <a
                                            href="https://github.com/settings/tokens"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-600 dark:text-green-400 hover:underline font-medium"
                                        >
                                            GitHub Settings
                                        </a>{" "}
                                        with 'public_repo' scope
                                    </p>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label
                                    htmlFor="repo-input"
                                    className="block text-sm font-semibold text-primary mb-2"
                                >
                                    Repository URL or Owner/Repository
                                </label>
                                <input
                                    id="repo-input"
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="e.g., facebook/react or https://github.com/facebook/react"
                                    className="input-field"
                                    disabled={loading}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    !input.trim() ||
                                    (showTokenInput && !githubToken.trim())
                                }
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading
                                    ? "Analysing Repository..."
                                    : "Analyse Repository"}
                            </button>
                            {!showTokenInput && (
                                <button
                                    type="button"
                                    onClick={() => setShowTokenInput(true)}
                                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                                >
                                    Change GitHub Token
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 animate-fade-in">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Error
                                    </h3>
                                    <p className="text-sm text-red-700 mt-1">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Display */}
                    {result && (
                        <div className="space-y-6 animate-slide-up">
                            {/* Repository Info */}
                            <div className="score-card">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-github-900 mb-1">
                                            {result.repository.name}
                                        </h2>
                                        <p className="text-github-600 mb-2">
                                            {result.repository.description}
                                        </p>
                                        <div className="flex items-center space-x-4 text-sm text-github-500">
                                            <span>
                                                ⭐ {result.repository.stars}
                                            </span>
                                            <span>
                                                🔄 {result.repository.forks}
                                            </span>
                                            <span>
                                                📝 {result.repository.language}
                                            </span>
                                            {result.cached && (
                                                <span className="text-blue-600">
                                                    📦 Cached ({result.cacheAge}
                                                    m ago)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <a
                                        href={result.repository.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-github-600 hover:text-github-900 transition-colors"
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Score Display */}
                            <div className="score-card text-center">
                                <h3 className="text-lg font-semibold text-github-700 mb-4">
                                    Repository Score
                                </h3>
                                <div
                                    className={`text-6xl font-bold mb-2 ${getScoreColor(
                                        result.score
                                    )}`}
                                >
                                    <CountUp
                                        end={result.score}
                                        duration={2}
                                        decimals={1}
                                        decimal="."
                                    />
                                    <span className="text-3xl text-github-400">
                                        /10
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                                    <div
                                        className={`h-4 rounded-full transition-all duration-1000 ease-out ${getScoreBackground(
                                            result.score
                                        )}`}
                                        style={{
                                            width: `${
                                                (result.score / 10) * 100
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                                <p className="text-gray-600">
                                    {result.score >= 8
                                        ? "Excellent"
                                        : result.score >= 6
                                        ? "Good"
                                        : result.score >= 4
                                        ? "Fair"
                                        : "Needs Improvement"}
                                </p>
                            </div>

                            {/* Score Breakdown */}
                            <div className="score-card">
                                <h3 className="text-lg font-semibold text-github-700 mb-4">
                                    Score Breakdown
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(result.breakdown).map(
                                        ([key, metric]) => (
                                            <div
                                                key={key}
                                                className="metric-item"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-github-800 capitalize">
                                                            {key
                                                                .replace(
                                                                    /([A-Z])/g,
                                                                    " $1"
                                                                )
                                                                .trim()}
                                                        </span>
                                                        <span
                                                            className={`font-semibold ${getScoreColor(
                                                                metric.score
                                                            )}`}
                                                        >
                                                            {metric.score.toFixed(
                                                                1
                                                            )}
                                                            /10
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-github-500 mt-1">
                                                        {metric.details}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Rate Limit Info */}
                            {result.rateLimit && (
                                <div className="text-center text-sm text-github-500">
                                    GitHub API: {result.rateLimit.remaining}/
                                    {result.rateLimit.limit} requests remaining
                                </div>
                            )}
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center text-github-500">
                            <p>
                                Built with Next.js, Tailwind CSS, and GitHub
                                GraphQL API
                            </p>
                            <p className="mt-2">
                                Open source project for analyzing repository
                                quality metrics
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
