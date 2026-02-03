import { Text } from '../text';
import s from './index.module.css';

export default function SectionHeader({ title }: { title: string }) {
  return (
    <div className={s.container}>
      <Text variant="h2">{title}</Text>
    </div>
  );
}
