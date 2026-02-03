import { Text } from '../../components/text';
import { usePage } from '../../context/pageContext';
import { useCurrency } from '../../hooks/useCurrency';
import { icons as iconAssets } from '../../assets/icons';
import { Button } from '../../components/button';
import GuideCategoryPage from '../guideCategory';

import s from './index.module.css';

export default function GuidePage() {
  const { setCategory, category } = usePage();
  const { name: currencyName, icon: currencyIcon } = useCurrency();

  const icons = [
    { title: 'AI Fuel', icon: iconAssets.fuel },
    { title: currencyName, icon: currencyIcon },
    { title: 'Status', icon: iconAssets.greyHeart },
    { title: 'Gifts', icon: iconAssets.gifts },
    { title: 'Bag', icon: iconAssets.bag },
    { title: 'Tasks', icon: iconAssets.tasks },
    { title: 'Energy', icon: iconAssets.energy },
    { title: 'AI World', icon: iconAssets.earth },
    { title: 'Referrals', icon: iconAssets.friends },
    { title: 'Leader Board', icon: iconAssets.league },
  ];

  return (
    <div className={s.container}>
      {category.isVisible ? (
        <GuideCategoryPage />
      ) : (
        icons.map(({ title, icon }) => {
          return (
            <div
              onClick={() => setCategory({ isVisible: true, name: title })}
              className={s.iconContainer}
              key={title}
            >
              <Button
                label={
                  <img
                    className={s.imageGuide}
                    src={icon}
                    alt={`icon-${title}`}
                  />
                }
                className={s.navButton}
              />
              <Text variant="small">{title}</Text>
            </div>
          );
        })
      )}
    </div>
  );
}
