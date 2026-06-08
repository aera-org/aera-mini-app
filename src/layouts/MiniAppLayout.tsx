import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { postMeDeeplink } from '@/api/me';
import { PlusIcon } from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import affiliateIcon from '@/assets/mini/airs.png';
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
import { useUser } from '@/context/UserContext';

const pageTitleMap: Record<string, string> = {
  '/affiliate': 'Affiliate',
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
  const hasHandledLaunchRedirect = useRef(false);
  const trackedDeeplinkRef = useRef<string | null>(null);
  const [bagUpgradeAction, setBagUpgradeAction] = useState<(() => void) | null>(
    null,
  );
  const isGirlDetails =
    location.pathname.startsWith('/girls/') ||
    location.pathname.startsWith('/my-girls/');
  const isBagPage = location.pathname === '/bag';
  const isStorePage = location.pathname === '/store';

  const pageName = pageTitleMap[location.pathname] ?? 'Girls';
  const appClassName = pageName;

  useEffect(() => {
    if (hasHandledLaunchRedirect.current) return;
    if (location.pathname !== '/' && location.pathname !== '/girls') return;

    const rawStartParam = launchParams.startParam?.trim();
    if (!rawStartParam) return;

    if (rawStartParam.startsWith('cc__')) {
      const ref = rawStartParam.slice(4).trim();
      if (!ref) return;

      hasHandledLaunchRedirect.current = true;

      if (trackedDeeplinkRef.current !== rawStartParam) {
        trackedDeeplinkRef.current = rawStartParam;
        void postMeDeeplink({ ref, type: 'cc' }).catch(() => {});
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
              { label: 'Affiliate', path: '/affiliate', icon: affiliateIcon },

              { label: 'My Girl', path: '/my-girls', icon: myGirlIcon },
              { label: 'Girls', path: '/girls', icon: girlsIcon },
              { label: 'Gifts', path: '/gifts', icon: giftsIcon },

              { label: 'Bag', path: '/bag', icon: bagIcon },

            ]}
          />
        )
      }
    >
      <Outlet context={{ setBagUpgradeAction }} />
    </MiniAppShell>
  );
}
