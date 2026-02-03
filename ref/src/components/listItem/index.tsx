import React from 'react';
import { Text } from '../text';
import s from './index.module.css';

interface ListItemProps {
  primaryInfo: string | React.ReactNode;
  secondaryInfo?: string | React.ReactNode;
  value: string | number;
  valueIcon?: string;
  valueIconAlt?: string;
  className?: string;
  onClick?: () => void;
}

export const ListItem: React.FC<ListItemProps> = ({
  primaryInfo,
  secondaryInfo,
  value,
  valueIcon,
  valueIconAlt = 'icon',
  className = '',
  onClick,
}) => {
  const formattedValue =
    typeof value === 'number' ? Math.floor(value).toLocaleString() : value;

  return (
    <div className={`${s.listItem} ${className}`} onClick={onClick}>
      <div className={s.itemInfo}>
        {secondaryInfo && (
          <div className={s.secondaryInfo}>
            {typeof secondaryInfo === 'string' ? (
              <Text variant="span" color="white">
                {secondaryInfo}
              </Text>
            ) : (
              secondaryInfo
            )}
          </div>
        )}

        <div className={s.primaryInfo}>
          {typeof primaryInfo === 'string' ? (
            <Text variant="span" color="white">
              {primaryInfo}
            </Text>
          ) : (
            primaryInfo
          )}
        </div>
      </div>

      <div className={s.valueSection}>
        {valueIcon && (
          <img
            src={valueIcon}
            alt={valueIconAlt}
            draggable={false}
            className={s.valueIcon}
          />
        )}
        <Text variant="span" color="white">
          {formattedValue}
        </Text>
      </div>
    </div>
  );
};

export default ListItem;
