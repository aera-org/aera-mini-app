import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { postMeDeeplink } from '@/api/me';
import { PlusIcon } from '@/assets/icons';
import profileIcon from '@/assets/mini/airs.png';
import airIcon from '@/assets/mini/air.png';
import bagIcon from '@/assets/mini/bag.png';
import fuelIcon from '@/assets/mini/fuel.png';
import giftsIcon from '@/assets/mini/gifts.png';
import girlsIcon from '@/assets/mini/girls.png';
import myGirlIcon from '@/assets/mini/my-girl.png';
import {
  BackNavigation,
  BagNavigation,
  Header,
  MiniAppShell,
  Navigation,
} from '@/components';
import { useLaunchParams } from '@/context/useLaunchParams';
import { useUser } from '@/context/user-context';

const pageClassMap: Record<string, string> = {
  '/affiliate': 'Profile',
  '/earn': 'Profile',
  '/profile': 'Profile',
  '/girls': 'Girls',
  '/my-girls': 'Girls',
  '/gifts': 'Gifts',
  '/bag': 'Bag',
  '/store': 'Store',
};

export function MiniAppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const launchParams = useLaunchParams();
  const { user } = useUser();
  const { t } = useTranslation();
  const hasHandledLaunchRedirect = useRef(false);
  const trackedDeeplinkRef = useRef<string | null>(null);
  const [bagUpgradeAction, setBagUpgradeAction] = useState<(() => void) | null>(
    null,
  );
  const isGirlDetails =
    location.pathname.startsWith('/girls/') ||
    location.pathname.startsWith('/my-girls/');
  const isScenarioDetails = location.pathname.startsWith('/scenarios/');
  const isBagPage = location.pathname === '/bag';
  const isStorePage = location.pathname === '/store';

  const appClassName = isScenarioDetails
    ? 'Scenario'
    : pageClassMap[location.pathname] ?? 'Girls';

  useEffect(() => {
    if (hasHandledLaunchRedirect.current) return;
    if (location.pathname !== '/' && location.pathname !== '/girls') return;

    const rawStartParam = launchParams.startParam?.trim();
    if (!rawStartParam) return;

    if (rawStartParam.startsWith('cc__')) {
      const [,ref,postId] = rawStartParam.split('__');
      if (!ref) return;

      hasHandledLaunchRedirect.current = true;

      if (trackedDeeplinkRef.current !== rawStartParam) {
        trackedDeeplinkRef.current = rawStartParam;
        void postMeDeeplink({ ref, postId, type: 'cc' }).catch(() => {});
      }

      navigate('/my-girls/create', { replace: true });
      return;
    }

    if (rawStartParam === 'my-girls') {
      hasHandledLaunchRedirect.current = true;
      navigate('/my-girls', { replace: true });
    }
  }, [launchParams.startParam, location.pathname, navigate]);

  return (
    <MiniAppShell
      appClassName={appClassName}
      header={
        <Header
          fuel={user?.fuel ?? 0}
          air={user?.air ?? 0}
          fuelIcon={fuelIcon}
          airIcon={airIcon}
          actionIcon={<PlusIcon />}
          onActionClick={() => navigate('/store')}
        />
      }
      footer={
        isGirlDetails || isStorePage ? (
          <BackNavigation
            onBack={() => {
              if (window.history.length > 1) {
                navigate(-1);
                return;
              }
              navigate('/girls');
            }}
          />
        ) : isBagPage ? (
          <BagNavigation
            onBack={() => {
              if (window.history.length > 1) {
                navigate(-1);
                return;
              }
              navigate('/girls');
            }}
            onUpgrade={() => bagUpgradeAction?.()}
          />
        ) : (
          <Navigation
            items={[
              { label: t('nav.profile'), path: '/profile', icon: profileIcon },

              { label: t('nav.myGirl'), path: '/my-girls', icon: myGirlIcon },
              { label: t('nav.girls'), path: '/girls', icon: girlsIcon },
              { label: t('nav.gifts'), path: '/gifts', icon: giftsIcon },

              { label: t('nav.bag'), path: '/bag', icon: bagIcon },

            ]}
          />
        )
      }
    >
      <Outlet context={{ setBagUpgradeAction }} />
    </MiniAppShell>
  );
}
