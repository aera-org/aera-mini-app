import s from './index.module.css';
import { useState } from 'react';

import { Text } from '../text';
import { Button } from '../button';
import { Skeleton } from '../skeleton';

import plane from '../../assets/icons/plane.png';
import { useCurrency } from '../../hooks/useCurrency';
import success from '../../assets/success.png';
import { tasksApi } from '../../api/tasks';
import TelegramWebApp from '@twa-dev/sdk';
import { useUser } from '../../context/userContext';
import { User } from '../../types/user';
import { logger } from '../../utils/logger';
import { trackQuest, trackQuestComplete } from '../../utils/analytics';

interface ITask {
  _id: string;
  name: string;
  description: string;
}

interface TaskStatus {
  ok: boolean;
  message?: string;
  error?: string;
  redirect?: string;
}

export const TaskSkeleton = () => {
  return (
    <div className={s.container}>
      <div className={s.leftSection}>
        <Skeleton width={32} height={32} borderRadius="50%" />
        <div className={s.description}>
          <Skeleton width={180} height={20} />
          <div className={s.btnSection}>
            <Skeleton width={20} height={20} borderRadius="50%" />
            <Skeleton width={40} height={20} className={s.marginLeft || ''} />
          </div>
        </div>
      </div>
      <Skeleton width={32} height={32} borderRadius="16px" />
    </div>
  );
};

export default function Task({
  task,
  user,
  isCompleted,
  coin,
  onComplete,
}: {
  task: ITask;
  user: User;
  isCompleted: boolean;
  coin: number;
  onComplete?: () => void;
}) {
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const { setUser } = useUser();
  const { icon: currencyIcon } = useCurrency();

  const checkTaskStatus = async () => {
    try {
      // Відстежуємо клік по квесту
      trackQuest(task._id, task.name, 'click', {
        user_id: user._id,
        reward: coin,
      });

      const response = await tasksApi.completeTask(task._id);

      setTaskStatus(response);

      if (response.ok) {
        // Відстежуємо успішне завершення квесту
        trackQuestComplete(task._id, task.name, coin.toString(), {
          user_id: user._id,
          reward: coin,
        });

        setUser({
          ...user,
          jumps: user.jumps + coin,
        });
      }

      if (response.redirect) {
        if (response.redirect.includes('https://t.me/')) {
          TelegramWebApp.openTelegramLink(response.redirect);
        } else {
          TelegramWebApp.openLink(response.redirect);
        }
      }

      if (response.ok && onComplete) {
        onComplete();
      }
    } catch (error) {
      logger.error('Failed to check task status', { error: String(error) });
    }
  };

  if (taskStatus?.ok || isCompleted) {
    return (
      <div className={s.container}>
        <div className={s.leftSection}>
          <img src={plane} alt="planeIcon" draggable={false} />
          <div className={s.description}>
            <Text color="white" variant="small">
              {task.name}
            </Text>
            <div className={s.btnSection}>
              <img
                className={s.btnImg}
                src={currencyIcon}
                alt="currencyIcon"
                draggable={false}
              />
              <Text color="white" variant="small">
                {coin}
              </Text>
            </div>
          </div>
        </div>
        <img src={success} className={s.successIcon} alt="success_icon" />
      </div>
    );
  }

  return (
    <div>
      <div className={s.container} onClick={checkTaskStatus}>
        <div className={s.leftSection}>
          <img src={plane} alt="planeIcon" draggable={false} />
          <div className={s.description}>
            <Text color="white" variant="small">
              {task.name}
            </Text>
            <div className={s.btnSection}>
              <img
                className={s.btnImg}
                src={currencyIcon}
                alt="currencyIcon"
                draggable={false}
              />
              <Text color="white" variant="small">
                {coin}
              </Text>
            </div>
          </div>
        </div>
        <Button
          label={
            <Text variant="h3" color="white">
              {isCompleted ? 'Completed' : 'Complete'}
            </Text>
          }
          onClick={checkTaskStatus}
          disabled={taskStatus?.ok || false}
        />
      </div>
    </div>
  );
}
