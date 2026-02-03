import Modal from '../modal';
import { Text } from '../text';
import styles from './index.module.css';
import { ProcessingStatus } from '../../context/processingContext';

interface ProcessingModalProps {
  isOpen: boolean;
  message?: string;
  status?: ProcessingStatus;
  allowManualClose?: boolean;
  onClose?: () => void;
}

const ProcessingModal = ({
  isOpen,
  message = 'Please wait...',
  status = 'loading',
  allowManualClose = false,
  onClose,
}: ProcessingModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      {...(allowManualClose && onClose ? { onClose } : {})}
    >
      <div className={styles.container}>
        {status === 'loading' && <div className={styles.spinner}></div>}

        {status === 'success' && <div className={styles.successIcon}>✓</div>}

        {status === 'error' && <div className={styles.errorIcon}>✗</div>}

        <Text color="white" variant="h4">
          {message}
        </Text>
      </div>
    </Modal>
  );
};

export default ProcessingModal;
