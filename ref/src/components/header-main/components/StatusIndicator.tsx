import { Text } from '../../text';

import heart_blue from '../../../assets/hearts/blue.webp';
import heart_green from '../../../assets/hearts/green.webp';
import heart_yellow from '../../../assets/hearts/yellow.webp';
import heart_red from '../../../assets/hearts/red.webp';

export enum Status {
  FriendZone = 'Friend Zone',
  CuriousConnection = 'Curious Connection',
  Attractive = 'Attractive',
  Love = 'In Love',
}

export const statusHeartColors: Record<Status, string> = {
  [Status.FriendZone]: heart_blue,
  [Status.CuriousConnection]: heart_green,
  [Status.Attractive]: heart_yellow,
  [Status.Love]: heart_red,
};

export const statusTexts: Record<Status, string> = {
  [Status.FriendZone]: 'Friend zone',
  [Status.CuriousConnection]: 'Friend zone',
  [Status.Attractive]: 'Friend zone',
  [Status.Love]: 'Friend zone',
};

interface StatusIndicatorProps {
  className?: string | undefined;
}

export default function StatusIndicator({ className }: StatusIndicatorProps) {
  const getStatusByValue = (value: number) => {
    if ((value || 0) >= 30) {
      return Status.Love;
    } else if (value >= 19.99) {
      return Status.Attractive;
    } else if (value >= 9.99) {
      return Status.CuriousConnection;
    } else {
      return Status.FriendZone;
    }
  };

  // TODO: update logic. Now we don't have chat score
  const status = getStatusByValue(0);
  const color = statusHeartColors[status];
  const text = statusTexts[status];

  return (
    <div className={className}>
      <img src={color} alt="heart_icon" draggable={false} />
      <Text color="white" variant="h2">
        {text}
      </Text>
    </div>
  );
}
