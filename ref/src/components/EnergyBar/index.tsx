import classNames from 'classnames';
import whiteEnergy from '../../assets/icons/whiteEnergy.png';

import s from './index.module.css';
import { useEnergy } from '../../context/energyContext';
import { useBoost } from '../../context/boostContext';

const EnergyBar = () => {
  const {
    energy: energyValue,
    maxEnergy,
    isBoostActive,
    handleBoostAttempt,
  } = useEnergy();
  const { showBoostModal } = useBoost();

  const energy = (energyValue / maxEnergy) * 100;

  const handleClick = async () => {
    const res = await handleBoostAttempt?.();

    if (res.success === false && res.reason === 'NO_BOOSTS_REMAINING') {
      showBoostModal();
    }
  };

  const normalizedEnergy = Math.min(Math.max(energy || 0, 0), 100);

  const centerIconStyle = {
    '--clip-top': `${100 - normalizedEnergy}%`,
    '--animation-duration': '60s',
  } as React.CSSProperties;

  const circleStyle = {
    strokeDashoffset: isBoostActive ? undefined : 0,
  };

  return (
    <div className={s.progressContainer} onClick={handleClick}>
      <svg
        className={classNames(s.progressSvg, {
          [s.animate || '']: isBoostActive,
        })}
        viewBox="0 0 36 36"
      >
        <defs>
          <linearGradient
            id="progressGradient"
            x1="-2.40867"
            y1="37.3973"
            x2="54.3186"
            y2="37.3973"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#FFF700" />
            <stop offset="0.22" stopColor="#E6CB00" />
            <stop offset="1" stopColor="#CEA000" />
          </linearGradient>
        </defs>
        <path
          className={s.backgroundCircle}
          d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        {isBoostActive && (
          <path
            className={classNames(s.progressCircle, s.animate)}
            d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        )}

        {!isBoostActive && (
          <path
            className={classNames(s.progressCircle, s.propgressLine)}
            d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            style={circleStyle}
          />
        )}
      </svg>
      <div
        className={classNames(s.centerIcon, {
          [s.animate || '']: isBoostActive,
        })}
      >
        <div
          className={classNames(s.iconBackground, {
            [s.hidden || '']: isBoostActive,
          })}
          style={centerIconStyle}
        />
        <img src={whiteEnergy} alt="placeholder" draggable={false} />
      </div>
    </div>
  );
};

export default EnergyBar;
