# Contributing to @rumsan/s3server

Thank you for your interest in contributing to @rumsan/s3server! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions with other contributors and maintainers.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker (for container testing)
- Git

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rumsan/s3server.git
   cd s3server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

## Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Commit Messages

Please write clear, descriptive commit messages:

```
feat: Add new S3 operation
fix: Resolve file upload issue
docs: Update README with examples
test: Add unit tests for storage service
refactor: Improve error handling
```

### Code Style

- Use TypeScript for type safety
- Follow the existing code structure
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Testing Your Changes

1. **Run tests locally:**
   ```bash
   npm run test
   ```

2. **Test with Docker:**
   ```bash
   npm run docker:build:dev
   docker-compose -f docker-compose.dev.yml up s3server-dev
   ```

3. **Manual testing:**
   ```bash
   # Create a bucket
   curl -X PUT http://localhost:4568/api/buckets/test-bucket
   
   # Upload a file
   curl -X PUT http://localhost:4568/api/buckets/test-bucket/objects/test.txt \
     -H "Content-Type: text/plain" \
     -d "Hello World"
   
   # Download the file
   curl http://localhost:4568/api/buckets/test-bucket/objects/test.txt
   ```

## Submitting Changes

### Pull Request Process

1. **Update your branch:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push your changes:**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a pull request** on GitHub with:
   - Clear title describing the changes
   - Description of what the PR does
   - Reference to any related issues
   - Screenshots or examples if applicable

4. **Ensure CI passes:**
   - All GitHub Actions checks must pass
   - No merge conflicts

### Pull Request Checklist

- [ ] Code follows the project's style guidelines
- [ ] Changes are properly documented
- [ ] Tests added/updated for new functionality
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] Commits are squashed and meaningful

## Documentation

When adding new features, please update relevant documentation:

- Update [README.md](../README.md) if adding user-facing features
- Update [DOCKER.md](../DOCKER.md) for Docker-related changes
- Update [TESTING.md](../TESTING.md) for testing procedures
- Add code comments for complex logic

## Reporting Issues

### Bug Reports

Include the following information:

- Descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment information (OS, Node.js version, etc.)
- Error messages and logs

### Feature Requests

Include:

- Clear description of the feature
- Why it would be useful
- Example usage
- Potential implementation approach

## Project Structure

```
src/
├── config/          # Configuration files
├── routes/          # API route handlers
├── services/        # Business logic
├── types/           # TypeScript type definitions
└── server.ts        # Entry point

examples/            # Example code and usage
tests/               # Test files
docs/                # Additional documentation
```

## Coding Standards

### TypeScript

- Use strict mode: `"strict": true`
- Add type annotations to function parameters and returns
- Use interfaces for object shapes
- Prefer const over let/var

### Error Handling

- Use meaningful error messages
- Handle errors gracefully
- Log errors for debugging
- Return appropriate HTTP status codes

### Comments

- Add JSDoc comments to public functions
- Explain complex logic
- Keep comments updated with code changes

## Version Management

Versioning follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Update `package.json` version before creating a release tag.

## Merging and Release

Only maintainers can merge pull requests and create releases.

### Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md` if it exists
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions automatically builds and publishes Docker image and NPM package

## Questions?

Feel free to:
- Open an issue for bugs and feature requests
- Start a discussion for design questions
- Contact the maintainers directly

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

## Recognition

Contributors will be recognized in:
- Release notes
- Project README (if desired)
- GitHub contributors page

Thank you for contributing!
