# Contributing to GitScore

Thank you for considering contributing to GitScore! This document outlines the process for contributing to our project and helps to make the contribution process easy and effective for everyone involved.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to [INSERT CONTACT EMAIL].

## How Can I Contribute?

### Reporting Bugs

Bug reports help us make GitScore better. When you submit a bug report, please include as many details as possible:

1. **Use a clear and descriptive title** for the issue
2. **Describe the exact steps to reproduce the bug**
3. **Provide specific examples** (e.g., links to repositories that trigger the bug)
4. **Describe the behavior you observed** and what you expected to see
5. **Include screenshots or animated GIFs** if possible
6. **Include your environment details** (browser version, OS, etc.)

### Suggesting Enhancements

We welcome suggestions for enhancements. When suggesting an enhancement:

1. **Use a clear and descriptive title**
2. **Provide a step-by-step description** of the suggested enhancement
3. **Explain why this enhancement would be useful** to most GitScore users
4. **List some other applications where this enhancement exists**, if applicable

### Pull Requests

Good pull requests are a fantastic help. They should remain focused in scope and avoid unrelated commits.

Please follow these steps to have your contribution considered:

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** used throughout the project
3. **Include tests** when adding new features
4. **Update documentation** as needed
5. **Ensure the test suite passes** by running `npm test`
6. **Make sure your code lints** by running `npm run lint`
7. **Submit a pull request** with a clear title and description

## Development Setup

To set up GitScore for development:

1. **Clone the repository**:
   ```
   git clone https://github.com/[your-username]/GitScore-Copilot.git
   cd GitScore-Copilot
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run development server**:
   ```
   npm run dev
   ```

4. **Run tests**:
   ```
   npm test
   ```

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### JavaScript Styleguide

All JavaScript code should adhere to the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with some modifications as defined in our ESLint configuration.

### Documentation Styleguide

* Use Markdown for documentation
* Reference functions, classes, and modules in backticks (`FunctionName`)
* Use code blocks for examples:
  ```javascript
  function example() {
    console.log('Example code');
  }
  ```

## Project Structure

```
GitScore-Copilot/
├── lib/                # Core logic and API functions
├── pages/              # Next.js pages
├── styles/             # Global styles
├── public/             # Static assets
├── _tests/             # Test files
└── changes/            # Documentation for changes
```

## Scoring System

If you're modifying the scoring system, please refer to our scoring metrics in the README and ensure your changes align with our established weighting system.

## Additional Notes

### Issue Labels

We use issue labels to categorize and prioritize issues. Some common labels include:

* `bug`: Something isn't working
* `enhancement`: New feature or request
* `documentation`: Improvements or additions to documentation
* `good first issue`: Good for newcomers

## Thank You!

Thank you for contributing to GitScore! Your efforts help make this tool better for everyone.
