const { v4: uuidv4 } = require('uuid');

// Store CSRF tokens with their creation time and usage count
const tokenStore = new Map();

// Token metrics
const metrics = {
    tokensGenerated: 0,
    tokensUsed: 0,
    tokensExpired: 0,
    tokenValidationFailures: 0
};

// List of routes that should be exempt from CSRF protection
const exemptRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/login/branchOnUser',
    '/auth/login/CounterOnBranchAndUser',
    '/auth/login/finYear',
    '/api/csrf-token'
];

// Clean up expired tokens periodically (tokens older than 1 hour)
setInterval(() => {
    const now = Date.now();
    let expiredCount = 0;
    for (const [token, data] of tokenStore.entries()) {
        if (now - data.timestamp > 3600000) { // 1 hour
            tokenStore.delete(token);
            expiredCount++;
        }
    }
    if (expiredCount > 0) {
        metrics.tokensExpired += expiredCount;
        console.log(`Cleaned up ${expiredCount} expired tokens. Total expired: ${metrics.tokensExpired}`);
    }
}, 300000); // Clean every 5 minutes

// Middleware to handle CSRF token generation and validation
const csrfMiddleware = (req, res, next) => {
    // Skip CSRF for exempt routes
    if (exemptRoutes.some(route => req.path.includes(route))) {
        return next();
    }

    // Skip CSRF for non-mutating requests
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }

    const token = req.headers['x-csrf-token'];
    
    if (!token || !tokenStore.has(token)) {
        metrics.tokenValidationFailures++;
        console.error('CSRF Error: Invalid or missing token', {
            path: req.path,
            method: req.method,
            token: token ? 'present' : 'missing',
            validationFailures: metrics.tokenValidationFailures
        });
        return res.status(403).json({
            error: 'CSRF token validation failed',
            errorCode: 'CSRF_ERROR'
        });
    }

    // Update token usage
    const tokenData = tokenStore.get(token);
    tokenData.useCount++;
    metrics.tokensUsed++;

    // Log token usage for monitoring
    if (tokenData.useCount % 10 === 0) { // Log every 10th use
        console.log('Token usage metrics:', {
            token: token.substring(0, 8) + '...',
            useCount: tokenData.useCount,
            age: Math.round((Date.now() - tokenData.timestamp) / 1000) + 's',
            totalUsed: metrics.tokensUsed
        });
    }

    next();
};

// Endpoint to get CSRF token
const getCsrfToken = (req, res) => {
    const token = uuidv4();
    tokenStore.set(token, {
        timestamp: Date.now(),
        useCount: 0,
        ip: req.ip
    });
    
    metrics.tokensGenerated++;
    
    // Log token generation
    console.log('New CSRF token generated:', {
        token: token.substring(0, 8) + '...',
        totalGenerated: metrics.tokensGenerated,
        activeTokens: tokenStore.size
    });
    
    res.json({ csrfToken: token });
};

// Endpoint to get CSRF metrics (for monitoring)
const getCsrfMetrics = (req, res) => {
    const now = Date.now();
    const activeTokens = Array.from(tokenStore.entries()).map(([token, data]) => ({
        token: token.substring(0, 8) + '...',
        age: Math.round((now - data.timestamp) / 1000) + 's',
        useCount: data.useCount
    }));

    res.json({
        metrics: {
            ...metrics,
            activeTokens: tokenStore.size,
            tokenDetails: activeTokens
        }
    });
};

module.exports = {
    csrfMiddleware,
    getCsrfToken,
    getCsrfMetrics
};
