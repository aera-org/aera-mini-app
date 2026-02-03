import ReactGA from 'react-ga4';

// Event types
export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// Event categories
export const EVENT_CATEGORIES = {
  PAGE_VIEW: 'page_view',
  RUBBING: 'rubbing',
  PURCHASE: 'purchase',
  PEPPER: 'pepper',
  QUEST: 'quest',
} as const;

// Actions
export const EVENT_ACTIONS = {
  VIEW: 'view',
  START: 'start',
  COMPLETE: 'complete',
  CLICK: 'click',
  BUY: 'buy',
  USE: 'use',
} as const;

/**
 * Sends an event to Google Analytics
 */
export const trackEvent = (event: AnalyticsEvent): void => {
  try {
    // Create a unique event name for easier searching
    const eventName = `${event.category}_${event.action}`;

    const gaEvent: any = {
      category: event.category,
      action: eventName, // Use the full name as action
    };

    if (event.label) {
      gaEvent.label = event.label;
    }

    if (event.value) {
      gaEvent.value = event.value;
    }

    if (event.custom_parameters) {
      gaEvent.custom_parameters = event.custom_parameters;
    }

    // Log the event for debug
    console.log('🔍 Analytics Event:', gaEvent);

    ReactGA.event(gaEvent);
  } catch (error) {
    console.error('Error tracking analytics event:', error);
  }
};

/**
 * Track rubbing (реку на бек)
 */
export const trackRubbing = (
  girl?: string,
  customParams?: Record<string, any>
): void => {
  const event: AnalyticsEvent = {
    category: EVENT_CATEGORIES.RUBBING,
    action: EVENT_ACTIONS.START,
    label: `rubbing_${girl || 'unknown'}`,
  };

  if (customParams) {
    event.custom_parameters = customParams;
  }

  trackEvent(event);
};

/**
 * Track purchase
 */
export const trackPurchase = (
  itemId: string,
  itemName: string,
  price: number,
  currency: string = 'TON',
  customParams?: Record<string, any>
): void => {
  trackEvent({
    category: EVENT_CATEGORIES.PURCHASE,
    action: EVENT_ACTIONS.BUY,
    label: itemName,
    value: price,
    custom_parameters: {
      item_id: itemId,
      currency,
      ...customParams,
    },
  });
};

/**
 * Track pepper usage
 */
export const trackPepper = (
  pepperType?: string,
  customParams?: Record<string, any>
): void => {
  const event: AnalyticsEvent = {
    category: EVENT_CATEGORIES.PEPPER,
    action: EVENT_ACTIONS.USE,
    label: pepperType || 'default',
  };

  if (customParams) {
    event.custom_parameters = customParams;
  }

  trackEvent(event);
};

/**
 * Track quests
 */
export const trackQuest = (
  questId: string,
  questName: string,
  action: 'start' | 'complete' | 'click',
  customParams?: Record<string, any>
): void => {
  trackEvent({
    category: EVENT_CATEGORIES.QUEST,
    action: action,
    label: questName,
    custom_parameters: {
      quest_id: questId,
      ...customParams,
    },
  });
};

/**
 * Track quest completion
 */
export const trackQuestComplete = (
  questId: string,
  questName: string,
  reward?: string,
  customParams?: Record<string, any>
): void => {
  trackEvent({
    category: EVENT_CATEGORIES.QUEST,
    action: EVENT_ACTIONS.COMPLETE,
    label: questName,
    custom_parameters: {
      quest_id: questId,
      reward,
      ...customParams,
    },
  });
};
