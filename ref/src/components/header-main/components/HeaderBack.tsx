import { Button } from '../../button';
import { Text } from '../../text';
import { PAGES } from '../../../constants/page';
import { usePage } from '../../../context/pageContext';
import { useUser } from '../../../context/userContext';
import whiteArrow from '../../../assets/icons/whiteArrow.png';
import wallet from '../../../assets/wallet.png';
import question from '../../../assets/header/question.png';
import electra from '../../../assets/girls/electra.webp';
import s from '../index.module.css';
import { icons } from '@/assets/icons';

interface HeaderBackProps {
  page: string;
  category: {
    isVisible: boolean;
    name?: string | undefined;
    openedFromGuide?: boolean | undefined;
  };
  onWalletClick: () => void;
  showWallet: boolean;
}

export default function HeaderBack({
  page,
  category,
  onWalletClick,
  showWallet,
}: HeaderBackProps) {
  const { setPage, setCategory, previousPage, goBack } = usePage();
  const { user } = useUser();

  const handleBack = () => {
    if (category.isVisible) {
      setCategory({ isVisible: false, name: undefined });
      if (!category.openedFromGuide) {
        setPage(previousPage);
      }
    } else if (page === PAGES.HOME_PAGE) {
      return;
    } else if (page === PAGES.GIFTS && previousPage === PAGES.CHAT) {
      setPage(PAGES.CHAT);
    } else if ([PAGES.REFERRALS, PAGES.LEADER_BOARD].includes(page)) {
      goBack();
    } else {
      setPage(PAGES.HOME_PAGE);
    }
  };

  // Special header for chat page
  if (page === PAGES.CHAT) {
    return (
      <div className={`${s.container} ${s.chatHeader}`}>
        <Button
          onClick={handleBack}
          label={
            <img src={whiteArrow} alt="whiteLeftArrow" draggable={false} />
          }
        />

        <div className={s.profileSection}>
          <img src={electra} alt="Electra" className={s.profileImage} />
          <div className={s.profileInfo}>
            <Text color="white" variant="h1" className={s.profileName}>
              Electra 💓
            </Text>
            <Text color="white" variant="small" className={s.profileStatus}>
              Last seen recently
            </Text>
          </div>
        </div>

        <div className={s.giftIcon}>
          <img
            className={s.imageGuide}
            src={icons.giftsIcon}
            alt={'giftsIcon'}
            onClick={() => setPage(PAGES.GIFTS)}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${s.container} header`}>
      {page === PAGES.GIRLS ? (
        <Button
          style={{ opacity: 0, pointerEvents: 'none' }}
          onClick={handleBack}
          label={
            <img src={whiteArrow} alt="whiteLeftArrow" draggable={false} />
          }
        />
      ) : (
        <Button
          onClick={handleBack}
          label={
            <img src={whiteArrow} alt="whiteLeftArrow" draggable={false} />
          }
        />
      )}

      {page && (
        <Text color="white" variant="h1">
          {category?.isVisible
            ? category?.name
            : page === PAGES.CHAT
            ? user?.data?.girl
            : page}
        </Text>
      )}

      <div>
        {showWallet ? (
          <img
            onClick={onWalletClick}
            className={s.walletIcon}
            src={wallet}
            alt="wallet_icon"
            draggable={false}
          />
        ) : (
          <div />
        )}

        {![PAGES.GUIDE, PAGES.GIRLS, PAGES.GAME, PAGES.SUBSCRIPTION].includes(page) ? (
          <Button
            onClick={() => {
              setCategory({
                isVisible: true,
                name: page,
                openedFromGuide: false,
              });
              setPage(PAGES.GUIDE);
            }}
            label={
              <img
                className={s.question}
                src={question}
                alt="question_icon"
                draggable={false}
              />
            }
          />
        ) : (
          <div style={{ width: '44px' }} />
        )}
      </div>
    </div>
  );
}
