import { FC, useState, useMemo } from 'react';
import { useUser } from '../../context/userContext';
import { useCurrency } from '../../hooks/useCurrency';
import { Text } from '../../components/text';
import { usePayment } from '../../hooks/usePayment';
import { PaymentCurrency } from '../../lib/paymentService';
import { SubscriptionPlanSection, SubscriptionPlan } from '../../components/subscriptionPlanSection';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_FEATURES } from '../../constants/subscription';
import s from './index.module.css';

const SubscriptionPage: FC = () => {
  const { user } = useUser();
  const { processPayment } = usePayment();
  const { icon: currencyIcon, namePrefixed } = useCurrency();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[1]!);

  // Override features with dynamic currency
  const dynamicFeatures = useMemo(() =>
    SUBSCRIPTION_FEATURES.map(feature =>
      feature.text.includes('#JUMPS')
        ? { ...feature, icon: currencyIcon, text: feature.text.replace('#JUMPS', namePrefixed) }
        : feature
    ),
    [currencyIcon, namePrefixed]
  );

  const isSubscriptionActive =
    user?.subscription_expires_at &&
    new Date(user.subscription_expires_at) > new Date();

  const handleSubscribe = async () => {
    if (!user) return;

    await processPayment(user, 'subscription', {
      id: 'subscription',
      price: selectedPlan.price,
      name: `${selectedPlan.name} Subscription`,
      currency: PaymentCurrency.XTR,
      planId: selectedPlan.id,
      period: selectedPlan.period,
    });
  };

  return (
    <div className={s.container}>
      {isSubscriptionActive ? (
        <div className={s.activeSubscription}>
          <Text>
            Subscription is active until:{' '}
            {new Date(
              user?.subscription_expires_at || ''
            ).toLocaleDateString()}
          </Text>
        </div>
      ) : (
        <div className={s.subscriptionPlanSection}>
          <SubscriptionPlanSection
            plans={SUBSCRIPTION_PLANS}
            features={dynamicFeatures}
            selectedPlan={selectedPlan}
            onPlanSelect={setSelectedPlan}
            onSubscribe={handleSubscribe}
          />
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
