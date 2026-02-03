import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { PlusIcon } from '@/assets/icons';
import airIcon from '@/assets/mini/air.png';
import bagIcon from '@/assets/mini/bag.png';
import chatIcon from '@/assets/mini/chat.png';
import fuelIcon from '@/assets/mini/fuel.png';
import giftsIcon from '@/assets/mini/gifts.png';
import { Header, MiniAppShell, Navigation } from '@/components';
import { useUser } from '@/context/UserContext';

const pageTitleMap: Record<string, string> = {
  '/characters': 'Characters',
  '/gifts': 'Gifts',
  '/bag': 'Bag',
};

export function MiniAppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const pageName = pageTitleMap[location.pathname] ?? 'Characters';
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
          onActionClick={() => navigate('/bag')}
        />
      }
      footer={
        <Navigation
          items={[
            { label: 'Gifts', path: '/gifts', icon: giftsIcon },
            { label: 'Chat', path: '/characters', icon: chatIcon },
            { label: 'Bag', path: '/bag', icon: bagIcon },
          ]}
        />
      }
    >
      <Outlet />
    </MiniAppShell>
  );
}
