import { useEffect, useState } from 'react';
import { Text } from '../../components/text';
import { useCurrency } from '../../hooks/useCurrency';
import { leaderboardApi } from '../../api/leaderboard';
import { Skeleton } from '../../components/skeleton';
import { ListItem } from '../../components/listItem';
import s from './index.module.css';
import { logger } from '../../utils/logger';

interface Leader {
  name: string;
  amount: number;
}

interface CachedData {
  leaders: Leader[];
  position: number;
  totalJumps: number;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let cachedLeaderboardData: CachedData | null = null;

const LeaderSkeleton = () => (
  <div className={s.leaderItem}>
    <div className={s.leaderInfo}>
      <Skeleton width={150} height={20} />
    </div>
    <div className={s.score}>
      <Skeleton width={20} height={20} borderRadius="50%" />
      <Skeleton width={80} height={20} />
    </div>
  </div>
);

export default function LeaderBoard() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [position, setPosition] = useState(0);
  const [totalJumps, setTotalJumps] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { headerIcon } = useCurrency();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const currentTime = Date.now();

        if (
          cachedLeaderboardData &&
          currentTime - cachedLeaderboardData.timestamp < CACHE_DURATION
        ) {
          setLeaders(cachedLeaderboardData.leaders);
          setPosition(cachedLeaderboardData.position);
          setTotalJumps(cachedLeaderboardData.totalJumps);
          setIsLoading(false);
          return;
        }

        const data = await leaderboardApi.getList();

        cachedLeaderboardData = {
          leaders: data.leaders,
          position: data.position,
          totalJumps: data.totalJumps,
          timestamp: currentTime,
        };

        setLeaders(data.leaders);
        setPosition(data.position);
        setTotalJumps(data.totalJumps);
      } catch (error) {
        logger.error('Failed to fetch leaderboard', { error: String(error) });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className={s.container}>
        <div className={s.content}>
          <div className={s.totalMined}>
            <Text variant="span" color="white">
              total mined
            </Text>
            <div className={s.totalAmount}>
              <Skeleton width={20} height={20} borderRadius="50%" />
              <Skeleton width={120} height={30} />
            </div>
          </div>
          <Skeleton width={150} height={20} className={s.yourPosition || ''} />
          <div className={s.leadersList}>
            {Array(5)
              .fill(null)
              .map((_, index) => (
                <LeaderSkeleton key={index} />
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.container}>
      <div className={s.content}>
        <div className={s.totalMined}>
          <Text variant="span" color="white">
            total mined
          </Text>
          <div className={s.totalAmount}>
            <img src={headerIcon} alt="currency" draggable={false} />
            <Text variant="h1" color="white">
              {Math.floor(totalJumps).toLocaleString()}
            </Text>
          </div>
        </div>
        <Text variant="span" color="white" className={s.yourPosition}>
          Your position: {position}
        </Text>
        <div className={s.leadersList}>
          {leaders.map((leader, index) => (
            <ListItem
              key={index}
              primaryInfo={`${index + 1}. ${leader.name}`}
              value={leader.amount}
              valueIcon={headerIcon}
              valueIconAlt="currency"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
