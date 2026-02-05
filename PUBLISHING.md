# Publishing Guide

This guide explains how to publish @rumsan/s3server to Docker Hub and NPM registry.

## Prerequisites

- Docker CLI installed and configured
- Docker Hub account (for Docker image publishing)
- NPM account (for NPM package publishing)
- GitHub account with push access to the repository

## Setting Up Credentials

### Docker Hub

1. Create a Docker Hub account at https://hub.docker.com
2. Create an access token: Settings → Security → Access Tokens
3. Configure Docker CLI:
   ```bash
   docker login
   # Enter username and access token when prompted
   ```

4. Add GitHub secret `DOCKER_USERNAME` and `DOCKER_PASSWORD`

### NPM Registry

1. Create an NPM account at https://www.npmjs.com
2. Create an access token: Account Settings → Auth Tokens
3. Configure NPM:
   ```bash
   npm login
   npm config get registry  # Verify you're using https://registry.npmjs.org
   ```

4. Add GitHub secret `NPM_TOKEN`

## Publishing Docker Image

### Automatic Publishing (via GitHub Actions)

The project includes automated Docker publishing via GitHub Actions:

**Trigger by pushing a tag:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

This will:
1. Build the Docker image
2. Tag it with the version
3. Push to Docker Hub

**Available tags:**
- `rumsan/s3server:latest` - Latest stable version
- `rumsan/s3server:main` - Latest from main branch
- `rumsan/s3server:develop` - Latest from develop branch
- `rumsan/s3server:v1.0.0` - Semantic version tag

### Manual Publishing

```bash
# Build image
npm run docker:build

# Tag for specific version
docker tag rumsan/s3server:latest rumsan/s3server:1.0.0

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push rumsan/s3server:latest
docker push rumsan/s3server:1.0.0
```

## Publishing NPM Package

### Automatic Publishing (via GitHub Actions)

NPM publishing is automated when creating a release tag:

1. Update version in `package.json`:
   ```json
   {
     "name": "@rumsan/s3server",
     "version": "1.0.0"
   }
   ```

2. Create and push tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. GitHub Actions automatically:
   - Builds the project
   - Publishes to NPM
   - Creates a GitHub release

### Manual Publishing

```bash
# Build the project
npm run build

# Login to NPM
npm login

# Publish to NPM
npm publish

# Or publish as specific version
npm publish --tag next  # Pre-release
npm publish --tag beta  # Beta version
```

## Version Management

### Semantic Versioning

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes (e.g., 1.0.0 → 2.0.0)
- **MINOR**: New features, backward compatible (e.g., 1.0.0 → 1.1.0)
- **PATCH**: Bug fixes (e.g., 1.0.0 → 1.0.1)

### Pre-release Versions

```bash
npm version prerelease  # 1.0.0 → 1.0.1-0
npm version preminor    # 1.0.0 → 1.1.0-0
npm version premajor    # 1.0.0 → 2.0.0-0

npm publish --tag beta  # Publish as beta
npm publish --tag rc    # Publish as release candidate
```

## Release Checklist

- [ ] All tests pass
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Version number updated in `package.json`
- [ ] No TypeScript errors
- [ ] Commit messages are clean
- [ ] Changelog updated (if applicable)

## Docker Image Registry

### Pushing to Different Registries

#### GitHub Container Registry (GHCR)

```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Build and tag
docker build -t ghcr.io/rumsan/s3server:latest .

# Push
docker push ghcr.io/rumsan/s3server:latest
```

#### Private Registry

```bash
# Configure registry
docker login myregistry.com

# Build and push
docker build -t myregistry.com/rumsan/s3server:latest .
docker push myregistry.com/rumsan/s3server:latest
```

## Monitoring Publishes

### Docker Hub

View published images:
```bash
curl https://hub.docker.com/v2/repositories/rumsan/s3server/tags/
```

Or visit: https://hub.docker.com/r/rumsan/s3server

### NPM

View published packages:
```bash
npm view @rumsan/s3server versions
npm view @rumsan/s3server
```

Or visit: https://www.npmjs.com/package/@rumsan/s3server

## Troubleshooting

### Docker Push Fails

```bash
# Verify login
docker info | grep Username

# Re-login if needed
docker logout
docker login
```

### NPM Publish Fails

```bash
# Check registry
npm config get registry

# Verify login
npm whoami

# Re-login if needed
npm logout
npm login
```

### GitHub Actions Failures

Check the workflow run:
1. Go to GitHub repository
2. Click "Actions"
3. View the failed workflow
4. Check logs for error messages

Common issues:
- Invalid credentials (check GitHub secrets)
- Conflicting version number (already published)
- TypeScript compilation errors

## Best Practices

1. **Test before publishing**
   ```bash
   npm test
   npm run build
   ```

2. **Use consistent versioning**
   - Always use semantic versioning
   - Match version in package.json with git tag

3. **Publish from clean state**
   ```bash
   git status  # Should be clean
   git pull    # Get latest
   ```

4. **Document changes**
   - Add release notes
   - Update CHANGELOG if it exists
   - Link to related issues

5. **Monitor published packages**
   - Check Docker Hub for new images
   - Verify NPM package contents
   - Test installation from public registry

## Rollback

If you need to unpublish a package:

```bash
# NPM
npm unpublish @rumsan/s3server@1.0.0

# Docker (via Docker Hub web interface)
# Delete the tag at https://hub.docker.com/r/rumsan/s3server/tags
```

⚠️ **Warning**: Unpublishing is permanent after 24 hours.

## Continuous Integration

GitHub Actions automatically:
- Runs tests on every push
- Builds Docker images for branches and tags
- Publishes Docker images when tags are pushed
- Publishes NPM packages for version tags

View CI status:
- GitHub: Actions tab in repository
- Docker Hub: Builds section on image page

## Additional Resources

- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [NPM Publishing Documentation](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
