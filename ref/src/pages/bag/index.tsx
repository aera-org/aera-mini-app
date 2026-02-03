import { useState, useEffect, useMemo } from 'react';
import Filter from '../../components/filter';
import { usePage } from '../../context/pageContext';
import { imgInventory } from './inventory';
import { PAGES } from '../../constants/page';
import classNames from 'classnames';
import { useUser } from '../../context/userContext';
import { useCurrency } from '../../hooks/useCurrency';
import { useCharacterContext } from '../../context/characterContext';
import { Text } from '../../components/text';
import s from './index.module.css';
import { girlsCard } from '../girls/girls';
import { icons } from '../../assets/icons';
import { userApi } from '@/api/user';
import { SubscriptionPlanSection, SubscriptionPlan } from '../../components/subscriptionPlanSection';
import { SubscriptionPlanInfo } from '../../components/subscriptionPlanInfo';
import { usePayment } from '../../hooks/usePayment';
import { PaymentCurrency } from '../../lib/paymentService';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_FEATURES } from '../../constants/subscription';

type InventoryItem = {
  name: string;
};

type UserInventory = {
  gym?: InventoryItem[];
  ball?: InventoryItem[];
  girls?: { name: string }[];
};

type UserData = {
  inventory?: UserInventory;
  girl?: string;
};

type CardItem = {
  label: string;
  bgImage?: string;
  image?: string;
  userHave?: boolean;
  isCurrentGirl?: boolean;
};

// Bag Card Component
const BagCard = ({
  item,
  isCurrentGirl,
  onClick,
  isLoading,
}: {
  item: CardItem;
  isCurrentGirl?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
}) => {
  return (
    <div
      className={classNames(s.bagCard, {
        [s.loading || '']: isLoading,
        [s.currentGirl || '']: isCurrentGirl,
      })}
      onClick={() => {
        if (isLoading) return;
        if (onClick) {
          onClick();
        }
      }}
    >
      <div className={s.cardImageContainer}>
        <img
          src={item.image || item.bgImage || '/src/assets/girls/default.webp'}
          alt={item.label}
          className={s.cardImage}
        />
        {isCurrentGirl && (
          <div className={s.activeBadge}>
            <img src={icons.greenCheck} />
          </div>
        )}
        {isLoading && (
          <div className={s.loadingOverlay}>
            <div className={s.spinner}></div>
          </div>
        )}
      </div>
      <div className={s.cardName}>{item.label}</div>
    </div>
  );
};

const Bag = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [, forceUpdate] = useState({}); // Force re-render trick
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[1]!);
  const { page } = usePage();
  const { user, setUser } = useUser();
  const { getCharacterByName } = useCharacterContext();
  const { processPayment } = usePayment();
  const { icon: currencyIcon, namePrefixed } = useCurrency();
  const userData = user?.data as UserData | undefined;

  // Override features with dynamic currency
  const dynamicFeatures = useMemo(() =>
    SUBSCRIPTION_FEATURES.map(feature =>
      feature.text.includes('#JUMPS')
        ? { ...feature, icon: currencyIcon, text: feature.text.replace('#JUMPS', namePrefixed) }
        : feature
    ),
    [currencyIcon, namePrefixed]
  );

  // Force re-render when user.data.girl changes
  useEffect(() => {
    forceUpdate({});
  }, [userData?.girl]);

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

  const inventoryFilters = userData?.inventory
    ? Object.keys(userData.inventory).filter((key) => key !== 'girls') // exclude girls from other filters
    : [];

  const hasGirls =
    (userData?.inventory?.girls && userData.inventory.girls.length > 0) ||
    userData?.girl;
  const filterItems = hasGirls
    ? ['Girls', ...inventoryFilters]
    : inventoryFilters;

  const getUserGirls = (): CardItem[] => {
    const inventoryGirls = userData?.inventory?.girls || [];
    const currentGirl = userData?.girl;

    // Add current girl to inventoryGirls if not already there
    if (currentGirl && !inventoryGirls.find((g) => g.name === currentGirl)) {
      inventoryGirls.push({ name: currentGirl });
    }

    const allUserGirls: CardItem[] = [];

    // Then add all inventory girls
    inventoryGirls.forEach((girl) => {
      let imageUrl = '/src/assets/girls/default.webp';

      // Try to get character data from character context first
      const characterData = getCharacterByName(girl.name);
      if (characterData?.s3_files?.store_image?.key) {
        // Use S3 URL with proper construction
        const s3Url = import.meta.env.VITE_S3_URL;
        if (s3Url) {
          const cleanS3Url = s3Url.replace(/\/$/, '');
          imageUrl = `https://${cleanS3Url}/${characterData.s3_files.store_image.key}`;
        } else {
          // Fallback to direct S3 URL if no env variable
          imageUrl = `https://cdn.bubblejump.ai/${characterData.s3_files.store_image.key}`;
        }
      } else {
        // Fallback to girlsCard image
        const girlData = girlsCard.find((g) => g.title === girl.name);
        if (girlData?.img) {
          imageUrl = girlData.img;
        }
      }

      allUserGirls.push({
        label: girl.name,
        image: imageUrl,
        userHave: true,
        isCurrentGirl: girl.name === currentGirl,
      });
    });

    return allUserGirls;
  };

  const getOtherInventoryItems = (): CardItem[] => {
    if (!userData?.inventory) return [];

    return (
      inventoryFilters
        .filter((filter) => filter !== 'girls')
        .map((itemFilter) => {
          const items = userData.inventory?.[itemFilter as keyof UserInventory];
          return (items as InventoryItem[])?.map(
            (el: InventoryItem): CardItem => {
              const itemName = el.name.toLowerCase().split(' ').join('');
              const category = itemFilter as keyof typeof imgInventory;
              const imageCategory = imgInventory[category];
              return {
                label: el.name,
                bgImage:
                  imageCategory?.[itemName as keyof typeof imageCategory],
              };
            }
          );
        })
        .flat()
        .filter((item): item is CardItem => item !== undefined) || []
    );
  };

  const userGirls = useMemo(
    () => getUserGirls(),
    [userData?.inventory?.girls, userData?.girl]
  );
  const otherItems = useMemo(
    () => getOtherInventoryItems(),
    [userData?.inventory]
  );
  const allItems: CardItem[] = useMemo(
    () => [...userGirls, ...otherItems],
    [userGirls, otherItems]
  );

  const activeItems: CardItem[] = useMemo(
    () =>
      activeIndex !== null
        ? filterItems[activeIndex] === 'Girls'
          ? userGirls
          : (
              userData?.inventory?.[
                filterItems[activeIndex] as keyof UserInventory
              ] as InventoryItem[]
            )?.map((item: InventoryItem): CardItem => {
              const itemName = item.name.toLowerCase().split(' ').join('');
              const category = filterItems[
                activeIndex
              ] as keyof typeof imgInventory;
              const imageCategory = imgInventory[category];
              return {
                label: item.name,
                bgImage:
                  imageCategory?.[itemName as keyof typeof imageCategory],
              };
            }) || []
        : [],
    [activeIndex, filterItems, userGirls, userData?.inventory]
  );

  const handleGirlSelect = async (girlName: string) => {
    if (loading) return; // Prevent multiple clicks

    setLoading(girlName);
    try {
      const result = await userApi.selectGirl(girlName);

      if (result.success) {
        // Mutate the girl locally in the user context
        if (user && setUser) {
          setUser({
            ...user,
            data: {
              ...user.data,
              girl: girlName,
            },
          });
          // Force component re-render
          forceUpdate({});
        }

        // Alternative: Force fresh data from server if local update doesn't work
        // Uncomment next line if local update doesn't trigger re-render
        // if (updateUser) await updateUser();
      } else {
        console.error('Failed to select girl:', result.message);
      }
    } catch (error) {
      console.error('Error selecting girl:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      className={classNames(s.container, {
        isHidden: page !== PAGES.BAG,
      })}
    >
      {filterItems.length > 0 && (
        <Filter
          setActiveIndex={setActiveIndex}
          activeIndex={activeIndex}
          className={s.filterBag || ''}
          items={filterItems}
        />
      )}

      <SubscriptionPlanInfo />
      
      {(activeIndex === null ? allItems : activeItems).length > 0 ? (
        <div className={s.cardsGrid}>
          {(activeIndex === null ? allItems : activeItems).map(
            (item, index) => (
              <BagCard
                key={`${item.label}-${index}`}
                item={item}
                isCurrentGirl={item.isCurrentGirl || false}
                onClick={() => {
                  if (loading) return;

                  // Only allow selecting girls that user owns and are not current
                  if (
                    item.userHave &&
                    userGirls.some((girl) => girl.label === item.label) &&
                    !item.isCurrentGirl
                  ) {
                    handleGirlSelect(item.label);
                  }
                }}
                isLoading={loading === item.label}
              />
            )
          )}
        </div>
      ) : (
        <div className={s.emptyBag}>
          <Text color="white" variant="h2">
            No items in your bag
          </Text>
        </div>
      )}
      {!isSubscriptionActive && (
        <SubscriptionPlanSection
          plans={SUBSCRIPTION_PLANS}
          features={dynamicFeatures}
          selectedPlan={selectedPlan}
          onPlanSelect={setSelectedPlan}
          onSubscribe={handleSubscribe}
        />
      )}
    </div>
  );
};

export default Bag;
