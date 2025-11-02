import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  image?: string;
}

interface SupportChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  hasUnreadMessages: boolean;
  setHasUnreadMessages: React.Dispatch<React.SetStateAction<boolean>>;
  markAsRead: () => void;
  playNotificationSound: () => void;
}

const SupportChatContext = createContext<SupportChatContextType | null>(null);

export const useSupportChat = () => {
  const context = useContext(SupportChatContext);
  if (!context) {
    throw new Error('useSupportChat must be used within SupportChatProvider');
  }
  return context;
};

interface SupportChatProviderProps {
  children: React.ReactNode;
}

export const SupportChatProvider = ({ children }: SupportChatProviderProps) => {
  const { user } = useAuth();
  
  // Carrega mensagens do cache local ou usa mensagem padrão
  const getInitialMessages = (): Message[] => {
    try {
      const cachedMessages = localStorage.getItem('supportChatMessages');
      if (cachedMessages) {
        const parsed = JSON.parse(cachedMessages);
        // Converte strings de timestamp de volta para Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.log('Erro ao carregar mensagens do cache:', error);
    }
    
    // Mensagem padrão se não houver cache
    return [
      {
        id: '1',
        text: 'Olá! Sou o assistente virtual da Taqcare. Como posso te ajudar hoje?',
        sender: 'support',
        timestamp: new Date()
      }
    ];
  };

  const [messages, setMessages] = useState<Message[]>(getInitialMessages());
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Função para tocar som de notificação
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Som de notificação não disponível');
    }
  };

  const markAsRead = () => {
    setHasUnreadMessages(false);
  };

  // Escuta por novas mensagens via Supabase Realtime
  useEffect(() => {
    if (!user || isListening) return;

    console.log('SupportChatContext: Iniciando escuta de mensagens');
    setIsListening(true);

    // Simula escuta de mensagens (em um cenário real, você usaria Supabase Realtime)
    // Por agora, vamos usar um polling simples ou webhook callbacks
    const checkForNewMessages = () => {
      // Esta função seria chamada quando uma nova mensagem chegasse via webhook
      // Por agora, vamos deixar preparado para quando implementarmos
    };

    return () => {
      setIsListening(false);
    };
  }, [user, isListening]);

  const addSupportMessage = (message: string) => {
    console.log('Adicionando nova mensagem de suporte:', message);
    
    const supportMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'support',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, supportMessage]);
    setHasUnreadMessages(true);
    playNotificationSound();
  };

  // Escuta mensagens via postMessage (para webhook responses)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SUPPORT_MESSAGE') {
        addSupportMessage(event.data.message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Exponha a função globalmente para uso direto
  useEffect(() => {
    (window as any).addSupportMessage = addSupportMessage;
    return () => {
      delete (window as any).addSupportMessage;
    };
  }, []);

  // Salva mensagens no cache local sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem('supportChatMessages', JSON.stringify(messages));
    } catch (error) {
      console.log('Erro ao salvar mensagens no cache:', error);
    }
  }, [messages]);

  const value: SupportChatContextType = {
    messages,
    setMessages,
    hasUnreadMessages,
    setHasUnreadMessages,
    markAsRead,
    playNotificationSound
  };

  return (
    <SupportChatContext.Provider value={value}>
      {children}
    </SupportChatContext.Provider>
  );
};