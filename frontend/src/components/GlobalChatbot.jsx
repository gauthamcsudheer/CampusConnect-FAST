import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import "./GeminiChat.css";
import { useAuth } from "../contexts/AuthContext";

const GlobalChatbot = () => {
  const [open, setOpen] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [chatbotMessages, setChatbotMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const fetchKnowledgeBase = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/documents/combined");
      if (!response.ok) {
        throw new Error("Failed to fetch knowledge base");
      }
      const data = await response.json();
      setKnowledgeBase(data.content);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatbotMessages, isLoading]);

  const handleSendMessage = async () => {
    if (userMessage.trim() === "") return;

    const newMessages = [...chatbotMessages, { sender: "user", message: userMessage }];
    setChatbotMessages(newMessages);
    setUserMessage("");
    setIsLoading(true);

    try {
      // Check if message contains feedback
      if (userMessage.toLowerCase().includes("feedback")) {
        try {
          const token = localStorage.getItem("token");
          await axios.post(
            "http://localhost:8000/api/v1/feedback",
            {
              message: userMessage,
              user_id: user?.id
            },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          // Add a confirmation message for feedback
          setChatbotMessages(prev => [...prev, { 
            sender: "chatbot", 
            message: "Thank you for your feedback! I've recorded it and it will be reviewed by the administration." 
          }]);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("Error saving feedback:", error);
          setChatbotMessages(prev => [...prev, { 
            sender: "chatbot", 
            message: "I apologize, but I couldn't save your feedback at this moment. Please try again later." 
          }]);
          setIsLoading(false);
          return;
        }
      }

      // Regular chatbot response for non-feedback messages
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Knowledge Base:\n${knowledgeBase}\n\nUser query: ${userMessage}`,
                },
              ],
            },
          ],
        }
      );

      const botResponse =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

      const updatedMessages = [...newMessages, { sender: "chatbot", message: botResponse }];
      setChatbotMessages(updatedMessages);
    } catch (error) {
      console.error("Error fetching response:", error);
      setChatbotMessages([
        ...newMessages,
        { sender: "chatbot", message: "Sorry, I couldn't process your request." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <IconButton
        color="primary"
        onClick={() => setOpen(true)}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          backgroundColor: "white",
          boxShadow: 3,
          width: 56,
          height: 56,
          "&:hover": {
            backgroundColor: "white",
          },
        }}
      >
        <ChatIcon sx={{ fontSize: 28 }} />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: "80vh",
            maxHeight: "800px",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box component="span" sx={{ fontWeight: 600 }}>
            Global AI Assistant
          </Box>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: '#f8f9fa'
          }}>
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {chatbotMessages.length === 0 ? (
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            mb: 1,
                            '&:last-child': { mb: 0 }
                          }}
                        >
                          {children}
                        </Typography>
                      ),
                      ul: ({ children }) => (
                        <Box component="ul" sx={{ pl: 2, mb: 1 }}>
                          {children}
                        </Box>
                      ),
                      li: ({ children }) => (
                        <Typography component="li" variant="body1">
                          {children}
                        </Typography>
                      ),
                    }}
                  >
                    {`Hi there! 😊 I'm Connect AI, here to help you with all things academic and administrative. You can ask me about:

📚 **Course details** (syllabus, assignments, deadlines)  
📅 **Class schedules & exam dates**  
📖 **Study resources & recommendations**  
📌 **College policies & procedures**  
💬 **Feedback submission & support**

How can I assist you today? 🤖✨`}
                  </ReactMarkdown>
                </Paper>
              ) : (
                chatbotMessages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        bgcolor: msg.sender === 'user' ? 'primary.main' : 'white',
                        color: msg.sender === 'user' ? 'white' : 'text.primary',
                        borderRadius: 2,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      }}
                    >
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                mb: 1,
                                '&:last-child': { mb: 0 }
                              }}
                            >
                              {children}
                            </Typography>
                          ),
                          ul: ({ children }) => (
                            <Box component="ul" sx={{ pl: 2, mb: 1 }}>
                              {children}
                            </Box>
                          ),
                          li: ({ children }) => (
                            <Typography component="li" variant="body1">
                              {children}
                            </Typography>
                          ),
                        }}
                      >
                        {msg.message}
                      </ReactMarkdown>
                    </Paper>
                  </Box>
                ))
              )}
              {isLoading && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-start',
                  py: 2
                }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      maxWidth: '80%',
                      bgcolor: 'white',
                      borderRadius: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          animation: 'bounce 1.4s infinite ease-in-out',
                          '&:nth-of-type(1)': { animationDelay: '-0.32s' },
                          '&:nth-of-type(2)': { animationDelay: '-0.16s' },
                          '@keyframes bounce': {
                            '0%, 80%, 100%': { transform: 'scale(0)' },
                            '40%': { transform: 'scale(1)' }
                          }
                        }}
                      />
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          animation: 'bounce 1.4s infinite ease-in-out',
                          '&:nth-of-type(1)': { animationDelay: '-0.32s' },
                          '&:nth-of-type(2)': { animationDelay: '-0.16s' },
                          '@keyframes bounce': {
                            '0%, 80%, 100%': { transform: 'scale(0)' },
                            '40%': { transform: 'scale(1)' }
                          }
                        }}
                      />
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          animation: 'bounce 1.4s infinite ease-in-out',
                          '&:nth-of-type(1)': { animationDelay: '-0.32s' },
                          '&:nth-of-type(2)': { animationDelay: '-0.16s' },
                          '@keyframes bounce': {
                            '0%, 80%, 100%': { transform: 'scale(0)' },
                            '40%': { transform: 'scale(1)' }
                          }
                        }}
                      />
                    </Box>
                  </Paper>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>
            <Box sx={{ 
              p: 2, 
              borderTop: 1, 
              borderColor: 'divider',
              bgcolor: 'white'
            }}>
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                alignItems: 'flex-end'
              }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={isLoading || !userMessage.trim()}
                  color="primary"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'grey.300',
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalChatbot; 