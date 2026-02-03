import { useState } from 'react';
import { useUser } from '../context/userContext';
import { usePayment } from './usePayment';
import { PaymentCurrency } from '../lib/paymentService';

export function useSpicyVideo() {
  const [isSpicyModalOpen, setIsSpicyModalOpen] = useState(false);
  const { user } = useUser();
  const { processPayment } = usePayment();

  const handleBuySpicyVideo = async () => {
    setIsSpicyModalOpen(false);

    if (!user) {
      return;
    }

    await processPayment(user, 'undress', {
      id: 'spicy_video',
      price: 250,
      name: 'Spicy Video',
      currency: PaymentCurrency.XTR,
    });
  };

  return {
    isSpicyModalOpen,
    setIsSpicyModalOpen,
    handleBuySpicyVideo,
  };
}
