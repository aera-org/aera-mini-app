import classNames from 'classnames';
import { Girl } from '../../components/girl';
import HeaderMain from '../../components/header-main/components/HeaderMain';
import WalletModal from '../../components/walletModal';

import Loading from '../../pages/loading';
import {
  useAppMediaCache,
  backgroundImages,
} from '../../hooks/useAppMediaCache';
import { usePage } from '../../context/pageContext';
import { useUser } from '../../context/userContext';
import { PAGES } from '../../constants/page';
import styles from './index.module.css';
import { useState } from 'react';

interface Props {
  openSpicyModal: () => void;
  handleTopUpClick: () => void;
}

export default function Game({
  handleTopUpClick,
  openSpicyModal,
}: Props) {
  const { page, setPage } = usePage();
  const { user } = useUser();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const handleSubscriptionRedirect = () => {
    setPage(PAGES.SUBSCRIPTION);
  };

  const {
    images: { isLoading: isImageLoading, error: imageError },
  } = useAppMediaCache();

  const currentImage = backgroundImages[page as keyof typeof backgroundImages];

  return (
    <div className={classNames(styles.container)}>
      <div>
        <HeaderMain
          handleSubscriptionRedirect={handleSubscriptionRedirect}
          onTopUpClick={handleTopUpClick}
          openSpicyModal={openSpicyModal}
        />
        {user?.data?.girl && <Girl />}
      </div>

      {isImageLoading && <Loading />}
      {imageError && <div className="error">{imageError}</div>}
      {currentImage && (
        <img
          src={currentImage}
          alt="background"
          className="bg-image"
          draggable={false}
        />
      )}

      <WalletModal
        title="Wallet"
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </div>
  );
}
