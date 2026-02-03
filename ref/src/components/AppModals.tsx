import TopUpModal from './topUpModal';
import NotEnoughBoostsModal from './notEnoughBoostsModal';
import ProcessingModal from './processingModal';
import SpicyVideoModal from './spicyVideoModal';
import { useProcessing } from '../context/processingContext';
import { useSpicyVideo } from '../hooks/useSpicyVideo';
import { Dispatch, SetStateAction } from 'react';

interface ModalData {
  title: string;
  progress: number;
  value: number;
  price: number;
  color: 'pink' | 'yellow';
  src: string;
  isPercent: boolean;
}

interface AppModalsProps {
  isOpen: boolean;
  modalData: ModalData | undefined;
  onClose: () => void;
  onChange: Dispatch<SetStateAction<number>>;
}

export default function AppModals({
  isOpen,
  modalData,
  onClose,
  onChange,
}: AppModalsProps) {
  const { isProcessing, message, status, allowManualClose, hideProcessing } =
    useProcessing();
  const { isSpicyModalOpen, setIsSpicyModalOpen, handleBuySpicyVideo } =
    useSpicyVideo();

  return (
    <>
      <TopUpModal
        isOpen={isOpen}
        modalData={
          modalData || {
            title: '',
            progress: 0,
            value: 0,
            price: 0,
            color: 'pink' as const,
            src: '',
            isPercent: false,
          }
        }
        onClose={onClose}
        onChange={onChange}
      />
      <NotEnoughBoostsModal />
      <ProcessingModal
        isOpen={isProcessing}
        message={message}
        status={status}
        allowManualClose={allowManualClose}
        onClose={hideProcessing}
      />
      <SpicyVideoModal
        isOpen={isSpicyModalOpen}
        onClose={() => setIsSpicyModalOpen(false)}
        onBuy={handleBuySpicyVideo}
        price={250}
      />
    </>
  );
}
