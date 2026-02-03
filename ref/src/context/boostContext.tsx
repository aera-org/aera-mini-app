import React, { createContext, useContext, useState, ReactNode } from 'react';
import { usePayment } from '../hooks/usePayment';
import { useUser } from './userContext';
import { PaymentCurrency } from '../lib/paymentService';
import { trackPurchase } from '../utils/analytics';

interface BoostContextType {
  isBoostModalOpen: boolean;
  waitTime: number;
  price: number;
  showBoostModal: (price?: number) => void;
  hideBoostModal: () => void;
  setWaitTime: (time: number) => void;
  buyBoost: () => Promise<void>;
}

const BoostContext = createContext<BoostContextType>({
  isBoostModalOpen: false,
  waitTime: 0,
  price: 250,
  showBoostModal: () => {},
  hideBoostModal: () => {},
  setWaitTime: () => {},
  buyBoost: async () => {},
});

interface BoostProviderProps {
  children: ReactNode;
}

export const BoostProvider: React.FC<BoostProviderProps> = ({ children }) => {
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [waitTime, setWaitTime] = useState(0);
  const [price, setPrice] = useState(250);
  const { processPayment } = usePayment();
  const { user } = useUser();

  const showBoostModal = (customPrice?: number) => {
    if (customPrice) {
      setPrice(customPrice);
    }
    setIsBoostModalOpen(true);
  };

  const hideBoostModal = () => {
    setIsBoostModalOpen(false);
  };

  const buyBoost = async () => {
    if (!user) return;

    trackPurchase('boost', 'Energy Boost', price, PaymentCurrency.XTR, {
      boost_type: 'energy',
      user_id: user._id,
    });

    await processPayment(user, 'boost_purchase', {
      name: 'Boost Refill',
      currency: PaymentCurrency.XTR,
      item_id: 'boost',
      item_name: 'Energy Boost',
      price: price,
    });
  };

  return (
    <BoostContext.Provider
      value={{
        isBoostModalOpen,
        waitTime,
        price,
        showBoostModal,
        hideBoostModal,
        setWaitTime,
        buyBoost,
      }}
    >
      {children}
    </BoostContext.Provider>
  );
};

export const useBoost = () => {
  const context = useContext(BoostContext);
  if (context === undefined) {
    throw new Error('useBoost must be used within a BoostProvider');
  }
  return context;
};
