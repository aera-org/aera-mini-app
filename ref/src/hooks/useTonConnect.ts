import { useState, useCallback, useEffect } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { walletApi } from '../api/wallet';
import { useUser } from '../context/userContext';
import { TonProof } from '../types/ton';
import { logger } from '../utils/logger';

export function useTonConnect() {
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [justDisconnected, setJustDisconnected] = useState(false);
  const [justConnected, setJustConnected] = useState(false);

  const [tonConnect] = useTonConnectUI();
  const { user } = useUser();
  const wallet = useTonWallet();

  const disconnect = useCallback(async () => {
    if (localStorage.getItem('connectedWallet')) {
      setJustDisconnected(true);
      setTimeout(() => {
        setJustDisconnected(false);
      }, 2000);
    }

    localStorage.removeItem('connectedWallet');
    setIsConnected(false);

    try {
      if (tonConnect.connected) {
        await tonConnect.disconnect();
      }
    } catch (err) {
      logger.error('Failed to disconnect wallet', { error: String(err) });
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }, [tonConnect]);

  useEffect(() => {
    const isConnected = localStorage.getItem('connectedWallet');
    const handleConnect = async () => {
      if (tonConnect.connected && wallet && !isConnected) {
        setIsLoading(true);
        setError(null);

        if (
          wallet?.connectItems?.tonProof &&
          !('error' in wallet.connectItems.tonProof)
        ) {
          const proof = wallet.connectItems.tonProof.proof;
          try {
            await walletApi.connectWallet(
              proof as unknown as TonProof,
              wallet.account,
              user?._id || ''
            );
            setJustConnected(true);
            setTimeout(() => {
              setJustConnected(false);
            }, 2000);

            setIsConnected(true);
            localStorage.setItem('connectedWallet', 'true');
          } catch (err: any) {
            if (
              err?.name === 'AbortError' ||
              err?.code === 'TON_CONNECT_SDK_ERROR' ||
              err?.message?.includes('Operation aborted')
            ) {
              return;
            }
            logger.error('Wallet connection failed', { error: String(err) });
            disconnect();
            setError(err instanceof Error ? err.message : 'Connection failed');
          } finally {
            setIsLoading(false);
          }
        } else {
          disconnect();
          setError('No proof provided');
        }
      } else if (tonConnect.connected && wallet && isConnected) {
        setIsConnected(true);
      } else if (!tonConnect.connected) {
        disconnect();
      }
    };

    // When connection is restored
    tonConnect.connectionRestored
      .then(() => {
        handleConnect().catch((error) => {
          logger.error('Connection restoration failed', {
            error: String(error),
          });
          setError('Connection restoration failed');
        });
      })
      .catch((error) => {
        logger.error('Connection restoration promise rejected', {
          error: String(error),
        });
        setError('Connection restoration failed');
      });
  }, [disconnect, wallet, tonConnect, user, wallet?.connectItems]);

  return {
    isConnected,
    disconnect,
    isLoading,
    error,
    justDisconnected,
    justConnected,
  };
}
