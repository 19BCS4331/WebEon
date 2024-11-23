const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const navigationHelper = require('./navigationHelper');
const authMiddleware = require('../middleware/authMiddleware');
const appContext = require('../config/appContext');

// Fallback responses for common queries
const fallbackResponses = {
    greeting: [
        "Hello! I'm Webeon's assistant. I can help you with financial operations, transactions, and system navigation.",
        "Welcome to Webeon! How can I assist you with your financial management tasks today?",
        "Hi there! Need help with transactions, reports, or system features?"
    ],
    general: [
        "I can help you with financial operations, system navigation, and best practices. What would you like to know?",
        "I'm here to assist with your financial management needs. Could you please be more specific?",
        "I can guide you through Webeon's features. What area would you like to explore?"
    ],
    error: [
        "I'm currently experiencing some technical limitations. Please try again later or contact support for immediate assistance.",
        "Our AI service is temporarily at capacity. In the meantime, you can find help in our documentation or contact support.",
        "We're experiencing high demand. Please try again in a few minutes or reach out to support for urgent matters."
    ]
};

// Helper function to get appropriate fallback response
const getFallbackResponse = (query) => {
    query = query.toLowerCase();
    
    // Check for greetings
    if (query.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
        const responses = fallbackResponses.greeting;
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Default to general response
    const responses = fallbackResponses.general;
    return responses[Math.floor(Math.random() * responses.length)];
};

// Initialize OpenAI configuration
let openai = null;
try {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
    }
    
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('OpenAI client initialized successfully');
} catch (error) {
    console.error('Failed to initialize OpenAI:', error);
}

// Validate OpenAI setup
const validateOpenAISetup = () => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
    }
    if (!openai) {
        throw new Error('OpenAI client is not initialized');
    }
};

// Helper function to extract JSON from text
const extractJsonFromText = (text) => {
    // Try to find JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.warn('Failed to parse JSON from match:', e);
        }
    }
    
    // If no JSON found or parsing failed, try to find code block
    const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
        try {
            return JSON.parse(codeBlockMatch[1]);
        } catch (e) {
            console.warn('Failed to parse JSON from code block:', e);
        }
    }
    
    return null;
};

// Path mappings for common routes
const pathMappings = {
    userProfile: '/system-setup/UserGroup/false',
    userGroup: '/system-setup/UserGroup/true',
    dashboard: '/dashboard',
    // Add more mappings as needed
};

// Helper function to get correct path
const getCorrectPath = (requestedPath) => {
    // If it's already a full path, parse it properly
    if (requestedPath.includes('/')) {
        const pathParts = requestedPath.split('/');
        const isUserProfile = pathParts[pathParts.length - 1] === 'false';
        return isUserProfile ? pathMappings.userProfile : pathMappings.userGroup;
    }

    // For navigation requests, normalize the input
    const normalizedPath = requestedPath.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
    
    console.log('Normalized request:', normalizedPath);
    
    // Define specific keywords for each type
    const groupKeywords = ['usergroup', 'group', 'groups', 'groupmanagement', 'managegroups'];
    const profileKeywords = ['manageuser', 'manageusers', 'userprofile', 'userprofiles', 'profile', 'profiles'];
    const userKeywords = ['user', 'users'];
    
    // Check for exact matches first
    if (groupKeywords.some(keyword => normalizedPath === keyword)) {
        console.log('Exact group match found');
        return pathMappings.userGroup;
    }
    if (profileKeywords.some(keyword => normalizedPath === keyword)) {
        console.log('Exact profile match found');
        return pathMappings.userProfile;
    }
    
    // Check for specific management phrases
    if (normalizedPath.includes('managegroup')) {
        return pathMappings.userGroup;
    }
    if (normalizedPath.includes('manageuser')) {
        return pathMappings.userProfile;
    }
    
    // Check if it's specifically about users without group context
    const hasUserKeyword = userKeywords.some(keyword => normalizedPath.includes(keyword));
    const hasGroupKeyword = groupKeywords.some(keyword => normalizedPath.includes(keyword));
    
    if (hasUserKeyword && !hasGroupKeyword) {
        console.log('User management without group context - going to profiles');
        return pathMappings.userProfile;
    }
    
    if (hasGroupKeyword) {
        console.log('Group management context found');
        return pathMappings.userGroup;
    }
    
    // If just about users/profiles, default to user profiles
    if (profileKeywords.some(keyword => normalizedPath.includes(keyword))) {
        return pathMappings.userProfile;
    }
    
    // Default to dashboard if no match found
    return pathMappings.dashboard;
};

// Get system message based on context
const getSystemMessage = async (context) => {
    // Get route context for current page
    const routeContext = await navigationHelper.getRouteContext(context.currentPath);
    
    let navigationContext = '';
    if (routeContext) {
        const { current, parent, siblings } = routeContext;
        navigationContext = `
        Current location: ${current.title} - ${current.description}
        ${parent ? `Section: ${parent.title}` : ''}
        ${siblings.length > 0 ? `Related pages: ${siblings.map(s => s.title).join(', ')}` : ''}`;
    }

    return {
        role: 'system',
        content: `You are Webeon's AI assistant, helping users navigate and use the financial management system.

        ${navigationContext}

        IMPORTANT RULES:
        1. Be concise and friendly
        2. For navigation requests, respond ONLY with the navigation action
        3. For other requests, provide helpful information about the system
        4. Never include technical details or JSON in your visible response

        When responding to navigation requests:
        1. Use this exact format:
        {
            "message": "I'll take you to [destination]",
            "actions": [
                {
                    "type": "navigate",
                    "path": "[exact path]"
                }
            ]
        }

        Keep responses natural and helpful.`
    };
};

// AI Chat endpoint
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message, context } = req.body;
        
        // Get best matching route based on user's message
        const routeMatch = await navigationHelper.findBestRoute(message);
        console.log('Route match:', routeMatch);

        // If we found a matching route, return navigation action
        if (routeMatch && routeMatch.success) {
            return res.json({
                message: `I'll take you to ${routeMatch.route.title}`,
                actions: [{
                    type: 'navigate',
                    path: routeMatch.route.path
                }]
            });
        }

        // If no route match, proceed with OpenAI
        const systemMessage = await getSystemMessage(context);
        const messages = [
            systemMessage,
            { role: 'user', content: message }
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            temperature: 0.7,
        });

        const aiResponse = completion.choices[0].message.content;
        
        // Try to parse the response as JSON
        try {
            const jsonResponse = JSON.parse(aiResponse);
            res.json(jsonResponse);
        } catch {
            // If not JSON, send as regular message
            res.json({ 
                message: aiResponse,
                actions: []
            });
        }
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ 
            message: 'I encountered an error. Please try again or be more specific.',
            actions: []
        });
    }
});

// Transaction Analysis endpoint
router.post('/transaction-analysis', authMiddleware, async (req, res) => {
    try {
        // Validate OpenAI setup
        validateOpenAISetup();

        const { transaction, historicalContext } = req.body;

        const systemMessage = `Analyze this financial transaction for potential issues or insights:
        ${JSON.stringify(transaction)}
        
        Consider:
        - Unusual patterns
        - Compliance risks
        - Optimization opportunities
        - Similar historical transactions`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemMessage }
            ],
            max_tokens: 200
        });

        res.json({ 
            analysis: completion.choices[0].message.content,
            riskLevel: calculateRiskLevel(transaction)
        });
    } catch (error) {
        console.error('Transaction Analysis Error:', error);
        res.status(500).json({
            error: 'Failed to analyze transaction',
            errorCode: 'ANALYSIS_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Rate Prediction endpoint
router.post('/rate-prediction', authMiddleware, async (req, res) => {
    try {
        const { currencyPair, timeFrame } = req.body;
        
        // Here you would typically integrate with a rate prediction model
        // For now, we'll return a placeholder response
        res.json({
            prediction: {
                currentRate: 1.0,
                predictedRate: 1.02,
                confidence: 0.85,
                trend: 'upward',
                factors: [
                    'Market volatility',
                    'Historical patterns',
                    'Economic indicators'
                ]
            }
        });
    } catch (error) {
        console.error('Rate Prediction Error:', error);
        res.status(500).json({ error: 'Failed to predict rates' });
    }
});

// Document Processing endpoint
router.post('/document-processing', authMiddleware, async (req, res) => {
    try {
        const { document, type } = req.body;
        
        // Here you would integrate with OCR and document processing services
        // For now, we'll return a placeholder response
        res.json({
            extracted: {
                documentType: type,
                fields: {
                    name: 'John Doe',
                    idNumber: 'ABC123',
                    expiryDate: '2025-12-31'
                },
                confidence: 0.95
            }
        });
    } catch (error) {
        console.error('Document Processing Error:', error);
        res.status(500).json({ error: 'Failed to process document' });
    }
});

function calculateRiskLevel(transaction) {
    // Implement risk calculation logic
    return 'LOW';
}

module.exports = router;
