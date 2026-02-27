import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { PlusIcon } from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import bagIcon from '@/assets/mini/bag.png';
import fuelIcon from '@/assets/mini/fuel.png';
import giftsIcon from '@/assets/mini/gifts.png';
import girlsIcon from '@/assets/mini/girls.png';
import { Header, MiniAppShell, Navigation } from '@/components';
import { useUser } from '@/context/UserContext';

const pageTitleMap: Record<string, string> = {
  '/girls': 'Girls',
  '/gifts': 'Gifts',
  '/bag': 'Bag',
  '/store': 'Store',
};

export function MiniAppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const pageName = pageTitleMap[location.pathname] ?? 'Girls';
  const appClassName = pageName;

  return (
    <MiniAppShell
      appClassName={appClassName}
      header={
        <Header
          pageName={pageName}
          fuel={user?.fuel ?? 0}
          air={user?.air ?? 0}
          fuelIcon={fuelIcon}
          airIcon={airIcon}
          actionIcon={<PlusIcon />}
          onActionClick={() => navigate('/store')}
        />
      }
      footer={
        <Navigation
          items={[
            { label: 'Gifts', path: '/gifts', icon: giftsIcon },
            { label: 'Girls', path: '/girls', icon: girlsIcon },
            { label: 'Bag', path: '/bag', icon: bagIcon },
          ]}
        />
      }
    >
      <Outlet />
    </MiniAppShell>
  );
}
