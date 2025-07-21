import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!;

export class PaystackService {
  // Initialize payment
  static async initializePayment({
    email,
    amount,
    reference,
    metadata
  }: {
    email: string;
    amount: number; // Amount in kobo (smallest currency unit)
    reference: string;
    metadata: any;
  }) {
    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount,
          reference,
          metadata,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
          cancel_action: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`,
        }),
      });

      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message || 'Failed to initialize payment');
      }

      return {
        success: true,
        data: {
          authorization_url: data.data.authorization_url,
          access_code: data.data.access_code,
          reference: data.data.reference,
        }
      };
    } catch (error) {
      console.error('Paystack initialization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initialization failed'
      };
    }
  }

  // Verify payment
  static async verifyPayment(reference: string) {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message || 'Failed to verify payment');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Paystack verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed'
      };
    }
  }

  // Verify webhook signature
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(payload, 'utf8')
        .digest('hex');
      
      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  // Generate payment reference
  static generateReference(prefix: string = 'RAS'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  // Convert amount to kobo (Paystack uses kobo for NGN)
  static toKobo(amount: number): number {
    return Math.round(amount * 100);
  }

  // Convert amount from kobo to naira
  static fromKobo(amount: number): number {
    return amount / 100;
  }

  // Get payment status from webhook data
  static getPaymentStatus(data: any): 'success' | 'failed' | 'pending' {
    if (data.status === 'success' && data.gateway_response === 'Successful') {
      return 'success';
    } else if (data.status === 'failed') {
      return 'failed';
    } else {
      return 'pending';
    }
  }

  // Client-side payment initialization (for frontend)
  static getClientPaymentConfig({
    email,
    amount,
    reference,
    metadata,
    onSuccess,
    onClose
  }: {
    email: string;
    amount: number;
    reference: string;
    metadata: any;
    onSuccess: (reference: any) => void;
    onClose: () => void;
  }) {
    return {
      reference,
      email,
      amount,
      publicKey: PAYSTACK_PUBLIC_KEY,
      text: 'Pay Now',
      metadata,
      onSuccess,
      onClose,
    };
  }

  // List transactions (for admin)
  static async listTransactions({
    page = 1,
    perPage = 50,
    status,
    from,
    to
  }: {
    page?: number;
    perPage?: number;
    status?: string;
    from?: string;
    to?: string;
  } = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
      });

      if (status) params.append('status', status);
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const response = await fetch(`https://api.paystack.co/transaction?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch transactions');
      }

      return {
        success: true,
        data: data.data,
        meta: data.meta
      };
    } catch (error) {
      console.error('Paystack list transactions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transactions'
      };
    }
  }

  // Get transaction details
  static async getTransaction(id: string) {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch transaction');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Paystack get transaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transaction'
      };
    }
  }

  // Refund transaction (if needed)
  static async refundTransaction(reference: string, amount?: number) {
    try {
      const payload: any = { transaction: reference };
      if (amount) payload.amount = PaystackService.toKobo(amount);

      const response = await fetch('https://api.paystack.co/refund', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message || 'Failed to process refund');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Paystack refund error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed'
      };
    }
  }
}