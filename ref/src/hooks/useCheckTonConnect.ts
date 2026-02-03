import { useState, useEffect } from 'react';

import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { walletApi } from '../api/wallet';

export function useCheckTonConnect(isModalOpen = false) {
  const [nonce, setNonce] = useState<string | null>(null);
  const [nonceExpireTime, setNonceExpireTime] = useState<number | null>(null);
  const TonWallet = useTonWallet();
  const [tonConnect] = useTonConnectUI();

  useEffect(() => {
    const tonProofPayload: string | null = nonce;

    if (tonProofPayload) {
      // add tonProof to the connect request
      tonConnect.setConnectRequestParameters({
        state: 'ready',
        value: { tonProof: tonProofPayload },
      });
    }
  }, [nonce, tonConnect]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkTonConnect = async () => {
      if (!tonConnect.connected && isModalOpen) {
        const currentTime = Date.now();
        const isNonceExpired =
          !nonceExpireTime || currentTime > nonceExpireTime;

        if (isNonceExpired) {
          try {
            // enable ui loader
            tonConnect.setConnectRequestParameters({ state: 'loading' });

            const res = await walletApi.generateNonce();

            // Set nonce expiration time to 60 seconds from now
            setNonceExpireTime(Date.now() + 60 * 1000);
            setNonce(res);
          } catch (err: any) {
            if (
              err?.name === 'AbortError' ||
              err?.code === 'TON_CONNECT_SDK_ERROR' ||
              err?.message?.includes('Operation aborted')
            ) {
              return;
            }
            throw err;
          }
        }
      }
    };

    tonConnect.connectionRestored.then(() => {
      if (isModalOpen) {
        checkTonConnect();
      }

      interval = setInterval(() => {
        if (isModalOpen) {
          checkTonConnect();
        }
      }, 60000 * 4.5);
    });

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [TonWallet, tonConnect, isModalOpen, nonceExpireTime]);

  return {};
}
