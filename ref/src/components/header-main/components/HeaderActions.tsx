import { Button } from '../../button';
import { PAGES } from '../../../constants/page';
import { usePage } from '../../../context/pageContext';
import EnergyBar from '../../EnergyBar';
import { icons } from '../../../assets/icons';
import referrals from '../../../assets/header/referrals.png';
import leader from '../../../assets/header/leader.png';
import pepper from '../../../assets/header/pepper.webp';
import subscription from '../../../assets/hearts/yellow.webp';
import s from '../index.module.css';
import { trackPepper } from '../../../utils/analytics';

interface HeaderActionsProps {
  onTopUpClick: () => void;
  openSpicyModal?: () => void;
}

export default function HeaderActions({
  onTopUpClick,
  openSpicyModal,
}: HeaderActionsProps) {
  const { setPage } = usePage();

  return (
    <div className={s.walletContainer}>
      <div>
        <EnergyBar />
      </div>

      <Button
        className={s.walletBtn}
        label={
          <img
            className={s.walletIcon}
            src={icons.exchange}
            alt="exchange_conversion_icon"
            draggable={false}
          />
        }
        onClick={onTopUpClick}
      />

      <div>
        <Button
          className={s.walletBtn}
          label={
            <img
              className={s.walletIcon}
              src={referrals}
              alt="referrals_icon"
              draggable={false}
            />
          }
          onClick={() => {
            setPage(PAGES.REFERRALS);
          }}
        />
      </div>

      <div>
        <Button
          className={s.walletBtn}
          label={
            <img
              className={s.walletIcon}
              src={leader}
              alt="leader_icon"
              draggable={false}
            />
          }
          onClick={() => {
            setPage(PAGES.LEADER_BOARD);
          }}
        />
      </div>

      <div>
        <Button
          className={s.walletBtn}
          label={
            <img
              className={s.walletIcon}
              src={pepper}
              alt="pepper_icon"
              draggable={false}
            />
          }
          onClick={() => {
            trackPepper('spicy_video', {
              action: 'open_modal',
            });

            if (openSpicyModal) {
              openSpicyModal();
            }
          }}
        />
      </div>
      <div>
        <Button
          className={s.walletBtn}
          label={
            <img
              className={s.walletIcon}
              src={subscription}
              alt="subscription_icon"
              draggable={false}
            />
          }
          onClick={() => {
            setPage(PAGES.SUBSCRIPTION);
          }}
        />
      </div>
    </div>
  );
}
