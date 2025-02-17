# Middleware Documentation

## Overview
Documentation for all middleware components in the NewEonPgServer application.

## Authentication Middleware

### `authMiddleware.js`
General authentication middleware for protecting routes.

```javascript
// Usage
app.use('/protected-route', authMiddleware);
```

Features:
- JWT token validation
- Token expiration check
- User role verification
- Request authentication state tracking

### `adminAuthMiddleware.js`
Special middleware for admin-only routes.

```javascript
// Usage
app.use('/admin/*', adminAuthMiddleware);
```

Features:
- Admin role verification
- Enhanced permission checking
- Admin activity logging

## Security Middleware

### `csrfMiddleware.js`
CSRF protection middleware.

Features:
- CSRF token generation
- Token validation
- Token rotation
- Security headers

### `rateLimitMiddleware.js`
Rate limiting implementation.

Features:
- Request rate limiting
- IP-based tracking
- Custom limit configurations
- Rate limit headers

Configuration:
```javascript
{
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}
```

## Middleware Execution Order

1. Rate Limiting
2. CORS
3. Body Parser
4. Cookie Parser
5. CSRF Protection
6. Authentication
7. Route-specific middleware

## Error Handling

Each middleware includes error handling:
- Standard error format
- Error logging
- Custom error responses

## Best Practices

1. **Authentication**
   - Always verify token validity
   - Check token expiration
   - Validate user permissions

2. **Rate Limiting**
   - Set appropriate limits
   - Monitor rate limit hits
   - Implement gradual backoff

3. **CSRF Protection**
   - Rotate tokens regularly
   - Validate all non-GET requests
   - Implement proper error handling

## Customization

### Rate Limit Configuration
```javascript
const customLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30 // 30 requests per minute
});
```

### Custom Authentication Rules
```javascript
const customAuth = (req, res, next) => {
  // Custom authentication logic
};
```

## Monitoring and Logging

- Rate limit violations logged
- Authentication failures tracked
- CSRF violations monitored
- Performance metrics collected
