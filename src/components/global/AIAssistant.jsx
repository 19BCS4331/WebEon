import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, TextField, IconButton, Typography, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const ChatContainer = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    bottom: 20,
    right: 20,
    width: 350,
    height: 500,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    overflow: 'hidden',
    boxShadow: theme.shadows[10]
}));

const ChatButton = styled(IconButton)(({ theme }) => ({
    position: 'fixed',
    bottom: 20,
    right: 20,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));

const MessageContainer = styled(Box)({
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column-reverse'
});

const Message = styled(Box)(({ theme, isUser }) => ({
    maxWidth: '80%',
    padding: '8px 12px',
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    backgroundColor: isUser ? theme.palette.primary.main : theme.palette.grey[200],
    color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary
}));

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const { userRole } = useAuth();
    const location = useLocation();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
        setIsTyping(true);

        try {
            const response = await aiService.getChatbotResponse(userMessage, {
                currentPage: location.pathname,
                userRole,
                recentActions: [] // You can implement action tracking
            });

            setMessages(prev => [...prev, { text: response.message, isUser: false }]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                text: "I'm sorry, I encountered an error. Please try again.",
                isUser: false 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) {
        return (
            <ChatButton onClick={() => setIsOpen(true)}>
                <SmartToyIcon />
            </ChatButton>
        );
    }

    return (
        <Fade in={isOpen}>
            <ChatContainer>
                <Box sx={{ 
                    p: 2, 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h6">AI Assistant</Typography>
                    <IconButton size="small" onClick={() => setIsOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <MessageContainer>
                    {isTyping && (
                        <Message isUser={false}>
                            <Typography variant="body2">Typing...</Typography>
                        </Message>
                    )}
                    {messages.map((message, index) => (
                        <Message key={index} isUser={message.isUser}>
                            <Typography variant="body2">{message.text}</Typography>
                        </Message>
                    ))}
                    <div ref={messagesEndRef} />
                </MessageContainer>

                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Ask me anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        InputProps={{
                            endAdornment: (
                                <IconButton onClick={handleSend}>
                                    <SendIcon />
                                </IconButton>
                            ),
                        }}
                    />
                </Box>
            </ChatContainer>
        </Fade>
    );
};

export default AIAssistant;
