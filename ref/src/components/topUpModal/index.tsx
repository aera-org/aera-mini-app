import { FC, Dispatch, SetStateAction, useState, useEffect } from 'react';
import Modal from '../modal';
import { Text } from '../text';
import { Button } from '../button';
import { useCurrency } from '../../hooks/useCurrency';
import whiteStar from '../../assets/icons/whiteStar.png';
import { usePayment } from '../../hooks/usePayment';
import { PaymentCurrency } from '../../lib/paymentService';
import { useUser } from '../../context/userContext';
import ProcessingModal from '../processingModal';
import ConfirmationModal from '../confirmationModal';

import s from './index.module.css';
import classNames from 'classnames';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChange: Dispatch<SetStateAction<number>>;
  modalData?: {
    title: string;
    progress: number;
    color: 'pink' | 'yellow';
    src: string;
    isPercent: boolean;
  };
}

const TopUpModal: FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  modalData,
  onChange,
}) => {
  const MIN = 100;
  const MAX = 10000;
  const STEP = 100;
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { processPayment } = usePayment();
  const { user } = useUser();
  const { icon: currencyIcon, name: currencyName } = useCurrency();

  const [currentProgress, setCurrentProgress] = useState<number>(
    modalData ? Math.min(Math.max(modalData.progress, MIN), MAX) : MIN
  );

  useEffect(() => {
    if (modalData?.progress !== undefined) {
      const clamped = Math.min(Math.max(modalData.progress, MIN), MAX);
      setCurrentProgress(clamped);
    }
  }, [modalData?.progress]);

  const handleChange = (value: number) => {
    const clamped = Math.min(Math.max(value, MIN), MAX);
    setCurrentProgress(clamped);
    onChange(clamped);
  };

  const fillPercent = ((currentProgress - MIN) / (MAX - MIN)) * 100;
  const gradient = {
    pink: `linear-gradient(to right,
       #8C00FF 0%,
      #FF00BB ${fillPercent}%,
      transparent ${fillPercent}%,
      transparent 100%) content-box`,
    yellow: `linear-gradient(to right,
      #FFF700 0%,
     #CEA000 ${fillPercent}%,
     transparent ${fillPercent}%,
     transparent 100%) content-box`,
  };
  const colors = {
    pink: '#7b2ff7',
    yellow: '#FFF700',
  };

  const computedPrice = Math.floor(currentProgress / 4);

  const jumpPrice = currentProgress * 175;

  const handlePurchaseWithStars = async () => {
    if (!user) {
      return;
    }

    setIsPurchasing(true);
    await processPayment(user, 'fuel_topup_stars', {
      amount: currentProgress,
      price: computedPrice,
      name: modalData?.title || 'Fuel Top-up',
      currency: PaymentCurrency.XTR,
      girl: user.data.girl,
    });
    setIsPurchasing(false);
    onClose();
  };

  const handlePurchaseWithJumps = async () => {
    if (!user) {
      return;
    }

    if (user.jumps < jumpPrice) {
      setShowConfirmation(true);
      return;
    }

    setIsPurchasing(true);
    await processPayment(user, 'fuel_topup_jumps', {
      amount: currentProgress,
      price: jumpPrice,
      name: modalData?.title || 'Fuel Top-up',
      currency: PaymentCurrency.JUMPS,
      girl: user.data.girl,
    });
    setIsPurchasing(false);
    onClose();
  };

  const handleConfirmStarsPayment = () => {
    handlePurchaseWithStars();
  };

  const handleCancelStarsPayment = () => {
    onClose();
  };

  const trackStyle = {
    background: modalData?.color ? gradient[modalData.color] : undefined,
    outline: `2px solid ${colors[modalData?.color ?? 'pink']}`,
  };

  return (
    <>
      <Modal isOpen={isOpen && !showConfirmation} onClose={onClose}>
        <div
          className={classNames(s.modalContent, { [s.visible || '']: isOpen })}
        >
          <Text color="white" variant="h1">
            {modalData?.title}
          </Text>

          <div className={s.modalValue}>
            <img src={modalData?.src} alt="modalIcon" />
            <Text color="white" variant="h2">
              {currentProgress}
              {modalData?.isPercent ? '%' : ''}
            </Text>
          </div>

          <input
            type="range"
            min={MIN}
            max={MAX}
            value={currentProgress}
            step={STEP}
            onChange={(e) => handleChange(Number(e.target.value))}
            className={classNames(s.input, {
              [s[modalData?.color ?? 'pink'] || '']: Boolean(modalData?.color),
            })}
            style={trackStyle}
          />

          <Button
            className={s.btn}
            onClick={handlePurchaseWithStars}
            label={
              <div className={s.btnSection}>
                <img className={s.btnImg} src={whiteStar} alt="whiteStarIcon" />
                <Text color="white" variant="small">
                  {computedPrice}
                </Text>
              </div>
            }
          />

          <Button
            className={s.btnJump}
            onClick={handlePurchaseWithJumps}
            label={
              <div className={s.btnSection}>
                <img
                  className={s.btnImg}
                  src={currencyIcon}
                  alt="currencyIcon"
                  draggable={false}
                />
                <Text color="white" variant="small">
                  {jumpPrice}
                </Text>
              </div>
            }
          />
        </div>
      </Modal>

      <ProcessingModal isOpen={isPurchasing} message="Processing purchase..." />
      
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title={`Not Enough ${currencyName}`}
        message={`You don't have enough ${currencyName}. Pay with Stars?`}
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleConfirmStarsPayment}
        onCancel={handleCancelStarsPayment}
      />
    </>
  );
};

export default TopUpModal;
