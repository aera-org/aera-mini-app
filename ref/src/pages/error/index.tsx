import s from './index.module.css';
import loadingIcon from '../../assets/loading/loadingIcon.png';
import telegramLink from '../../assets/icons/telegramLink.png';
import xLink from '../../assets/icons/xLink.png';
import { Text } from '../../components/text';

export default function Error() {
  return (
    <div className={s.container}>
      <div className={s.content}>
        <div />
        <div className={s.loadingSection}>
          <img className={s.ball} src={loadingIcon} alt="loadingIcon" />
          <Text color="black" variant="h1">
            Sorry, technical work <br /> is ongoing...
          </Text>
        </div>
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
      </div>
    </div>
  );
}
