# Contributing to MCP Diagnoser

Thank you for your interest in contributing to MCP Diagnoser! This document provides guidelines and instructions for contributing.

## 🌟 How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed and what behavior you expected**
* **Include error messages and screenshots if possible**
* **Include your environment details** (OS, Node.js version, etc.)

Example bug report template:

```markdown
**Description**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Run command '...'
2. With options '...'
3. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Error output**
```
Error message here
```

**Environment:**
 - OS: [e.g. Windows 11, macOS 14, Ubuntu 22.04]
 - Node.js version: [e.g. 18.17.0]
 - MCP Diagnoser version: [e.g. 1.3.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Features

Feature suggestions are always welcome! Please provide:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested feature**
* **Explain why this feature would be useful**
* **Provide examples of how the feature would be used**
* **List similar features in other tools if applicable**

### Pull Requests

* **Fill in the required template**
* **Follow the coding style** (see below)
* **Include appropriate tests**
* **Update documentation if necessary**
* **Make sure your code passes linting and tests**

## 📝 Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Setup

1. **Fork the repository**

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mcp-diagnoser.git
   cd mcp-diagnoser
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Run in development mode**
   ```bash
   npm run dev
   ```

## 📏 Coding Style

* **TypeScript**: Use TypeScript for all new code
* **Formatting**: Consistent indentation (2 spaces)
* **Naming**: Use camelCase for variables/functions, PascalCase for classes
* **Comments**: Add JSDoc comments for public APIs
* **Error Handling**: Use try-catch blocks appropriately
* **Logging**: Use chalk for colored console output

## 🧪 Testing

Run tests with:

```bash
npm test
```

Make sure all tests pass before submitting a PR.

## 📚 Documentation

* Update README.md if you change functionality
* Add inline comments for complex logic
* Update CHANGELOG.md with your changes
* Add examples for new features

## 🚀 Release Process

Releases use semantic versioning (MAJOR.MINOR.PATCH):

* **MAJOR**: Breaking changes
* **MINOR**: New features (backward compatible)
* **PATCH**: Bug fixes (backward compatible)

To create a release:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a git tag: `git tag v1.3.0`
4. Push the tag: `git push origin v1.3.0`

The CI/CD pipeline will automatically publish to npm.

## 📋 Code Review Process

All PRs will be reviewed by maintainers. Please be patient and responsive to feedback. The review process typically involves:

1. Automated CI checks
2. Code review by maintainers
3. Discussion and revisions if needed
4. Approval and merge

## 🎯 Areas Needing Contribution

We always need help with:

* **New Features**: Package manager support, diagnostic improvements
* **Bug Fixes**: Check open issues for bugs to fix
* **Documentation**: Improving docs, adding examples
* **Testing**: Adding test coverage
* **Performance**: Optimizing slow operations

## 💬 Community

* **GitHub Issues**: For bug reports and feature requests
* **GitHub Discussions**: For questions and general discussion
* **Discord/Slack**: [Add if applicable]

## 📜 Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all backgrounds and experience levels.

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Thank you for contributing to MCP Diagnoser! Your help makes this project better for everyone.

---

For more information, see [README.md](README.md) or open an issue.
