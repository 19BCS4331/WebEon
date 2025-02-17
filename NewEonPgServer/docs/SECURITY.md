# Security Implementation Documentation

## Helmet Security Headers

This document outlines the security measures implemented in the NewEonPgServer using the Helmet middleware.

### Current Configuration

```javascript
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:3000", "http://192.168.1.107:3000", "http://127.0.0.1:3000"],
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
```

### Security Headers Explanation

1. **Content Security Policy (CSP)**
   - Controls which resources can be loaded
   - Current allowed sources:
     - Scripts: Self-hosted and inline scripts
     - Styles: Self-hosted and inline styles
     - Images: Self-hosted, data URIs, and HTTPS sources
     - Connections: Local development servers

2. **HTTP Strict Transport Security (HSTS)**
   - Max Age: 1 year (31536000 seconds)
   - Includes Subdomains: Yes
   - Preload: Enabled

3. **Cross-Origin Policies**
   - Embedder Policy: Disabled
   - Resource Policy: Set to "cross-origin"
   - Referrer Policy: strict-origin-when-cross-origin

### Allowed Domains

#### Development Environment
- `http://localhost:3000` - Local development server
- `http://192.168.1.107:3000` - Local network development
- `http://127.0.0.1:3000` - Local loopback

#### Production Environment
- TBD - Add production domains when deploying

### Modifying Security Settings

#### Adding New External Resources

1. **Scripts**
   ```javascript
   scriptSrc: ["'self'", "'unsafe-inline'", "new-domain.com"]
   ```

2. **Styles**
   ```javascript
   styleSrc: ["'self'", "'unsafe-inline'", "new-style-domain.com"]
   ```

3. **Images**
   ```javascript
   imgSrc: ["'self'", "data:", "https:", "new-image-domain.com"]
   ```

4. **API Endpoints**
   ```javascript
   connectSrc: ["'self'", "api.new-domain.com"]
   ```

### Testing Security Headers

1. Run the test script:
   ```bash
   node test-helmet.js
   ```

2. Check browser console for CSP violations

3. Regular testing checklist:
   - [ ] Run header test after adding new routes
   - [ ] Verify after adding new external resources
   - [ ] Test after environment changes
   - [ ] Validate after Helmet updates

### Troubleshooting Common Issues

1. **Resources Not Loading**
   - Check CSP directives for required domains
   - Verify correct domain spelling in CSP
   - Ensure protocol (http/https) matches

2. **API Calls Failing**
   - Verify domain in connectSrc directive
   - Check CORS configuration
   - Validate API endpoint protocol

3. **Frontend Integration Issues**
   - Check for inline script blocking
   - Verify style-src for external stylesheets
   - Validate frame-src for iframes

### Security Maintenance

1. **Regular Updates**
   ```bash
   npm outdated helmet
   npm update helmet
   ```

2. **Monitoring**
   - Check server logs for security violations
   - Monitor browser console in development
   - Review CSP violation reports

### Emergency Contacts

- Security Team: [Add Contact]
- DevOps Team: [Add Contact]
- Project Lead: [Add Contact]

### Version History

- v1.0.0 (2025-01-14)
  - Initial Helmet implementation
  - Basic CSP configuration
  - Development environment setup
