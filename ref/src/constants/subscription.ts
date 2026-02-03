import {
  SubscriptionPlan,
  SubscriptionFeature,
} from '../components/subscriptionPlanSection';
import { icons } from '../assets/icons';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: '2days',
    name: '2 Days',
    duration: '2 days',
    price: 245,
    period: 2 * 24 * 60 * 60,
  },
  {
    id: '1month',
    name: '1 Month',
    duration: '1 month',
    price: 500,
    period: 30 * 24 * 60 * 60,
  },
  // {
  //   id: '3months',
  //   name: '3 Months',
  //   duration: '3 months',
  //   price: 1200,
  //   period: 90 * 24 * 60 * 60,
  // },
  // {
  //   id: '1year',
  //   name: '1 Year',
  //   duration: '1 year',
  //   price: 2000,
  //   period: 365 * 24 * 60 * 60,
  // }, //Temporary disabled
];

export const SUBSCRIPTION_FEATURES: SubscriptionFeature[] = [
  { icon: icons.messageIcon, text: 'Unlimited messages' },
  { icon: icons.fuel, text: '15000 Al fuel' },
  { icon: icons.cameraIcon, text: '300 NSFW photos' },
  { icon: icons.ball, text: '5000000 #JUMPS' },
  { icon: icons.heart, text: 'Advanced roleplay' },
];
