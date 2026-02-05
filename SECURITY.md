# Security Policy

## Reporting Security Issues

**Do not** open public issues for security vulnerabilities.

Please email security concerns to the maintainers directly. We will acknowledge receipt of your report within 48 hours and provide regular updates on the status.

Include the following in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Yes    |
| < 1.0   | ❌ No     |

## Security Best Practices

When deploying @rumsan/s3server:

1. **Use the latest version** - Always keep your image/package updated
2. **Run as non-root** - The Docker image runs as non-root user
3. **Use HTTPS** - In production, use a reverse proxy with HTTPS
4. **Limit access** - Use firewall rules to limit who can access the server
5. **Scan dependencies** - Regularly scan for vulnerable dependencies

### Docker Security

```bash
# Scan image for vulnerabilities
trivy image rumsan/s3server:latest

# Run with security options
docker run --read-only --cap-drop=ALL rumsan/s3server:latest

# Use secrets for sensitive data (avoid passing in environment)
```

### Dependency Updates

We use:
- Dependabot for automated dependency updates
- Regular security audits
- Minimal production dependencies

Check for vulnerabilities:
```bash
npm audit
npm audit fix
```

## Known Issues

None currently reported. Please report any security issues privately.

## Changelog

Security updates are highlighted in release notes.
