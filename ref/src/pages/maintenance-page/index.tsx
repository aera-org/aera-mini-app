import { Button } from '../../components/button';
import { Text } from '../../components/text';
import s from './index.module.css';

export default function MaintenancePage() {
  const handleClick = () => {
    window.location.reload();
  };

  return (
    <div className={s.container}>
      <div className={s.content}>
        <Text color="white" variant="h2" className={s.title}>
          Under Maintenance
        </Text>
        <Text color="white" variant="span" className={s.description}>
          We are currently performing maintenance to improve our service.
          <br />
          Please try again later.
        </Text>
      </div>
      <div className={s.buttons}>
        <Button onClick={handleClick} label="Try Again" className={s.button} />
        <Button
          onClick={() => window.open('https://t.me/bubblejumps', '_blank')}
          label="Join Our Channel"
          className={s.button}
        />
      </div>
    </div>
  );
}
