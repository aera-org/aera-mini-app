// Referrals Component з тестовими даними

import { useEffect, useState } from 'react';
import s from './index.module.css';
import { Text } from '../../components/text';
import { Button } from '../../components/button';
import friendsIcon from '../../assets/referrals/friends.png';

import { useCurrency } from '../../hooks/useCurrency';
import { getReferrals } from '../../api/user';
import { Skeleton } from '../../components/skeleton';
import { ListItem } from '../../components/listItem';
import { useUser } from '../../context/userContext';

import TelegramWebApp from '@twa-dev/sdk';
import { logger } from '../../utils/logger';

interface ReferralFriend {
  name: string;
  jumps: string;
}

interface CachedData {
  referrals: ReferralFriend[];
  referralCount: number;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let cachedReferralsData: CachedData | null = null;

type ReferralType = 'regular' | 'premium';

interface ReferralLink {
  type: ReferralType;
  link: string;
  reward: string;
}

const ReferralSkeleton = () => (
  <div className={s.friendItem}>
    <div className={s.friendInfo}>
      <Skeleton width={40} height={40} borderRadius="50%" />
      <div className={s.scoreInfo}>
        <Skeleton width={100} height={20} />
        <div className={s.score}>
          <Skeleton width={20} height={20} borderRadius="50%" />
          <Skeleton width={80} height={20} />
        </div>
      </div>
    </div>
  </div>
);

export default function Referrals() {
  const [referrals, setReferrals] = useState<ReferralFriend[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLinks, setCopiedLinks] = useState<Record<ReferralType, boolean>>(
    {
      regular: false,
      premium: false,
    }
  );

  const { user } = useUser();
  const { headerIcon, namePrefixed } = useCurrency();

  const inviteUrl =
    import.meta.env.VITE_TELEGRAM_APP_LINK + '?startapp=ref_' + user?.id;

  const referralLinks: ReferralLink[] = [
    {
      type: 'regular',
      link: inviteUrl,
      reward: '2,500',
    },
    {
      type: 'premium',
      link: inviteUrl,
      reward: '5,000',
    },
  ];

  const inviteText = `Join me in the game, where every touch leads to airdrop.`;

  const shareUrl = `https://t.me/share/url?url=${inviteUrl}&text=${inviteText}`;

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const currentTime = Date.now();

        if (
          cachedReferralsData &&
          currentTime - cachedReferralsData.timestamp < CACHE_DURATION
        ) {
          setReferrals(cachedReferralsData.referrals);
          setReferralCount(cachedReferralsData.referralCount);
          setError(null);
          setIsLoading(false);
          return;
        }

        const data = await getReferrals();

        const formattedReferrals = data.referrals.map((ref) => ({
          name: ref.name,
          jumps: new Intl.NumberFormat('uk-UA').format(ref.jumps || 1500000),
        }));

        cachedReferralsData = {
          referrals: formattedReferrals,
          referralCount: data.referralCount,
          timestamp: currentTime,
        };

        setReferrals(formattedReferrals);
        setReferralCount(data.referralCount);
        setError(null);
      } catch (err) {
        setError('Failed to load referrals');
        logger.error('Failed to load referrals', { error: String(err) });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  const handleCopyLink = async (type: ReferralType) => {
    try {
      const referralLink = referralLinks.find((link) => link.type === type);
      if (!referralLink) return;

      logger.info('Copying referral link', { type, link: referralLink.link });

      await navigator.clipboard.writeText(referralLink.link);

      setCopiedLinks((prev) => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopiedLinks((prev) => ({ ...prev, [type]: false }));
      }, 4000);
    } catch (err) {
      logger.error('Failed to copy referral link', { error: String(err) });
    }
  };

  const handleInvite = () => {
    logger.info('Inviting friend via Telegram', { shareUrl });
    TelegramWebApp.openTelegramLink(shareUrl);
  };

  if (isLoading) {
    return (
      <div className={s.container}>
        <div className={s.content}>
          <div className={s.inviteWrap}>
            <Text variant="span" color="white">
              Invite more friends
            </Text>
            <div className={s.inviteSection}>
              <div className={s.inviteCard}>
                <div className={s.inviteInfo}>
                  <img src={friendsIcon} alt="friends" draggable={false} />
                  <div>
                    <Text variant="span" color="white">
                      Invite friend
                    </Text>
                    <Text variant="h3" color="white">
                      {referralLinks[0]?.reward} {namePrefixed} for you and your friend
                    </Text>
                  </div>
                </div>
                <div className={s.inviteBtnWrapper}>
                  <Button
                    className={s.inviteButton || ''}
                    onClick={() => handleInvite()}
                    label={
                      <Text variant="h3" color="white">
                        Invite
                      </Text>
                    }
                  />

                  <Button
                    className={s.btn || ''}
                    onClick={() => handleCopyLink('regular')}
                    label={
                      <Text variant="small" color="white">
                        {copiedLinks.regular ? 'Copied' : 'Copy link'}
                      </Text>
                    }
                  />
                </div>
              </div>

              <div className={s.inviteCard}>
                <div className={s.inviteInfo}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="51"
                    height="41"
                    viewBox="0 0 51 41"
                    fill="none"
                  >
                    <path
                      d="M3.12672 17.8556C3.12672 17.8556 25.6828 8.85533 33.5056 5.68612C36.5045 4.41853 46.6742 0.361923 46.6742 0.361923C46.6742 0.361923 51.368 -1.41269 50.9768 2.89726C50.8464 4.67205 49.8034 10.8835 48.7604 17.6021C47.1957 27.1096 45.5008 37.5042 45.5008 37.5042C45.5008 37.5042 45.24 40.4199 43.0236 40.927C40.8071 41.434 37.1563 39.1524 36.5045 38.6452C35.9828 38.265 26.7258 32.5604 23.3359 29.7716C22.4232 29.011 21.3802 27.4899 23.4662 25.7151C28.16 21.5318 33.7664 16.3345 37.1563 13.0386C38.7209 11.5173 40.2854 7.96794 33.7664 12.2779C24.5093 18.4895 15.3826 24.3207 15.3826 24.3207C15.3826 24.3207 13.2964 25.5883 9.38505 24.4474C5.47346 23.3066 0.910092 21.7854 0.910092 21.7854C0.910092 21.7854 -2.21889 19.8839 3.12672 17.8556Z"
                      fill="white"
                    />
                  </svg>
                  <div>
                    <Text variant="span" color="white">
                      Invite with Telegram premium
                    </Text>
                    <Text variant="h3" color="white">
                      {referralLinks[1]?.reward} {namePrefixed} for you and your friend
                    </Text>
                  </div>
                </div>
                <div className={s.inviteBtnWrapper}>
                  <Button
                    className={s.inviteButton || ''}
                    onClick={() => handleInvite()}
                    label={
                      <Text variant="h3" color="white">
                        Invite
                      </Text>
                    }
                  />
                  <Button
                    className={s.btn || ''}
                    onClick={() => handleCopyLink('premium')}
                    label={
                      <Text variant="small" color="white">
                        {copiedLinks.premium ? 'Copied' : 'Copy link'}
                      </Text>
                    }
                  />
                </div>
              </div>
            </div>
            <Skeleton width={150} height={20} />
          </div>
          <div className={s.friendsList}>
            {Array(4)
              .fill(null)
              .map((_, index) => (
                <ReferralSkeleton key={index} />
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={s.container}>
        <Text variant="h2" color="white">
          {error}
        </Text>
      </div>
    );
  }

  return (
    <div className={s.container}>
      <div className={s.content}>
        <div className={s.inviteWrap}>
          <Text variant="span" color="white">
            Invite more friends
          </Text>

          <div className={s.inviteSection}>
            <div className={s.inviteCard}>
              <div className={s.inviteInfo}>
                <img src={friendsIcon} alt="friends" draggable={false} />
                <div>
                  <Text variant="span" color="white">
                    Invite friend
                  </Text>
                  <Text variant="h3" color="white">
                    {referralLinks[0]?.reward} {namePrefixed} for you and your friend
                  </Text>
                </div>
              </div>
              <div className={s.inviteBtnWrapper}>
                <Button
                  className={s.inviteButton || ''}
                  onClick={() => handleInvite()}
                  label={
                    <Text variant="h3" color="white">
                      Invite
                    </Text>
                  }
                />

                <Button
                  className={s.btn || ''}
                  onClick={() => handleCopyLink('regular')}
                  label={
                    <Text variant="small" color="white">
                      {copiedLinks.regular ? 'Copied' : 'Copy link'}
                    </Text>
                  }
                />
              </div>
            </div>

            <div className={s.inviteCard}>
              <div className={s.inviteInfo}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="51"
                  height="41"
                  viewBox="0 0 51 41"
                  fill="none"
                >
                  <path
                    d="M3.12672 17.8556C3.12672 17.8556 25.6828 8.85533 33.5056 5.68612C36.5045 4.41853 46.6742 0.361923 46.6742 0.361923C46.6742 0.361923 51.368 -1.41269 50.9768 2.89726C50.8464 4.67205 49.8034 10.8835 48.7604 17.6021C47.1957 27.1096 45.5008 37.5042 45.5008 37.5042C45.5008 37.5042 45.24 40.4199 43.0236 40.927C40.8071 41.434 37.1563 39.1524 36.5045 38.6452C35.9828 38.265 26.7258 32.5604 23.3359 29.7716C22.4232 29.011 21.3802 27.4899 23.4662 25.7151C28.16 21.5318 33.7664 16.3345 37.1563 13.0386C38.7209 11.5173 40.2854 7.96794 33.7664 12.2779C24.5093 18.4895 15.3826 24.3207 15.3826 24.3207C15.3826 24.3207 13.2964 25.5883 9.38505 24.4474C5.47346 23.3066 0.910092 21.7854 0.910092 21.7854C0.910092 21.7854 -2.21889 19.8839 3.12672 17.8556Z"
                    fill="white"
                  />
                </svg>
                <div>
                  <Text variant="span" color="white">
                    Invite with Telegram premium
                  </Text>
                  <Text variant="h3" color="white">
                    {referralLinks[1]?.reward} {namePrefixed} for you and your friend
                  </Text>
                </div>
              </div>
              <div className={s.inviteBtnWrapper}>
                <Button
                  className={s.inviteButton || ''}
                  onClick={() => handleInvite()}
                  label={
                    <Text variant="h3" color="white">
                      Invite
                    </Text>
                  }
                />
                <Button
                  className={s.btn || ''}
                  onClick={() => handleCopyLink('premium')}
                  label={
                    <Text variant="small" color="white">
                      {copiedLinks.premium ? 'Copied' : 'Copy link'}
                    </Text>
                  }
                />
              </div>
            </div>
          </div>

          <Text variant="span" color="white">
            Your friends: {referralCount} persons
          </Text>
        </div>

        <div className={s.friendsList}>
          {referrals.map((friend, index) => (
            <ListItem
              key={index}
              secondaryInfo={`${index + 1}.`}
              primaryInfo={friend.name}
              value={friend.jumps}
              valueIcon={headerIcon}
              valueIconAlt="currency"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
