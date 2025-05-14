import { apiClient } from './apiClient';

class AIService {
    async getChatbotResponse(userQuery, contextData) {
        try {
            const response = await apiClient.post('/ai/chat', {
                query: userQuery,
                context: {
                    currentPage: contextData.currentPage,
                    userRole: contextData.userRole,
                    recentActions: contextData.recentActions
                }
            });
            return response.data;
        } catch (error) {
            console.error('AI Chat Error:', error);
            throw error;
        }
    }

    async getTransactionInsights(transactionData) {
        try {
            const response = await apiClient.post('/ai/transaction-analysis', {
                transaction: transactionData,
                historicalContext: true
            });
            return response.data;
        } catch (error) {
            console.error('Transaction Analysis Error:', error);
            throw error;
        }
    }

    async getRatePrediction(currencyPair) {
        try {
            const response = await apiClient.post('/ai/rate-prediction', {
                currencyPair,
                timeFrame: '24h'
            });
            return response.data;
        } catch (error) {
            console.error('Rate Prediction Error:', error);
            throw error;
        }
    }

    async processDocument(documentImage, documentType) {
        try {
            const formData = new FormData();
            formData.append('document', documentImage);
            formData.append('type', documentType);

            const response = await apiClient.post('/ai/document-processing', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Document Processing Error:', error);
            throw error;
        }
    }
}

export const aiService = new AIService();
