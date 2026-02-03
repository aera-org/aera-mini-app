import { Button } from '../../components/button';
import { Text } from '../../components/text';
import s from './index.module.css';

export default function MobilePage() {
  const handleClick = () => {
    window.open('https://t.me/bubblejump_bot/game', '_blank');
  };

  return (
    <div className={s.container}>
      <div className={s.content}>
        <Text color="white" variant="h2" className={s.title}>
          come and play
          <br /> from Telegram!
        </Text>
        <div className={s.qrWrapper}>
          <img
            src="/qr.png"
            className={s.qrCode}
            draggable={false}
            alt="QR Code"
          />
        </div>
      </div>
      <Button onClick={handleClick} label="Let's go!" className={s.button} />
    </div>
  );
}
