# Security Policy

## Reporting a Vulnerability

We take the security of MCP Diagnoser seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do NOT report security vulnerabilities through public GitHub issues.**

### How to Report

**Email**: 3314844@gmail.com  
**Subject**: Security Vulnerability in MCP Diagnoser

You should receive a response within 48 hours acknowledging your report. After the initial reply, we will keep you informed of the progress toward a fix and full announcement.

### Preferred Languages

We prefer all communications to be in English or Chinese.

## Security Best Practices

### For Users

1. **Keep Updated**: Always use the latest version
2. **Check Dependencies**: Run `npm audit` regularly
3. **Environment Variables**: Never hardcode sensitive data
4. **Access Control**: Limit MCP server access

### For Contributors

1. **No Hardcoded Secrets**: Use environment variables
2. **Input Validation**: Validate all user inputs
3. **Dependency Updates**: Keep dependencies current
4. **Code Review**: All PRs require security review

## Security Measures

### Current Security Features

- ✅ Regular dependency audits
- ✅ No hardcoded credentials
- ✅ Secure configuration defaults
- ✅ Sensitive file protection (.gitignore)
- ✅ Input validation
- ✅ No eval() usage

### Automated Scanning

We use the following automated security tools:

- `npm audit` - Dependency vulnerability scanning
- Manual code review - Security-focused code analysis
- GitHub Security Advisories - CVE monitoring

## Known Vulnerabilities

### Fixed Vulnerabilities

| CVE | Severity | Fixed Version | Date |
|-----|----------|---------------|------|
| GHSA-8r9q-7v3j-jr4g | High | 1.3.0 | 2026-03-20 |
| GHSA-w48q-cv73-mx4w | High | 1.3.0 | 2026-03-20 |

### Current Status

**No known vulnerabilities in current release**

Last audit: 2026-03-20  
Status: ✅ Secure

## Version Support

We recommend always using the latest version. Security updates are provided for the current version.

| Version | Supported |
| ------- | --------- |
| 1.3.x   | ✅ Yes    |
| < 1.3.0 | ❌ No     |

## Security Updates

Security updates are released as soon as possible after a vulnerability is confirmed and fixed.

### Update Frequency

- **Critical**: Immediate release
- **High**: Within 7 days
- **Medium**: Next scheduled release
- **Low**: Next scheduled release

## Best Practices for Deployment

### Production Deployment

1. **Use Latest Version**
   ```bash
   npm install -g mcp-diagnoser@latest
   ```

2. **Set Environment Variables**
   ```bash
   export MCP_CONFIG_PATH=/secure/path/config.json
   ```

3. **Limit Permissions**
   - Run with minimal required permissions
   - Don't run as root/admin unless necessary

4. **Monitor Logs**
   - Enable logging
   - Monitor for suspicious activity

### Development Deployment

1. **Use .env Files**
   ```bash
   # .env file (gitignored)
   API_KEY=your_key_here
   ```

2. **Don't Commit Secrets**
   - Review .gitignore
   - Use environment variables

## Incident Response

### Response Process

1. **Report Received** - Within 48 hours
2. **Investigation** - 1-7 days
3. **Fix Development** - 1-14 days
4. **Release** - Immediately after fix
5. **Disclosure** - After user notification

### Disclosure Policy

We follow a responsible disclosure policy:

1. Acknowledge receipt within 48 hours
2. Investigate and confirm vulnerability
3. Develop and test fix
4. Release security update
5. Notify users (after fix available)
6. Public disclosure (30 days after fix)

## Contact

**Security Team**: Lan  
**Email**: 3314844@gmail.com  
**Response Time**: Within 48 hours

---

**Last Updated**: 2026-03-20  
**Version**: 1.3.0
