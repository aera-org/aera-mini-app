import { Button } from '../button';
import { Text } from '../text';
import success from '../../assets/success.png';
import { useCurrency } from '../../hooks/useCurrency';
import storeItem from '../../assets/storeItem.png';

import s from './index.module.css';
import classNames from 'classnames';

export default function Card({
  label,
  userHave,
  stars = 0,
  bgImage,
  jumps,
  // price = 150,
  image = storeItem,
  soon = false,
  onClick,
}: {
  label: React.ReactNode;
  userHave?: boolean;
  bgImage?: string;
  price?: number;
  stars?: number;
  image?: string;
  id?: number;
  jumps?: number;
  soon?: boolean;
  onClick?: () => void;
}) {
  const { icon: currencyIcon } = useCurrency();

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : '',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className={s.card}
      onClick={onClick}
    >
      <Text center color="white" weight={400}>
        {label}
      </Text>
      {!bgImage && (
        <img
          src={image}
          alt={label?.toString()}
          className={s.giftImage}
          draggable={false}
          onClick={onClick}
        />
      )}
      {!bgImage && !soon && (
        <div className={s.btnContainer} onClick={handleButtonClick}>
          <Button
            onClick={onClick || (() => {})}
            style={{
              paddingLeft: 0,
              paddingRight: 0,
              width: '100%',
            }}
            className={s.btn || ''}
            label={
              userHave ? (
                <img
                  src={success}
                  className={s.successIcon}
                  alt="success_icon"
                  draggable={false}
                />
              ) : (
                <div className={s.btnSection}>
                  <img
                    className={s.btnImg}
                    src={currencyIcon}
                    alt="currencyIcon"
                    draggable={false}
                  />
                  <Text color="white" variant="small">
                    {(jumps || 0).toLocaleString()}
                  </Text>
                </div>
              )
            }
          />
          {!!stars && !soon && (
            <Button
              onClick={onClick || (() => {})}
              style={{
                paddingLeft: 0,
                paddingRight: 0,
                width: '100%',
              }}
              className={classNames(s.btn, s.starBtn)}
              label={
                <div className={s.btnSection}>
                  <span className={s.star}>★</span>
                  <Text color="white" variant="small">
                    {Math.floor(stars).toLocaleString()}
                  </Text>
                </div>
              }
            />
          )}
        </div>
      )}
      {soon && (
        <Button
          onClick={onClick || (() => {})}
          style={{
            paddingLeft: 0,
            paddingRight: 0,
            width: '100%',
          }}
          disabled={true}
          className={s.button}
          label={
            <div className={s.btnSection}>
              <Text color="white" variant="small">
                Soon
              </Text>
            </div>
          }
        />
      )}
    </div>
  );
}
