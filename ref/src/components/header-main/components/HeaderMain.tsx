import { Button } from '../../button';
import { Text } from '../../text';
import { PAGES } from '../../../constants/page';
import { usePage } from '../../../context/pageContext';
import { useUser } from '../../../context/userContext';
import { useCurrency } from '../../../hooks/useCurrency';
import question from '../../../assets/header/question.png';
import FuelSection from './FuelSection';
import StatusIndicator from './StatusIndicator';
import HeaderActions from './HeaderActions';
import s from '../index.module.css';

interface HeaderMainProps {
  handleSubscriptionRedirect: () => void;
  onTopUpClick: () => void;
  openSpicyModal: () => void;
}

export default function HeaderMain({
  handleSubscriptionRedirect,
  onTopUpClick,
  openSpicyModal,
}: HeaderMainProps) {
  const { page, setPage } = usePage();
  const { user } = useUser();
  const { headerIcon } = useCurrency();

  return (
    <div className={s.main}>
      <FuelSection onTopUpClick={handleSubscriptionRedirect} />

      <div className={s.bottomContainer}>
        <div style={{ position: 'relative' }}>
          <div className={s.section}>
            <img src={headerIcon} alt="currency_icon" draggable={false} />
            <Text color="white" variant="h2">
              {Math.floor(user?.jumps || 0).toLocaleString()}
            </Text>
          </div>

          <StatusIndicator className={s.section} />

          <Button
            className={s.questionBtn}
            label={
              <img
                src={question}
                className={s.question}
                alt="question_icon"
                draggable={false}
              />
            }
            type="text"
            onClick={() => {
              if (PAGES.GIRLS !== page) setPage(PAGES.GUIDE);
            }}
          />
        </div>

        <HeaderActions
          onTopUpClick={onTopUpClick}
          openSpicyModal={openSpicyModal}
        />
      </div>
    </div>
  );
}
