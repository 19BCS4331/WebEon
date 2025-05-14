const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const navigationHelper = require('./navigationHelper');
const TransactionModel = require("../models/pages/Transactions/TransactionModel");
const authMiddleware = require('../middleware/authMiddleware');
const appContext = require('../config/appContext');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Validate Gemini setup
const validateGeminiSetup = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured');
    }
};

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

// Helper function to extract JSON from text
const extractJsonFromText = (text) => {
    // Try to find JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.warn('Failed to parse JSON from mat:', e);
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
        5. For foreign exchange transactions, understand that:
           - "Buy" means purchasing foreign currency
           - "Sell" means selling foreign currency
           - When a user mentions a transaction with a name (e.g., "for John"), it refers to the party/customer name
           - Currency codes like USD, EUR, GBP refer to the foreign currency being bought or sold
           - Amounts are in the foreign currency unless explicitly stated otherwise

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

// Detect if a message contains a transaction intent
const detectTransactionIntent = async (message) => {
    try {
        validateGeminiSetup();
        
        const prompt = `
        Analyze the following user message and determine if it's requesting to create a foreign exchange transaction:
        "${message}"
        
        Context:
        - In this foreign exchange system, "buy" means purchasing foreign currency
        - "Sell" means selling foreign currency
        - When a user mentions a transaction with a name (e.g., "for John"), it refers to the party/customer name
        - Currency codes like USD, EUR, GBP refer to the foreign currency being bought or sold
        
        Examples of transaction intents:
        - "I want to buy 500 USD"
        - "Sell 1000 euros for John"
        - "Create a transaction to purchase 300 pounds"
        - "I need to sell 700 Canadian dollars for Smith & Co"
        
        Return a JSON object with the following structure:
        {
          "isTransactionIntent": true/false,
          "confidence": 0.0-1.0 (how confident you are in this determination)
        }
        `;
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        const jsonResponse = extractJsonFromText(response);
        
        if (jsonResponse && typeof jsonResponse.isTransactionIntent === 'boolean') {
            return jsonResponse;
        }
        
        return { isTransactionIntent: false, confidence: 0 };
    } catch (error) {
        console.error("Error detecting transaction intent:", error);
        return { isTransactionIntent: false, confidence: 0 };
    }
};

// Extract transaction details from a message
const extractTransactionDetails = async (message, userId, branchId) => {
    try {
        validateGeminiSetup();
        
        const prompt = `
            You are a financial assistant specialized in foreign exchange transactions.
            Extract the following information from this message about a foreign exchange transaction:
            1. Transaction type: Is this a "buy" or "sell" transaction? (If unclear, default to "buy")
            2. Currency: Which currency is being transacted? (e.g., USD, EUR, GBP)
            3. Amount: How much of the currency is being transacted?
            4. Party name: Who is the customer or party involved in this transaction? (If not mentioned, leave blank)

            Return the extracted information in JSON format like this:
            {
                "transactionType": "buy" or "sell",
                "currency": "USD",
                "amount": 100,
                "partyName": "John Doe"
            }

            If you can't extract the information, return null for any missing fields.
            
            Message: "${message}"
        `;
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("Failed to extract JSON from response:", text);
            return null;
        }
        
        const extractedData = JSON.parse(jsonMatch[0]);
        console.log("Extracted transaction details:", extractedData);
        
        // Validate the extracted data
        if (!extractedData.transactionType || !extractedData.currency || !extractedData.amount) {
            console.error("Missing required transaction details");
            return null;
        }
        
        return {
            transactionType: extractedData.transactionType.toLowerCase(),
            currency: extractedData.currency.toUpperCase(),
            amount: parseFloat(extractedData.amount),
            partyName: extractedData.partyName || null
        };
    } catch (error) {
        console.error("Error extracting transaction details:", error);
        return null;
    }
};

// Process transaction in steps
const processTransactionInSteps = async (message, userId, branchId, sessionData) => {
    try {
        // If we're continuing a conversation, use the stored session data
        let transactionData = sessionData || {
            conversationState: "initial",
            collectedData: {}
        };
        
        // If this is the first message, extract initial details
        if (transactionData.conversationState === "initial") {
            const extractedDetails = await extractTransactionDetails(message, userId, branchId);
            
            if (!extractedDetails) {
                return {
                    message: "I couldn't understand the transaction details. Could you please provide more information?",
                    actions: [],
                    sessionData: null
                };
            }
            
            // Store the extracted details
            transactionData.collectedData = {
                vTrntype: extractedDetails.transactionType === 'buy' ? 'P' : 'S',
                vTrnwith: 'P', // Default to Party
                exchangeData: [{
                    Currency: extractedDetails.currency,
                    Amount: extractedDetails.amount,
                    FEAmount: extractedDetails.amount,
                    Rate: 0, // Will be collected later
                    Per: 1
                }]
            };
            
            if (extractedDetails.partyName) {
                transactionData.collectedData.partyName = extractedDetails.partyName;
            }
            
            // Move to the next state - collecting party details
            transactionData.conversationState = "collecting_party";
            
            return {
                message: `I'm creating a ${extractedDetails.transactionType} transaction for ${extractedDetails.amount} ${extractedDetails.currency}${extractedDetails.partyName ? ` for ${extractedDetails.partyName}` : ''}.\n\nCould you please provide the party/customer name${extractedDetails.partyName ? ' to confirm' : ''}?`,
                actions: [],
                sessionData: transactionData
            };
        }
        
        // Collecting party details
        else if (transactionData.conversationState === "collecting_party") {
            // Extract party name from the message - take only the first line to avoid confusion
            const partyName = message.trim().split('\n')[0];
            transactionData.collectedData.partyName = partyName;
            
            // Move to collecting purpose
            transactionData.conversationState = "collecting_purpose";
            
            return {
                message: `Thank you. The party name "${partyName}" has been recorded. What is the purpose of this transaction? (e.g., Travel, Business, Education)`,
                actions: [],
                sessionData: transactionData
            };
        }
        
        // Collecting purpose
        else if (transactionData.conversationState === "collecting_purpose") {
            // Extract purpose from the message - take only the first line to avoid confusion
            const purpose = message.trim().split('\n')[0];
            transactionData.collectedData.Purpose = purpose;
            
            // Move to collecting exchange rate
            transactionData.conversationState = "collecting_rate";
            
            return {
                message: `Purpose "${purpose}" has been recorded. What is the exchange rate for this transaction? (e.g., 82.5)`,
                actions: [],
                sessionData: transactionData
            };
        }
        
        // Collecting exchange rate
        else if (transactionData.conversationState === "collecting_rate") {
            // Extract rate from the message - take only the first line and extract numbers
            const firstLine = message.trim().split('\n')[0];
            const rateMatch = firstLine.match(/\d+(\.\d+)?/);
            const rate = rateMatch ? parseFloat(rateMatch[0]) : NaN;
            
            if (isNaN(rate) || rate <= 0) {
                return {
                    message: "I couldn't understand the rate. Please provide a valid number (e.g., 82.5).",
                    actions: [],
                    sessionData: transactionData
                };
            }
            
            // Update the exchange data with the rate
            if (transactionData.collectedData.exchangeData && transactionData.collectedData.exchangeData.length > 0) {
                transactionData.collectedData.exchangeData[0].Rate = rate;
                
                // Calculate the INR amount
                const feAmount = transactionData.collectedData.exchangeData[0].FEAmount;
                const inrAmount = feAmount * rate;
                transactionData.collectedData.exchangeData[0].Amount = inrAmount;
                transactionData.collectedData.Amount = inrAmount;
            }
            
            // Move to confirmation
            transactionData.conversationState = "confirmation";
            
            // Prepare a summary for confirmation
            const txnType = transactionData.collectedData.vTrntype === 'P' ? 'buy' : 'sell';
            const currency = transactionData.collectedData.exchangeData[0].Currency;
            const feAmount = transactionData.collectedData.exchangeData[0].FEAmount;
            const inrAmount = transactionData.collectedData.exchangeData[0].Amount;
            
            return {
                message: `I've collected all the necessary information. Here's a summary:\n\n` +
                    `- Transaction: ${txnType} ${currency}\n` +
                    `- Amount: ${feAmount} ${currency}\n` +
                    `- Rate: ${rate}\n` +
                    `- INR Value: ₹${inrAmount.toFixed(2)}\n` +
                    `- Party: ${transactionData.collectedData.partyName}\n` +
                    `- Purpose: ${transactionData.collectedData.Purpose}\n\n` +
                    `Would you like to proceed with this transaction? (Yes/No)`,
                actions: [],
                sessionData: transactionData
            };
        }
        
        // Confirmation and transaction creation
        else if (transactionData.conversationState === "confirmation") {
            const confirmation = message.trim().toLowerCase();
            
            if (confirmation === 'yes' || confirmation === 'y') {
                // Proceed with creating the transaction
                try {
                    // Get today's date in YYYY-MM-DD format
                    const today = new Date().toISOString().split('T')[0];
                    
                    // Find or create party
                    let partyCode = null;
                    if (transactionData.collectedData.partyName) {
                        // Try to find existing party by name
                        const paxList = await TransactionModel.getPaxList();
                        
                        if (paxList.success) {
                            const existingParty = paxList.data.find(
                                party => party.vPaxname.toLowerCase() === transactionData.collectedData.partyName.toLowerCase()
                            );
                            
                            if (existingParty) {
                                partyCode = existingParty.nPaxcode;
                            } else {
                                // Create new party
                                const newParty = await TransactionModel.createPax({
                                    vPaxname: transactionData.collectedData.partyName,
                                    vPartyType: 'CUSTOMER'
                                });
                                
                                if (newParty.success) {
                                    partyCode = newParty.data.nPaxcode;
                                }
                            }
                        }
                    }
                    
                    // Get next transaction number
                    const nextTransactionNumber = await TransactionModel.getNextTransactionNumber(
                        transactionData.collectedData.vTrnwith,
                        transactionData.collectedData.vTrntype,
                        branchId
                    );
                    
                    // Prepare complete transaction data
                    const completeTransactionData = {
                        vTrnwith: transactionData.collectedData.vTrnwith,
                        vTrntype: transactionData.collectedData.vTrntype,
                        vNo: nextTransactionNumber.toString(),
                        date: today,
                        PaxCode: partyCode,
                        Purpose: transactionData.collectedData.Purpose,
                        nBranchID: branchId,
                        userID: userId,
                        Amount: transactionData.collectedData.Amount,
                        exchangeData: transactionData.collectedData.exchangeData.map(item => ({
                            Currency: item.Currency,
                            Amount: item.Amount,
                            Rate: item.Rate,
                            FEAmount: item.FEAmount,
                            Per: item.Per,
                            CNCodeID: item.Currency // Use currency as CNCodeID
                        }))
                    };
                    
                    // Save transaction
                    const result = await TransactionModel.saveTransaction(completeTransactionData);
                    
                    if (result.success) {
                        // Transaction created successfully
                        return {
                            message: `I've created a ${transactionData.collectedData.vTrntype === 'P' ? 'buy' : 'sell'} transaction for ${transactionData.collectedData.exchangeData[0].FEAmount} ${transactionData.collectedData.exchangeData[0].Currency} for ${transactionData.collectedData.partyName}. Transaction number: ${completeTransactionData.vNo}.`,
                            actions: [
                                {
                                    type: "transaction",
                                    data: {
                                        transactionId: result.data.nTranID,
                                        transactionNumber: completeTransactionData.vNo,
                                        transactionType: transactionData.collectedData.vTrntype === 'P' ? 'buy' : 'sell',
                                        currency: transactionData.collectedData.exchangeData[0].Currency,
                                        amount: transactionData.collectedData.exchangeData[0].FEAmount,
                                        partyName: transactionData.collectedData.partyName
                                    }
                                }
                            ],
                            sessionData: null // Clear session data after successful transaction
                        };
                    } else {
                        throw new Error("Failed to save transaction: " + (result.message || "Unknown error"));
                    }
                } catch (error) {
                    console.error("Error processing transaction:", error);
                    return {
                        message: `I'm sorry, I couldn't create the transaction. Error: ${error.message}`,
                        actions: [],
                        sessionData: null // Clear session data after error
                    };
                }
            } else {
                // User declined, cancel the transaction
                return {
                    message: "I've cancelled the transaction. Is there anything else I can help you with?",
                    actions: [],
                    sessionData: null // Clear session data after cancellation
                };
            }
        }
        
        // Fallback for unknown state
        return {
            message: "I'm not sure where we are in the transaction process. Let's start over. Could you please tell me what transaction you'd like to create?",
            actions: [],
            sessionData: null
        };
    } catch (error) {
        console.error("Error processing transaction in steps:", error);
        return {
            message: `I encountered an error while processing your transaction: ${error.message}. Let's start over.`,
            actions: [],
            sessionData: null
        };
    }
};

// AI Chat endpoint
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message, context, sessionData } = req.body;
        
        // Use default values if session data is not available
        const userId = req.session?.userId || req.user?.id || 1;
        const branchId = req.session?.branchId || req.user?.branchId || 1;
        
        console.log("Received message:", message);
        console.log("Context:", context);
        console.log("Session data:", sessionData);
        
        // Check if we're in the middle of a transaction conversation
        if (sessionData && sessionData.conversationState) {
            console.log("Continuing transaction conversation in state:", sessionData.conversationState);
            const response = await processTransactionInSteps(message, userId, branchId, sessionData);
            return res.json(response);
        }
        
        // Check if this is a new transaction intent
        const isTransactionIntent = await detectTransactionIntent(message);
        console.log("Transaction intent detection:", isTransactionIntent);
        
        // If this is a transaction intent, start the step-by-step process
        if (isTransactionIntent.isTransactionIntent && isTransactionIntent.confidence > 0.6) {
            console.log("Detected transaction intent, starting step-by-step process...");
            const response = await processTransactionInSteps(message, userId, branchId);
            return res.json(response);
        }
        
        // Check for navigation intent
        const navigationResponse = await handleNavigationIntent(message, context);
        if (navigationResponse) {
            return res.json(navigationResponse);
        }
        
        // If not a transaction intent or navigation intent, proceed with normal chat
        const systemMessage = await getSystemMessage(context);
        
        // Generate AI response
        validateGeminiSetup();
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        
        // Use a simple content generation approach instead of chat
        const prompt = `${systemMessage}\n\nUser: ${message}`;
        const result = await model.generateContent(prompt);
        
        const response = result.response;
        const text = response.text();
        
        return res.json({
            message: text,
            actions: []
        });
    } catch (error) {
        console.error("Error in AI chat endpoint:", error);
        return res.status(500).json({
            message: "Sorry, I encountered an error processing your request.",
            error: error.message
        });
    }
});

// Handle navigation intent
const handleNavigationIntent = async (message, context) => {
    try {
        validateGeminiSetup();
        
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
        
        const prompt = `
        Analyze this user message and determine if it's a navigation request:
        "${message}"
        
        ${navigationContext}
        
        If this is a navigation request, respond with a JSON object:
        {
          "isNavigationIntent": true,
          "destination": "The name of the page they want to go to",
          "confidence": 0.0-1.0 (how confident you are in this determination)
        }
        
        If it's not a navigation request, respond with:
        {
          "isNavigationIntent": false,
          "confidence": 0.0-1.0
        }
        `;
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        const jsonResponse = extractJsonFromText(response);
        
        if (jsonResponse && jsonResponse.isNavigationIntent && jsonResponse.confidence > 0.7) {
            // Find the best matching route
            const routeMatch = await navigationHelper.findBestRoute(jsonResponse.destination || message);
            
            if (routeMatch && routeMatch.success) {
                return {
                    message: `I'll take you to ${routeMatch.route.title}`,
                    actions: [{
                        type: 'navigate',
                        path: routeMatch.route.path
                    }]
                };
            }
        }
        
        return null;
    } catch (error) {
        console.error("Error handling navigation intent:", error);
        return null;
    }
};

// Transaction Analysis endpoint
router.post('/transaction-analysis', authMiddleware, async (req, res) => {
    try {
        // Validate Gemini setup
        validateGeminiSetup();

        const { transaction, historicalContext } = req.body;

        const systemMessage = `Analyze this financial transaction for potential issues or insights:
        ${JSON.stringify(transaction)}

        Consider:
        - Unusual patterns
        - Compliance risks
        - Optimization opportunities
        - Similar historical transactions`;

        // Create a Gemini model instance
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        // Generate content
        const result = await model.generateContent(systemMessage);
        const analysis = result.response.text();

        res.json({
            analysis: analysis,
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
