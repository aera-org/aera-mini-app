import { useEffect, useState } from 'react';

import Modal from '../modal';
import { Text } from '../text';
import { Button } from '../button';

import wallet from '../../assets/wallet.png';
import greenCheck from '../../assets/walletModal/greenCheck.png';

import { shortenHash } from '../../constants/page';
import { useTonAddress, useTonConnectModal } from '@tonconnect/ui-react';

import { useTonConnect } from '../../hooks/useTonConnect';

import s from './index.module.css';
import { useCheckTonConnect } from '../../hooks/useCheckTonConnect';
import { logger } from '../../utils/logger';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

// Define all possible states of the wallet modal
enum ModalState {
  CONNECT, // Initial state, wallet not connected
  CONNECTED, // Wallet connected, showing address
  JUST_CONNECTED, // Wallet just connected, showing success message
  JUST_DISCONNECTED, // Wallet just disconnected, showing success message
  DISCONNECT_CONFIRM, // Confirming disconnect action
}

export default function WalletModal({
  isOpen,
  onClose,
  title,
}: WalletModalProps) {
  const { open } = useTonConnectModal();
  useCheckTonConnect(isOpen);
  const { isConnected, disconnect, error, justDisconnected, justConnected } =
    useTonConnect();
  const address = useTonAddress();

  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // Determine the current modal state
  const getModalState = (): ModalState => {
    if (justDisconnected) return ModalState.JUST_DISCONNECTED;
    if (showDisconnectConfirm) return ModalState.DISCONNECT_CONFIRM;
    if (justConnected && address) return ModalState.JUST_CONNECTED;
    if (address && isConnected) return ModalState.CONNECTED;
    return ModalState.CONNECT;
  };

  useEffect(() => {
    if (!isConnected) {
      setShowDisconnectConfirm(false);
    }
  }, [isConnected]);

  const handleOpenConnect = () => {
    open();
  };

  const handleDisconnectClick = () => {
    setShowDisconnectConfirm(true);
  };

  const handleCancelDisconnect = () => {
    setShowDisconnectConfirm(false);
  };

  const handleConfirmDisconnect = async () => {
    try {
      setShowDisconnectConfirm(false);
      await disconnect();
    } catch (err) {
      logger.error('Failed to disconnect wallet', { error: String(err) });
    }
  };

  // Render content based on the current modal state
  const renderModalContent = () => {
    const state = getModalState();

    switch (state) {
      case ModalState.DISCONNECT_CONFIRM:
        return (
          <div className={s.walletModalWrap}>
            <Text color="white" variant="h1">
              Disconnect Wallet?
            </Text>
            <div className={s.confirmText}>
              <Text color="white" weight={400}>
                You won't be able to purchase with crypto until you reconnect.
              </Text>
            </div>
            <Button
              onClick={handleCancelDisconnect}
              className={s.confirmBtn}
              label={
                <div className={s.btnSection}>
                  <Text color="white" variant="small">
                    Cancel
                  </Text>
                </div>
              }
            />
            <Button
              onClick={handleConfirmDisconnect}
              className={s.confirmBtn}
              label={
                <div className={s.btnSection}>
                  <Text color="white" variant="small">
                    Disconnect
                  </Text>
                </div>
              }
            />
          </div>
        );

      case ModalState.JUST_DISCONNECTED:
        return (
          <div className={s.walletModalWrap}>
            <img src={greenCheck} alt="greenCheck" />
            <Text color="white" variant="h2">
              Wallet
              <br /> Disconnected
            </Text>
          </div>
        );

      case ModalState.JUST_CONNECTED:
        return (
          <div className={s.walletModalWrap}>
            <img src={greenCheck} alt="greenCheck" />
            <Text color="white" variant="h2">
              Wallet
              <br /> Connected
            </Text>
          </div>
        );

      case ModalState.CONNECTED:
        return (
          <div className={s.walletModalWrap}>
            <Text color="white" variant="h1">
              {title}
            </Text>
            <div className={s.walletSection}>
              <div className={s.walletImg}>
                <img src={greenCheck} alt="success icon" />
              </div>
              <Text color="white" weight={400}>
                {shortenHash(address)}
              </Text>
            </div>
            <Button
              onClick={handleDisconnectClick}
              className={s.btnDisconnect}
              label={
                <div className={s.btnSection}>
                  <img className={s.btnImg} src={wallet} alt="walletIcon" />
                  <Text color="white" variant="small">
                    Disconnect
                  </Text>
                </div>
              }
            />
          </div>
        );

      case ModalState.CONNECT:
      default:
        return (
          <div className={s.walletModalWrap}>
            <Text color="white" variant="h1">
              {title}
            </Text>
            {error && (
              <div className={s.error}>
                <Text color="white" variant="small">
                  {error}
                </Text>
              </div>
            )}
            <Button
              onClick={handleOpenConnect}
              className={s.btn}
              label={
                <div className={s.btnSection}>
                  <img className={s.btnImg} src={wallet} alt="walletIcon" />
                  <Text color="white" variant="small">
                    Connect Wallet
                  </Text>
                </div>
              }
            />
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {renderModalContent()}
    </Modal>
  );
}
