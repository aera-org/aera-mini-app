import { useLocation, useNavigate } from 'react-router-dom';

import { cn } from '@/common/utils';

import s from './Navigation.module.scss';

type NavItem = {
  label: string;
  path: string;
  icon: string;
};

type NavigationProps = {
  items: NavItem[];
};

export function Navigation({ items }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className={s.nav}>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            className={s.navItem}
            onClick={() => navigate(item.path)}
          >
            <span className={cn(s.navButton, [], { [s.active]: isActive })}>
              <img src={item.icon} alt={item.label} draggable={false} />
            </span>
          </button>
        );
      })}
    </nav>
  );
}
