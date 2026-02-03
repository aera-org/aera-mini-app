import { Button } from '../../components/button';
import { Text } from '../../components/text';
import s from './index.module.css';

export default function ErrorPage({ onRetry }: { onRetry: () => void }) {
  const handleClick = () => {
    if (onRetry) {
      onRetry();
    } else {
      const previousPath = sessionStorage.getItem('previousPath') || '/';
      window.location.href = previousPath;
    }
  };

  return (
    <div className={s.container}>
      <div className={s.content}>
        <Text color="white" variant="h2" className={s.title}>
          Oops!
          <br /> Technical problems
        </Text>
        <Text color="white" variant="span" className={s.description}>
          Something went wrong. Please try again later.
        </Text>
      </div>
      <Button onClick={handleClick} label="Try again" className={s.button} />
    </div>
  );
}
