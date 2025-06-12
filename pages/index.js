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
                                        with &apos;public_repo&apos; scope
                                    </p>
                                    <p className="text-xs text-secondary">
                                        <span className="text-red-500">
                                            Warning:
                                        </span>{" "}
                                        Do not share your token publicly.
                                        Keep it secure.
                                        If you suspect it has been compromised, revoke it immediately.
                                        <br />
                                        <span className="text-red-500">
                                            Note:
                                        </span>{" "}
                                        This token is used to access the GitHub API and retrieve repository data.
                                        It is not stored or logged by this application.
                                        <br />
                                        <span className="text-red-500">
                                            Important:
                                        </span>{" "}
                                        Ensure you have the necessary permissions to access the repository data.
                                        <br />
                                        <span className="text-red-500">
                                            Caution:
                                        </span>{" "}
                                        This application does not store your token or any sensitive information.
                                        It is used solely for the purpose of fetching repository data from GitHub.
                                        <br />
                                        <span className="text-red-500">
                                            Disclaimer:
                                        </span>{" "}
                                        This application is not affiliated with GitHub and does not guarantee the security of your token.
                                        Use it at your own risk.
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
                                    className="btn-secondary text-sm mt-2"
                                >
                                    Change GitHub Token
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8 animate-fade-in">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
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
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-3xl font-bold text-primary">
                                                {result.repository.name}
                                            </h2>
                                            {result.cached && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                    📦 Cached {result.cacheAge}m ago
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-secondary mb-4 text-lg">
                                            {result.repository.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-secondary">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                                </svg>
                                                {result.repository.stars?.toLocaleString() || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                🔄 {result.repository.forks?.toLocaleString() || 0}
                                            </span>
                                            {result.repository.language && (
                                                <span className="flex items-center gap-1">
                                                    💻 {result.repository.language}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <a
                                        href={result.repository.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-secondary hover:text-primary transition-all duration-200 hover:scale-110"
                                        title="View on GitHub"
                                    >
                                        <svg
                                            className="w-8 h-8"
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
                                <h3 className="text-xl font-semibold text-primary mb-6">
                                    Repository Quality Score
                                </h3>
                                <div className="relative inline-block">
                                    <div
                                        className={`text-7xl font-bold mb-2 ${getScoreColor(
                                            result.score
                                        )} drop-shadow-lg`}
                                    >
                                        <CountUp
                                            end={result.score}
                                            duration={2.5}
                                            decimals={1}
                                            decimal="."
                                        />
                                        <span className="text-3xl text-secondary">
                                            /10
                                        </span>
                                    </div>
                                    <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 mb-6 overflow-hidden">
                                    <div
                                        className={`h-5 rounded-full transition-all duration-2000 ease-out ${getScoreBackground(
                                            result.score
                                        )} shadow-md`}
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
                                <h3 className="text-lg font-semibold text-primary mb-4">
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
                                                        <span className="font-medium text-primary capitalize">
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
                                                    <p className="text-sm text-secondary mt-1">
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
                                <div className="text-center text-sm text-secondary bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        GitHub API: {result.rateLimit.remaining}/{result.rateLimit.limit} requests remaining
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="text-center">
                            <div className="flex justify-center items-center gap-6 mb-6">
                                <div className="flex items-center gap-2 text-secondary">
                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Next.js
                                </div>
                                <div className="flex items-center gap-2 text-secondary">
                                    <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                                    </svg>
                                    Tailwind CSS
                                </div>
                                <div className="flex items-center gap-2 text-secondary">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    GitHub GraphQL API
                                </div>
                            </div>
                            <p className="text-secondary text-lg mb-2">
                                Open source project for analysing repository quality metrics
                            </p>
                            <p className="text-sm text-secondary opacity-75">
                                Enhanced with dark mode support and comprehensive scoring algorithms
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
