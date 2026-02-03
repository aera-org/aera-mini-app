import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import { sendMessage } from '../api/messages';
import { useUser } from './userContext';
import { logger } from '../utils/logger';

export type Conversation = {
  ai: string;
  user: string;
  options?: string[];
  timestamp?: number;
};

interface ChatContextProps {
  conversations: Conversation[];
  quickReplies: string[];
  isLoading: boolean;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  addConversation: (text: string) => Promise<void>;
  setQuickReplies: (replies: string[]) => void;
  inputValue: string;
  setInputValue: (val: string) => void;
}

const INITIAL_OPTIONS = [
  'Hello! How are you?',
  'Whats up babe',
  'Lets get started',
];

const MAX_MESSAGES = 1;
const STORAGE_KEY = 'chat_history';

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>(INITIAL_OPTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // TODO for hide chat
  const [inputValue, setInputValue] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        const limitedHistory = parsedHistory.slice(-MAX_MESSAGES);
        setConversations(limitedHistory);
      } catch (error) {
        logger.error('Failed to load chat history', { error: String(error) });
      }
    }
  }, []);

  const saveChatHistory = (newConversations: Conversation[]) => {
    try {
      const limitedHistory = newConversations.slice(-MAX_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      logger.error('Failed to save chat history', { error: String(error) });
    }
  };

  const addConversation = async (text: string) => {
    const newConversation: Conversation = {
      user: text,
      ai: '...',
      timestamp: Date.now(),
    };
    const updatedConversations = [...conversations, newConversation].slice(
      -MAX_MESSAGES
    );
    setConversations(updatedConversations);
    saveChatHistory(updatedConversations);
    setIsLoading(true);
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await sendMessage({
        chat_id: user.id,
        bot_name: 'Eliza',
        message: text,
      });
      const finalConversations = updatedConversations.map((conv, index) => {
        if (index === updatedConversations.length - 1) {
          return {
            ...conv,
            ai:
              response.messages[0]?.content ||
              'Sorry, I could not process your request.',
            options: response.options || [],
          };
        }
        return conv;
      }) as Conversation[];
      setConversations(finalConversations);
      saveChatHistory(finalConversations);
      if (response.options?.length) {
        setQuickReplies(response.options);
      }
    } catch (error) {
      logger.error('Failed to send message', { error: String(error) });
      const errorConversations = updatedConversations.map((conv, index) => {
        if (index === updatedConversations.length - 1) {
          return {
            ...conv,
            ai: 'Sorry, there was an error processing your request.',
          };
        }
        return conv;
      });
      setConversations(errorConversations);
      saveChatHistory(errorConversations);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        quickReplies,
        isLoading,
        isVisible,
        setIsVisible,
        addConversation,
        setQuickReplies,
        inputValue,
        setInputValue,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
