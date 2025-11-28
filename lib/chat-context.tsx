'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ChatHistoryItem {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
}

interface ChatContextValue {
  chatHistory: ChatHistoryItem[];
  addToHistory: (title: string, preview: string) => void;
  clearHistory: () => void;
  shouldResetChat: boolean;
  triggerChatReset: () => void;
  acknowledgeChatReset: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [shouldResetChat, setShouldResetChat] = useState(false);

  const addToHistory = useCallback((title: string, preview: string) => {
    setChatHistory(prev => [{
      id: Date.now().toString(),
      title: title.slice(0, 50),
      preview: preview.slice(0, 100),
      timestamp: new Date(),
    }, ...prev.slice(0, 9)]);
  }, []);

  const clearHistory = useCallback(() => {
    setChatHistory([]);
  }, []);

  const triggerChatReset = useCallback(() => {
    setShouldResetChat(true);
  }, []);

  const acknowledgeChatReset = useCallback(() => {
    setShouldResetChat(false);
  }, []);

  return (
    <ChatContext.Provider value={{
      chatHistory,
      addToHistory,
      clearHistory,
      shouldResetChat,
      triggerChatReset,
      acknowledgeChatReset,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

