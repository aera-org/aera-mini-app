import { useState } from 'react';
import { PAGES } from '../../constants/page';

import { usePage } from '../../context/pageContext';
import WalletModal from '../walletModal';

import HeaderBack from '../header-main/components/HeaderBack';

export default function Header() {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const { page, category } = usePage();

  const handleWalletClick = () => {
    setWalletModalOpen(true);
  };

  const showWallet = page === PAGES.GIFTS || page === PAGES.GIRLS;

  return (
    <>
      {page !== PAGES.HOME_PAGE && (
        <HeaderBack
          page={page}
          category={category}
          onWalletClick={handleWalletClick}
          showWallet={showWallet}
        />
      )}
      <WalletModal
        title="Wallet"
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </>
  );
}
