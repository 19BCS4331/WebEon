# NewEonPgServer

## Security Implementation

This project implements security best practices using Helmet middleware. For detailed security documentation, please refer to [SECURITY.md](./docs/SECURITY.md).

### Quick Security Reference

- Content Security Policy (CSP) implemented
- HTTP Strict Transport Security (HSTS) enabled
- Cross-Origin Resource Sharing (CORS) configured
- XSS Protection enabled
- Click-jacking protection enabled

### Testing Security Headers

```bash
# Run security header test
node test-helmet.js
```

### Adding New External Resources

When adding new external resources (scripts, styles, APIs), update the CSP configuration in `server.js`. Refer to [SECURITY.md](./docs/SECURITY.md) for detailed instructions.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

## Security Contacts

For security-related issues, please contact:
jacob@maraekat.com
