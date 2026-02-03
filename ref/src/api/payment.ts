import apiClient from './axios';

interface InvoiceResponse {
  invoice?: string;
  payload?: string;
  invoiceId?: string;
  message?: string;
  success?: boolean;
}

interface InvoiceStatusResponse {
  message: string;
}

export const paymentApi = {
  createInvoice: async (
    request: string,
    params?: Record<string, any>
  ): Promise<InvoiceResponse> => {
    const response = await apiClient.post('/payment/invoice', {
      request,
      params,
    });
    return response.data;
  },

  getInvoiceStatus: async (payload: string): Promise<InvoiceStatusResponse> => {
    const response = await apiClient.get(`/payment/invoice/${payload}`);
    return response.data;
  },
};
