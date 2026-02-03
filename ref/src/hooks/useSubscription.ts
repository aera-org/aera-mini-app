import { useState } from 'react';
import { useUser } from '../context/userContext';
import { usePayment } from './usePayment';
import { PaymentCurrency } from '../lib/paymentService';

interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  period: number;
}

export function useSubscription() {
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const { user } = useUser();
  const { processPayment } = usePayment();

  const handleBuySubscription = async (plan: SubscriptionPlan) => {
    setIsSubscriptionModalOpen(false);

    if (!user) {
      return;
    }

    await processPayment(user, 'subscription', {
      id: 'subscription',
      price: plan.price,
      name: `${plan.name} Subscription`,
      currency: PaymentCurrency.XTR,
      planId: plan.id,
      period: plan.period,
    });
  };

  return {
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    handleBuySubscription,
  };
} 