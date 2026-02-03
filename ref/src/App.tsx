import { TonConnectUIProvider } from '@tonconnect/ui-react';
import classNames from 'classnames';
import { useState, useEffect } from 'react';

import fuel from './assets/header/fuel.png';
import Header from './components/header';
import Footer from './components/footer';
import AppBackground from './components/AppBackground';
import AppModals from './components/AppModals';
import PageRenderer from './components/PageRenderer';
import ErrorBoundary from './components/errorBoundary';
import SpicyVideoModal from './components/spicyVideoModal';

import MobilePage from './pages/mobile';
import ErrorPage from './pages/error-page';
import MaintenancePage from './pages/maintenance-page';

import { useTelegramInit } from './hooks/useTelegramInit';
import { useGirlCheck } from './hooks/useGirlCheck';
import { useBoostTimer } from './hooks/useBoostTimer';
import { useSpicyVideo } from './hooks/useSpicyVideo';

import { UserProvider } from './context/userContext';
import { PageProvider, usePage } from './context/pageContext';
import { ParticlesProvider } from './context/particlesContext';
import { EnergyProvider } from './context/energyContext';
import { ProcessingProvider } from './context/processingContext';
import { BoostProvider } from './context/boostContext';
import { ChatProvider } from './context/chatContext';
import { CharacterProvider } from './context/characterContext';

import { PAGES } from './constants/page';

import TelegramWebApp from '@twa-dev/sdk';

import './App.css';

function AppContent() {
  console.log('AppContent render');

  const { page } = usePage();
  const [isOpen, setIsOpen] = useState(false);
  const [rangeValue, setRangeValue] = useState(40);
  const [modalData, setModalData] = useState<
    | {
        title: string;
        progress: number;
        value: number;
        price: number;
        color: 'pink' | 'yellow';
        src: string;
        isPercent: boolean;
      }
    | undefined
  >(undefined);

  const { isSpicyModalOpen, setIsSpicyModalOpen, handleBuySpicyVideo } =
    useSpicyVideo();

  const handleTopUpClick = () => {
    setModalData({
      title: 'Top Up',
      progress: rangeValue,
      value: 50,
      price: 20,
      color: 'pink',
      src: fuel,
      isPercent: false,
    });
    setIsOpen(true);
  };

  useEffect(() => {
    if (modalData)
      setModalData((prev) => {
        if (!prev) return prev;
        return { ...prev, progress: rangeValue };
      });
    // eslint-disable-next-line
  }, [rangeValue]);

  const isTelegramWebApp = TelegramWebApp.platform !== 'unknown';
  const isErrorPage = window.location.pathname === '/error';
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  useTelegramInit();
  useGirlCheck();
  useBoostTimer();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Extract and cache bot ID on initial load
  useEffect(() => {
    const botParam = new URLSearchParams(window.location.search).get('bot') || 'aera';
    sessionStorage.setItem('activeBotId', botParam);
  }, []);

  if (isErrorPage) {
    return <ErrorPage onRetry={() => window.location.reload()} />;
  }

  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  if (!isTelegramWebApp && import.meta.env.VITE_ENV !== 'development') {
    return <MobilePage />;
  }

  return (
    <>
      <div
        className={classNames(
          'app',
          {
            homePage: page === PAGES.HOME_PAGE,
          },
          page
        )}
      >
        <AppBackground />
        <div className="headerBg" />
        <Header />
        <PageRenderer
          openSpicyModal={() => setIsSpicyModalOpen(true)}
          handleTopUpClick={handleTopUpClick}
        />
        {page === PAGES.HOME_PAGE && (
          <div className="bottom-nav">
            <Footer />
          </div>
        )}
        <AppModals
          isOpen={isOpen}
          modalData={modalData}
          onClose={() => setIsOpen(false)}
          onChange={setRangeValue}
        />
        <SpicyVideoModal
          isOpen={isSpicyModalOpen}
          onClose={() => setIsSpicyModalOpen(false)}
          onBuy={handleBuySpicyVideo}
          price={250}
        />
      </div>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ParticlesProvider>
        <TonConnectUIProvider
          manifestUrl={`${import.meta.env.VITE_URL}/tonconnect-manifest.json`}
        >
          <PageProvider>
            <UserProvider>
              <EnergyProvider>
                <ProcessingProvider>
                  <BoostProvider>
                    <ChatProvider>
                      <CharacterProvider>
                        <AppContent />
                      </CharacterProvider>
                    </ChatProvider>
                  </BoostProvider>
                </ProcessingProvider>
              </EnergyProvider>
            </UserProvider>
          </PageProvider>
        </TonConnectUIProvider>
      </ParticlesProvider>
    </ErrorBoundary>
  );
}

export default App;
