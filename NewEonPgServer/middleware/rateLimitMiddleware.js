class TokenBucket {
    constructor(capacity, fillPerSecond) {
        this.capacity = capacity;
        this.tokens = capacity;
        this.fillPerSecond = fillPerSecond;
        this.lastFilled = Date.now();
    }

    take() {
        this.refill();

        if (this.tokens > 0) {
            this.tokens -= 1;
            return true;
        }

        return false;
    }

    refill() {
        const now = Date.now();
        const deltaSeconds = (now - this.lastFilled) / 1000;
        this.tokens = Math.min(
            this.capacity,
            this.tokens + deltaSeconds * this.fillPerSecond
        );
        this.lastFilled = now;
    }
}

// OpenAI has a rate limit of 3 requests per second for free tier
const openAIBucket = new TokenBucket(3, 1); // 3 tokens max, refills at 1 token per second

// Queue for pending requests
const requestQueue = [];
let isProcessingQueue = false;

// Process the queue
async function processQueue() {
    if (isProcessingQueue || requestQueue.length === 0) return;
    
    isProcessingQueue = true;
    
    while (requestQueue.length > 0) {
        if (openAIBucket.take()) {
            const { next, resolve } = requestQueue.shift();
            resolve();
            await next();
        } else {
            // Wait for 1 second before trying again
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    isProcessingQueue = false;
}

// Rate limiting middleware
function rateLimitMiddleware(req, res, next) {
    // Skip rate limiting for non-OpenAI endpoints
    if (!req.path.includes('/api/ai')) {
        return next();
    }

    if (openAIBucket.take()) {
        // If we have tokens available, proceed immediately
        return next();
    }

    // Otherwise, queue the request
    new Promise((resolve) => {
        requestQueue.push({
            next: () => next(),
            resolve
        });
        processQueue();
    });
}

module.exports = rateLimitMiddleware;
