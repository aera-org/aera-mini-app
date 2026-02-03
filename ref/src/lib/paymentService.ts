import TelegramWebApp from '@twa-dev/sdk';
import { paymentApi } from '../api/payment';
import { User } from '../types/user';
import { logger } from '../utils/logger';
import { trackPurchase } from '../utils/analytics';

interface PaymentResult {
  success: boolean;
  message: string;
}

interface ProcessingHandlers {
  showLoading: (message: string) => void;
  hideLoading: () => void;
}

const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL = 1500; // 1.5 seconds

export enum PaymentCurrency {
  XTR = 'XTR',
  JUMPS = 'JUMPS',
}

export const paymentService = {
  /**
   * Process a payment with a specified request type
   * @param request The payment request type
   * @param processingHandlers Optional processing handlers for showing/hiding processing state
   * @param metadata Optional metadata about the item being purchased
   * @returns Payment result
   */
  processPayment: async (
    user: User,
    request: string,
    processingHandlers?: ProcessingHandlers,
    params?: Record<string, any>
  ): Promise<PaymentResult> => {
    const currency = params?.currency ?? PaymentCurrency.XTR;

    if (currency === PaymentCurrency.JUMPS) {
      // check if user has enough jumps
      if (user.jumps < params?.price) {
        return {
          success: false,
          message: 'Not enough jumps',
        };
      }
    }

    try {
      // Show processing if handlers provided
      if (processingHandlers) {
        processingHandlers.showLoading('Creating payment...');
      }

      // Create invoice
      const invoice = await paymentApi.createInvoice(request, params);

      if (invoice.invoice) {
        if (TelegramWebApp.isVersionAtLeast('8.0')) {
          if (processingHandlers) {
            processingHandlers.showLoading('Waiting for payment...');
          }

          return new Promise(async (resolve) => {
            TelegramWebApp.openInvoice(
              invoice?.invoice ?? '',
              async (status) => {
                if (status === 'paid') {
                  if (processingHandlers) {
                    processingHandlers.showLoading('Verifying payment...');
                  }
                  resolve(
                    await pollInvoiceStatus(
                      invoice?.payload ?? '',
                      request,
                      user,
                      params
                    )
                  );
                } else if (status === 'cancelled') {
                  if (processingHandlers) {
                    processingHandlers.hideLoading();
                  }
                  resolve({
                    success: false,
                    message: 'Payment cancelled',
                  });
                }
              }
            );
          });
        } else {
          if (processingHandlers) {
            processingHandlers.hideLoading();
          }
          return {
            success: false,
            message: 'Payment failed, please try again',
          };
        }
      } else {
        return {
          success: invoice?.success ?? false,
          message: invoice?.message ?? 'Payment successful',
        };
      }
    } catch (error) {
      // Hide processing if handlers provided
      if (processingHandlers) {
        processingHandlers.hideLoading();
      }

      logger.error('Payment processing failed', {
        error: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  },
};

/**
 * Poll the backend for invoice status
 * @param payload The invoice payload
 * @returns Payment result
 */
async function pollInvoiceStatus(
  payload: string,
  request: string,
  user: User,
  params?: Record<string, any>
): Promise<PaymentResult> {
  let attempts = 0;

  while (attempts < MAX_POLL_ATTEMPTS) {
    try {
      const statusResponse = await paymentApi.getInvoiceStatus(payload);

      if (statusResponse.message === 'Payment successful') {
        if (params?.item_id && params?.item_name && params?.price) {
          trackPurchase(
            params.item_id,
            params.item_name,
            params.price,
            params.currency || PaymentCurrency.XTR,
            {
              request_type: request,
              user_id: user._id,
            }
          );
        }

        return {
          success: true,
          message: 'Payment completed successfully',
        };
      } else if (statusResponse.message === 'Payment pending') {
        // Wait and try again
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        attempts++;
      } else {
        // Payment failed, expired, or other error
        return {
          success: false,
          message: statusResponse.message,
        };
      }
    } catch (error) {
      logger.error('Failed to check invoice status', { error: String(error) });
      return {
        success: false,
        message: 'Failed to verify payment status',
      };
    }
  }

  // If we've exhausted our polling attempts, return indeterminate status
  return {
    success: false,
    message: 'Could not confirm payment status, please check your balance',
  };
}
