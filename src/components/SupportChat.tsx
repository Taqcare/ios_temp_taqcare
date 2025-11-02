import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, X, MessageSquare, Bot, User, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from './ui/sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSupportChat } from '@/contexts/SupportChatContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  image?: string;
}

interface UserProfile {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportChat = ({ isOpen, onClose }: SupportChatProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { messages, setMessages, markAsRead } = useSupportChat();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    
    setShouldAutoScroll(isAtBottom);
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
    if (isOpen) {
      markAsRead();
    }
  }, [messages, isOpen, markAsRead, shouldAutoScroll]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`https://jqqnscbbbrrzohnxhscg.supabase.co/rest/v1/profiles?user_id=eq.${user.id}&select=first_name,last_name,email,phone`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcW5zY2JiYnJyem9obnhoc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNzY3NjMsImV4cCI6MjA2MjY1Mjc2M30.OGijbvuVuonrW32C2OjHyQI9piSpocErtZZsAvwEaeo',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcW5zY2JiYnJyem9obnhoc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNzY3NjMsImV4cCI6MjA2MjY1Mjc2M30.OGijbvuVuonrW32C2OjHyQI9piSpocErtZZsAvwEaeo`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setUserProfile(data[0]);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSendMessage = async (image?: string) => {
    if ((!inputValue.trim() && !image) || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim() || (image ? 'Foto enviada' : ''),
      sender: 'user',
      timestamp: new Date(),
      image
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShouldAutoScroll(true); // Force scroll on new user message

    try {
      const { data, error } = await supabase.functions.invoke('support-chat', {
        body: {
          message: image ? null : userMessage.text,
          user_id: user.id,
          user_name: userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : null,
          user_email: userProfile?.email || user.email,
          user_phone: userProfile?.phone || null,
          image: image ? image : null
        }
      });

      if (error) throw error;

      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Desculpe, não consegui processar sua mensagem. Tente novamente.',
        sender: 'support',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, supportMessage]);
      setShouldAutoScroll(true); // Force scroll on new support message
    } catch (error: any) {
      console.error('Erro no chat de suporte:', error);
      toast.error('Erro no chat', {
        description: 'Não foi possível enviar sua mensagem. Tente novamente.'
      });

      // Resposta de fallback
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, estou com problemas técnicos no momento. Para suporte imediato, entre em contato pelo WhatsApp: (11) 99999-9999 ou email: suporte@taqcare.com.br',
        sender: 'support',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, fallbackMessage]);
      setShouldAutoScroll(true); // Force scroll on fallback message
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Arquivo muito grande', {
        description: 'A imagem deve ter no máximo 5MB.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      handleSendMessage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-4 right-4 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-primary text-white rounded-t-xl">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium text-sm">Chat IA</span>
            </div>
            <span className="text-xs opacity-80 ml-8">Todas as mensagens são armazenadas na base de dados da IA</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-md"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50"
        >
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'support' && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  message.sender === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-md'
                }`}
              >
                {message.image && (
                  <img 
                    src={message.image} 
                    alt="Imagem enviada" 
                    className="max-w-full h-auto rounded-lg mb-2 max-h-40 object-cover border border-gray-200 dark:border-gray-600"
                  />
                )}
                <p className="whitespace-pre-wrap">{message.text}</p>
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="w-full border-gray-300 dark:border-gray-600 focus:border-primary rounded-lg"
                disabled={isLoading}
              />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="h-10 w-10 p-0 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Camera className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleSendMessage()}
              disabled={(!inputValue.trim()) || isLoading}
              size="sm"
              className="h-10 w-10 p-0 bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SupportChat;