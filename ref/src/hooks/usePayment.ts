import { useCallback } from 'react';
import { useUser } from '../context/userContext';
import { useProcessing } from '../context/processingContext';
import { paymentService } from '../lib/paymentService';
import { User } from '../types/user';
import { logger } from '../utils/logger';
/**
 * Hook that provides payment functionality with processing state management
 */
export const usePayment = () => {
  const { updateUserImmediate } = useUser();
  const { showProcessing, hideProcessing } = useProcessing();

  /**
   * Process a payment with automatic processing state management
   * @param request The payment request type
   * @param metadata Optional metadata about the item being purchased
   * @returns Promise that resolves when payment is complete
   */
  const processPayment = useCallback(
    async (user: User, request: string, metadata?: Record<string, any>) => {
      try {
        const result = await paymentService.processPayment(
          user,
          request,
          {
            showLoading: showProcessing,
            hideLoading: hideProcessing,
          },
          metadata
        );

        if (result.success) {
          showProcessing('Payment successful!', {
            type: 'success',
            allowManualClose: true,
          });
          // Refresh user data immediately after successful payment
          if (updateUserImmediate) await updateUserImmediate();

          // Still keep timeout as fallback
          setTimeout(() => {
            hideProcessing();
          }, 5000);

          return { success: true, message: result.message };
        } else {
          showProcessing(`Payment failed: ${result.message}`, {
            type: 'error',
            allowManualClose: true,
          });

          // Still keep timeout as fallback
          setTimeout(() => {
            hideProcessing();
          }, 5000);

          return { success: false, message: result.message };
        }
      } catch (error) {
        logger.error('Payment processing error', {
          error: String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        showProcessing('Payment processing error', {
          type: 'error',
          allowManualClose: true,
        });

        // Still keep timeout as fallback
        setTimeout(() => {
          hideProcessing();
        }, 5000);

        return {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : 'Payment processing failed',
        };
      }
    },
    [showProcessing, hideProcessing, updateUserImmediate]
  );

  return { processPayment };
};
