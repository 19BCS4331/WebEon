import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Fab,
  IconButton,
  Typography,
  Paper,
  TextField,
  CircularProgress,
  Zoom,
  Slide,
  Fade,
  Avatar,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as SmartToyIcon,
  Chat as ChatIcon,
  AccountCircle as UserIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { apiClient } from '../../services/apiClient';
import ThemeContext from '../../contexts/ThemeContext';
import { useAppActions } from '../../contexts/AppActionsContext';

// Styled Components
const ChatContainer = styled(Paper)(({ theme, Colortheme }) => ({
  position: 'fixed',
  bottom: 80,
  right: 20,
  width: 360,
  maxWidth: '90vw',
  height: 500,
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  borderRadius: '12px',
  background: Colortheme.background,
  zIndex: 9999,
  '@media (max-width:600px)': {
    width: '90vw',
    height: '80vh',
    bottom: 20,
  },
}));

const MessageList = styled(Box)(({ theme, Colortheme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  background: Colortheme.background,
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: Colortheme.background,
  },
  '&::-webkit-scrollbar-thumb': {
    background: Colortheme.secondaryBGcontra,
    borderRadius: '3px',
  },
}));

const MessageBubble = ({ message, isUser }) => {
  const { Colortheme } = useContext(ThemeContext);

  // Helper function to format markdown-like text
  const formatMessage = (text) => {
// Ensure text is a string and not undefined
if (!text || typeof text !== 'string') {
  // If message is an object with a text property, use that
  if (text && typeof text === 'object' && text.text) {
    text = text.text;
  } else {
    return <Box sx={{ mb: 0.5 }}>{''}</Box>;
  }
}
    // Split the message into lines
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Format bold text
      line = line.replace(/\*\*(.*?)\*\*/g, (_, text) => (
        `<strong>${text}</strong>`
      ));
      
      // Format bullet points
      if (line.trim().startsWith('•')) {
        return (
          <Box key={index} sx={{ 
            pl: 2,
            display: 'flex',
            alignItems: 'flex-start',
            mb: 0.5 
          }}>
            <span style={{ marginRight: '8px' }}>•</span>
            <span dangerouslySetInnerHTML={{ __html: line.substring(1) }} />
          </Box>
        );
      }
      
      // Format numbered lists (e.g., "1.", "2.", etc.)
      if (/^\d+\./.test(line.trim())) {
        return (
          <Box key={index} sx={{ 
            pl: 2,
            display: 'flex',
            alignItems: 'flex-start',
            mb: 0.5 
          }}>
            <span style={{ 
              marginRight: '8px',
              minWidth: '20px'
            }}>{line.match(/^\d+\./)[0]}</span>
            <span dangerouslySetInnerHTML={{ 
              __html: line.replace(/^\d+\./, '').trim() 
            }} />
          </Box>
        );
      }

      // Format navigation paths
      line = line.replace(/\*\*(.*?)\*\*/g, (_, text) => {
        if (text.includes('>')) {
          return `<span style="color: ${Colortheme.accent}; font-weight: bold;">${text}</span>`;
        }
        return `<strong>${text}</strong>`;
      });

      // Format headers (lines ending with ':')
      if (line.trim().endsWith(':')) {
        return (
          <Box key={index} sx={{ 
            fontWeight: 'bold',
            mb: 1,
            mt: index > 0 ? 2 : 0
          }}>
            {line}
          </Box>
        );
      }

      // Regular text
      return (
        <Box key={index} sx={{ mb: 0.5 }} 
          dangerouslySetInnerHTML={{ __html: line }} 
        />
      );
    });
  };

  // Determine background and text colors based on user type and theme
  const bubbleStyle = isUser ? {
    bgcolor: Colortheme.background,
    color: Colortheme.text,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    '& a': {
      color: Colortheme.text,
      textDecoration: 'underline'
    }
  } : {
    bgcolor: Colortheme.secondaryBG,
    color: Colortheme.secondaryBGcontra,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    '& a': {
      color: Colortheme.text,
      textDecoration: 'underline'
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        position: 'relative'
      }}
    >
      {!isUser && (
        <Avatar
          sx={{
            bgcolor: Colortheme.background,
            mr: 1,
            width: 32,
            height: 32
          }}
        >
          <SmartToyIcon sx={{ color: Colortheme.secondaryBGcontra }} />
        </Avatar>
      )}
      <Box
        sx={{
          maxWidth: '75%',
          minWidth: '20%',
          borderRadius: 2,
          p: 1.5,
          position: 'relative',
          ...bubbleStyle,
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <Box sx={{ mb: 0.5 }}>
          {formatMessage(message.text)}
        </Box>
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: -20,
            right: isUser ? 0 : 'auto',
            left: isUser ? 'auto' : 0,
            opacity: 0.7,
            fontSize: '0.7rem',
            color: Colortheme.secondaryBGcontra
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Typography>
      </Box>
      {isUser && (
        <Avatar
          sx={{
            bgcolor: Colortheme.background,
            ml: 1,
            width: 32,
            height: 32
          }}
        >
          <PersonIcon sx={{ color: Colortheme.secondaryBGcontra }} />
        </Avatar>
      )}
    </Box>
  );
};

const InputContainer = styled(Box)(({ Colortheme }) => ({
  padding: '16px',
  background: Colortheme.secondaryBG,
  borderTop: `1px solid ${Colortheme.secondaryBGcontra}20`,
}));

const StyledTextField = styled(TextField)(({ Colortheme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '24px',
    backgroundColor: Colortheme.background,
    '& fieldset': {
      borderWidth: '1px',
      borderColor: `${Colortheme.secondaryBGcontra}40`,
    },
    '&:hover fieldset': {
      borderColor: Colortheme.secondaryBGcontra,
    },
    '&.Mui-focused fieldset': {
      borderColor: Colortheme.secondaryBGcontra,
    },
  },
  '& .MuiOutlinedInput-input': {
    color: Colortheme.text,
  },
}));

const StyledFab = styled(Fab)(({ Colortheme }) => ({
  position: 'fixed',
  bottom: 20,
  right: 20,
  background: Colortheme.secondaryBG,
  color: Colortheme.text,
  transition: 'all 0.3s ease',
  zIndex: 9999,
  '&:hover': {
    background: Colortheme.secondaryBGcontra,
    transform: 'scale(1.1)',
  },
}));

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionData, setCurrentSessionData] = useState(null);
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);
  const location = useLocation();
  const inputRef = useRef(null);
  const { Colortheme } = useContext(ThemeContext);
  const appActions = useAppActions();

  // Handle ResizeObserver error
  useEffect(() => {
    const resizeObserverError = error => {
      if (error.message.includes('ResizeObserver')) {
        error.preventDefault();
      }
    };

    window.addEventListener('error', resizeObserverError);
    return () => window.removeEventListener('error', resizeObserverError);
  }, []);

  // Debounced scroll to bottom with animation check
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && messageListRef.current) {
      try {
        // Scroll the message list to the bottom
        messageListRef.current.scrollTo({
          top: messageListRef.current.scrollHeight,
          behavior: 'smooth'
        });
        
        // Also ensure the end message is in view
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      } catch (error) {
        console.log('Scroll error handled:', error);
      }
    }
  }, []);

  // Scroll to bottom whenever messages change or chat opens
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isOpen, scrollToBottom]);

  // Add scroll to bottom when chat opens
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          text: "Hello! 👋 I'm your Webeon Assistant. I'm here to help you with:\n\n" +
                "• Financial management questions\n" +
                "• System navigation assistance\n" +
                "• General inquiries about Webeon\n\n" +
                "How can I assist you today?",
          sender: 'assistant',
          timestamp: new Date(),
        }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle chat message and potential actions
  const handleChatResponse = useCallback((response) => {
    try {
      let messageText;
      let actions = [];
      let sessionData = null;

      // Try to parse the response if it's a string
      if (typeof response === 'string') {
        // Check if the response contains a JSON block
        const jsonMatch = response.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[1]);
          messageText = data.message;
          actions = data.actions || [];
          sessionData = data.sessionData || null;
        } else {
          messageText = response;
        }
      } else {
        // Response is already an object
        messageText = response.message;
        actions = response.actions || [];
        sessionData = response.sessionData || null;
      }

      // Store the session data in state
      if (sessionData) {
        setCurrentSessionData(sessionData);
      }

      // Add the message to chat history
      setMessages(prev => [...prev, {
        text: messageText,
        sender: 'assistant',
        timestamp: new Date(),
        sessionData: sessionData
      }]);
      
      // Process any actions
      if (actions && actions.length > 0) {
        actions.forEach(action => {
          if (action.type === 'navigate') {
            appActions.navigate(action.path);
          }
        });
      }
    } catch (error) {
      // If parsing fails, display the original response
      setMessages(prev => [...prev, {
        text: typeof response === 'string' ? response : 'An error occurred',
        sender: 'assistant',
        timestamp: new Date()
      }]);
      console.error('Error processing AI response:', error);
    }
  }, [appActions]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Include current page context in the request
      const context = {
        currentPath: location.pathname,
        currentPage: document.title,
        visibleElements: Array.from(document.querySelectorAll('button, input, select'))
          .map(el => ({
            id: el.id,
            type: el.tagName.toLowerCase(),
            text: el.innerText || el.value,
            isVisible: el.offsetParent !== null
          }))
      };

      const response = await apiClient.post('/api/ai/chat', {
        message: input,
        context: context,
        sessionData: currentSessionData,
        history: messages.slice(-5) // Send last 5 messages for context
      });

      handleChatResponse(response.data);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        text: "I apologize, but I encountered an error. Please try again.",
        sender: 'assistant',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, location.pathname, handleChatResponse, currentSessionData]);

  // Don't render on login page
  if (location.pathname === '/login' || location.pathname === '/') {
    return null;
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      {isOpen ? (
        <Fade in={isOpen} timeout={300}>
          <Paper
            elevation={3}
            sx={{
              width: 360,
              height: 600,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: Colortheme.background,
              border: `1px solid ${Colortheme.secondaryBGcontra}20`,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: Colortheme.secondaryBG,
              color: Colortheme.text,
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              borderBottom: `1px solid ${Colortheme.secondaryBGcontra}20`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToyIcon />
                <Typography variant="h6">Webeon Assistant</Typography>
              </Box>
              <IconButton 
                onClick={() => setIsOpen(false)} 
                size="small" 
                sx={{ 
                  color: Colortheme.text,
                  '&:hover': {
                    background: `${Colortheme.secondaryBGcontra}20`,
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <MessageList 
              ref={messageListRef}
              Colortheme={Colortheme}
            >
              {messages.map((message, index) => (
                <Box key={index} sx={{ opacity: 1, transition: 'opacity 0.3s ease-in-out' }}>
                  <MessageBubble message={message} isUser={message.sender === 'user'} />
                </Box>
              ))}
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} sx={{ color: Colortheme.secondaryBGcontra }} />
                </Box>
              )}
              <div ref={messagesEndRef} />
            </MessageList>

            <InputContainer Colortheme={Colortheme}>
              <StyledTextField
                fullWidth
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                inputRef={inputRef}
                multiline
                maxRows={4}
                Colortheme={Colortheme}
                InputProps={{
                  endAdornment: (
                    <IconButton 
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      sx={{ 
                        color: Colortheme.secondaryBGcontra,
                        '&:hover': {
                          background: `${Colortheme.secondaryBGcontra}20`,
                        },
                        '&.Mui-disabled': {
                          color: `${Colortheme.secondaryBGcontra}40`,
                        }
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  ),
                }}
              />
            </InputContainer>
          </Paper>
        </Fade>
      ) : (
        <StyledFab
          aria-label="chat"
          onClick={() => setIsOpen(true)}
          Colortheme={Colortheme}
        >
          <ChatIcon />
        </StyledFab>
      )}
    </Box>
  );
};

export default ChatWidget;
