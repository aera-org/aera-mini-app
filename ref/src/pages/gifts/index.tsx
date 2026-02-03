import { useState } from 'react';
import CardsList from '../../components/cardsList';
import { usePage } from '../../context/pageContext';
import { PAGES } from '../../constants/page';
import classNames from 'classnames';
import { giftData } from './gifts';
import PurchaseModal from '../../components/purchaseModal';
import { Gift } from './gifts';
import FuelSection from '../../components/header-main/components/FuelSection';

import s from './index.module.css';

// Type for CardItem that matches what CardsList expects
type CardItem = {
  label: React.ReactNode;
  userHave?: boolean;
  image?: string;
  bgImage?: string;
  price?: number;
  stars?: number;
  jumps?: number;
  id?: number;
};

interface GiftsPageProps {
  handleTopUpClick: () => void;
}

const GiftsPage = ({ handleTopUpClick }: GiftsPageProps) => {
  const { page } = usePage();
  const [gifts] = useState(giftData);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const handleCardClick = (gift: CardItem) => {
    if (!gift.userHave) {
      // The gifts data already contains all the needed fields for the modal
      setSelectedGift(gift as unknown as Gift);
      setIsPurchaseModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsPurchaseModalOpen(false);
    setSelectedGift(null);
  };

  const handleRedirectToGifts = () => {
    handleCloseModal();
  };

  return (
    <>
      <div
        className={classNames(s.container, {
          isHidden: page !== PAGES.GIFTS,
        })}
      >
        <div className={s.topSection}>
          <FuelSection onTopUpClick={handleTopUpClick} />
        </div>
        <div className={s.content}>
          <CardsList items={gifts} onCardClick={handleCardClick} />
        </div>
      </div>

      {selectedGift && (
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={handleCloseModal}
          image={selectedGift.image}
          label={selectedGift.label}
          stars={selectedGift.stars}
          jumps={selectedGift.jumps}
          id={selectedGift.id}
          onRedirectToGifts={handleRedirectToGifts}
        />
      )}
    </>
  );
};

export default GiftsPage;
