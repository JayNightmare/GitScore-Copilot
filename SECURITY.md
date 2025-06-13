# Security Policy

## Supported Versions

The GitScore project is currently under active development. We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.2.3   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of GitScore seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do Not** disclose the vulnerability publicly.
2. **Do Not** open a public GitHub issue for the vulnerability.
3. Email your findings to [INSERT SECURITY EMAIL]. If you don't receive a response within 48 hours, please follow up.
4. Provide as much information as possible about the vulnerability:
   - The type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
   - Full paths of source file(s) related to the manifestation of the issue
   - The location of the affected source code (tag/branch/commit or direct URL)
   - Any special configuration required to reproduce the issue
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the issue, including how an attacker might exploit the issue

## What to Expect

When you report a vulnerability, you can expect:

1. **Acknowledgement**: We will acknowledge receipt of your vulnerability report within 48 hours.
2. **Communication**: We will keep you informed about our progress fixing the vulnerability.
3. **Disclosure**: We will coordinate public disclosure of the vulnerability with you.

## Security Best Practices for Contributors

When contributing to GitScore, please keep the following security best practices in mind:

1. **GitHub Token Safety**: Never commit or expose GitHub tokens. Our application requires users to input tokens directly in the UI rather than storing them in configuration files.
2. **Dependencies**: Be cautious when adding new dependencies and keep existing ones up to date.
3. **Input Validation**: Always validate user inputs, especially when they are used in API calls or database operations.
4. **Data Handling**: Be careful when handling and displaying repository data.

## Security-Related Configuration

GitScore uses client-side token storage for GitHub API interactions. The token is:
- Never stored in cookies or local storage
- Never sent to our servers
- Only used for client-side API calls to GitHub

Our MongoDB integration is used only for caching publicly available repository data and does not store any personal or sensitive information.

## Updates and Patches

We will notify users about significant security updates through:
- Release notes
- Updates to this security policy
- Notifications in the application (when possible)

Thank you for helping keep GitScore and its community safe!
