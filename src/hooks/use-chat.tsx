
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from 'uuid';

// Helper to safely get from localStorage
function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
}

// Helper to safely set to localStorage
function setToLocalStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
}


export type Message = {
  id: string;
  content: React.ReactNode;
  role: "user" | "assistant";
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};

type ChatContextType = {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeConversationId: string | null;
  isLoading: boolean;
  addMessage: (message: Message, update?: boolean) => void;
  selectConversation: (id: string) => void;
  startNewConversation: () => void;
  setIsLoading: (isLoading: boolean) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const generateTitle = (content: ReactNode): string => {
    if (typeof content === 'string') {
        return content.split(' ').slice(0, 5).join(' ');
    }
    if (React.isValidElement(content) && content.props.children) {
        const textChild = React.Children.toArray(content.props.children).find(
            (child: any) => child.type === 'p'
        );
        if (textChild && typeof textChild.props.children === 'string') {
            return textChild.props.children.split(' ').slice(0, 5).join(' ');
        }
    }
    return "New Chat";
};


export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load conversations from local storage on initial render
    const savedConversations = getFromLocalStorage<Conversation[]>('chat-conversations', []);
    const savedActiveId = getFromLocalStorage<string | null>('chat-active-id', null);
    
    if (savedConversations.length > 0) {
      setConversations(savedConversations);
      if (savedActiveId && savedConversations.some(c => c.id === savedActiveId)) {
        setActiveConversationId(savedActiveId);
      } else {
        setActiveConversationId(savedConversations[0].id);
      }
    } else {
      // Start with a new conversation if none are saved
      startNewConversation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Save conversations to local storage whenever they change
    setToLocalStorage('chat-conversations', conversations);
    setToLocalStorage('chat-active-id', activeConversationId);
  }, [conversations, activeConversationId]);

  const startNewConversation = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const addMessage = (message: Message, update = false) => {
    if (!activeConversationId) return;

    setConversations(prev =>
      prev.map(conv => {
        if (conv.id === activeConversationId) {
          const newMessages = update
            ? conv.messages.map(m => (m.id === message.id ? message : m))
            : [...conv.messages, message];

          // Update title with the first user message
          let newTitle = conv.title;
          if (conv.messages.length === 0 && message.role === 'user') {
            newTitle = generateTitle(message.content);
          }
          
          return { ...conv, messages: newMessages, title: newTitle };
        }
        return conv;
      })
    );
  };
  
  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        activeConversationId,
        isLoading,
        addMessage,
        selectConversation,
        startNewConversation,
        setIsLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
