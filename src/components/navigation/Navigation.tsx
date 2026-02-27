import { useLocation, useNavigate } from 'react-router-dom';

import { cn } from '@/common/utils';
import { Typography } from '@/components/text';

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
            className={cn(s.navItem, [], { [s.active]: isActive })}
            onClick={() => navigate(item.path)}
          >
            <span className={s.navButton}>
              <img src={item.icon} alt={item.label} draggable={false} />
            </span>
            <Typography
              as="span"
              variant="caption"
              family="system"
              className={cn(s.navLabel, [], { [s.activeLabel]: isActive })}
            >
              {item.label}
            </Typography>
          </button>
        );
      })}
    </nav>
  );
}
