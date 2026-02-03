import { FC } from 'react';
import { Text } from '../text';
import { Button } from '../button';
import s from './index.module.css';

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  period: number;
}

export interface SubscriptionFeature {
  icon: string;
  text: string;
}

interface SubscriptionPlanSectionProps {
  plans: SubscriptionPlan[];
  features: SubscriptionFeature[];
  selectedPlan: SubscriptionPlan;
  onPlanSelect: (plan: SubscriptionPlan) => void;
  onSubscribe: () => void;
}

export const SubscriptionPlanSection: FC<SubscriptionPlanSectionProps> = ({
  plans,
  features,
  selectedPlan,
  onPlanSelect,
  onSubscribe,
}) => {
  return (
    <div className={s.subscriptionContainer}>
      <div className={s.plansContainer}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`${s.planCard} ${
              selectedPlan.id === plan.id ? s.selected : ''
            }`}
            onClick={() => onPlanSelect(plan)}
          >
            <div className={s.planHeader}>
              <Text variant="h2" className={s.planName}>
                {plan.name}
              </Text>
              <div className={s.selectionIndicator}>
                {selectedPlan.id === plan.id && (
                  <div className={s.checkmark}>✓</div>
                )}
              </div>
            </div>
            <div className={s.planPriceContainer}>
              <div className={s.planPrice}>
                <span className={s.star}>★</span>
                <Text variant="h3" color="white">
                  {plan.price}
                </Text>
              </div>
              <Text variant="span" className={s.planDuration}>
                / {plan.duration}
              </Text>
            </div>
          </div>
        ))}
      </div>

      <ul className={s.features}>
        {features.map((feature, index) => (
          <li key={index} className={s.featureItem}>
            <img src={feature.icon} alt={feature.text} className={s.featureIcon} />
            <Text className={s.featureText}>{feature.text}</Text>
          </li>
        ))}
      </ul>

      <Button
        className={s.subscribeButton}
        onClick={onSubscribe}
        label={
          <div className={s.buttonContent}>
            <Text variant="h3" color="white">
              Subscribe
            </Text>
            <span className={s.star}>★</span>
          </div>
        }
      />
    </div>
  );
};