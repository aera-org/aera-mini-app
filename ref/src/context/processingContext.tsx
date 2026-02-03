import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ProcessingStatus = 'loading' | 'success' | 'error';

interface ProcessingOptions {
  type?: ProcessingStatus;
  allowManualClose?: boolean;
}

interface ProcessingContextType {
  isProcessing: boolean;
  message: string;
  status: ProcessingStatus;
  allowManualClose: boolean;
  showProcessing: (message?: string, options?: ProcessingOptions) => void;
  hideProcessing: () => void;
}

const ProcessingContext = createContext<ProcessingContextType>({
  isProcessing: false,
  message: '',
  status: 'loading',
  allowManualClose: false,
  showProcessing: () => {},
  hideProcessing: () => {},
});

interface ProcessingProviderProps {
  children: ReactNode;
}

export const ProcessingProvider: React.FC<ProcessingProviderProps> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('Please wait...');
  const [status, setStatus] = useState<ProcessingStatus>('loading');
  const [allowManualClose, setAllowManualClose] = useState(false);

  const showProcessing = (customMessage?: string, options?: ProcessingOptions) => {
    setMessage(customMessage || 'Please wait...');
    setStatus(options?.type || 'loading');
    setAllowManualClose(options?.allowManualClose || false);
    setIsProcessing(true);
  };

  const hideProcessing = () => {
    setIsProcessing(false);
  };

  return (
    <ProcessingContext.Provider
      value={{
        isProcessing,
        message,
        status,
        allowManualClose,
        showProcessing,
        hideProcessing,
      }}
    >
      {children}
    </ProcessingContext.Provider>
  );
};

export const useProcessing = () => {
  const context = useContext(ProcessingContext);
  if (context === undefined) {
    throw new Error('useProcessing must be used within a ProcessingProvider');
  }
  return context;
};