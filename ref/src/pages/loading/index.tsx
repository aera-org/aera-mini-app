import s from './index.module.css';
import { useCurrency } from '../../hooks/useCurrency';
import telegramLink from '../../assets/icons/telegramLink.png';
import xLink from '../../assets/icons/xLink.png';
import { Text } from '../../components/text';

export default function Loading() {
  const {
    loadingIcon,
    displayName,
    animationClass,
    loadingBackground,
    showLoadingIcon = true,
    showLoadingText = true,
    showLoadingLinks = true,
  } = useCurrency();

  return (
    <div
      className={s.container}
      style={loadingBackground ? { backgroundImage: `url(${loadingBackground})` } : undefined}
    >
      <div className={s.content}>
        <div />
        {(showLoadingIcon || showLoadingText) && (
          <div className={s.loadingSection}>
            {showLoadingIcon && (
              <img className={s[animationClass]} src={loadingIcon} alt="loadingIcon" />
            )}
            {showLoadingText && (
              <Text color="white" variant="h1">
                {displayName}
              </Text>
            )}
          </div>
        )}
        {showLoadingLinks && (
          <div className={s.links}>
            <a
              target="_blank"
              className={s.link}
              href="https://t.me/bubblejump_bot"
              rel="noreferrer"
            >
              <img src={xLink} alt="xLink" />
            </a>
            <a
              target="_blank"
              href="https://x.com/Bubblejumpai"
              className={s.link}
              rel="noreferrer"
            >
              <img src={telegramLink} alt="telegramLink" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
