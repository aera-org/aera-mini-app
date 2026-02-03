import classNames from 'classnames';
import { PAGES } from '../constants/page';
import ChatUI from './chat';
import Loading from '../pages/loading';
import { useAppMediaCache, backgroundImages } from '../hooks/useAppMediaCache';
import { usePage } from '../context/pageContext';
import { useState } from 'react';

export default function AppBackground() {
  const { page } = usePage();
  const [isChatInputFocused, setIsChatInputFocused] = useState(false);
  const isDesktop =
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;

  const {
    images: {
      isCached: isImageCached,
      isLoading: isImageLoading,
      error: imageError,
    },
  } = useAppMediaCache();

  const currentImage = backgroundImages[page as keyof typeof backgroundImages];

  return (
    <div className="bg">
      <div
        className={classNames('bg-content', {
          visible: page === PAGES.HOME_PAGE || page === PAGES.CHAT,
        })}
      >
        {page !== PAGES.CHAT && (
          <ChatUI
            onInputFocusChange={setIsChatInputFocused}
            isChatInputFocused={isChatInputFocused}
            isDesktop={isDesktop}
          />
        )}
      </div>

      <div
        className={classNames('bg-content', {
          visible: isImageCached && page !== PAGES.HOME_PAGE,
        })}
      >
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
      </div>
    </div>
  );
}
