import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RazorpayService {
  private razorpay: any;

  constructor(private configService: ConfigService) {
    // Razorpay package is CommonJS; default import can break depending on TS transpilation.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID') || '';
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || '';

    // If keys are not configured, don't initialize Razorpay in dev.
    // Deposit/withdraw endpoints that require Razorpay will fail with a clear error instead of crashing the app.
    if (!keyId || !keySecret) {
      this.razorpay = null;
      return;
    }

    const Razorpay = require('razorpay');
    this.razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  async createOrder(amount: number, paymentId: string): Promise<any> {
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    }
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: paymentId,
      notes: {
        paymentId,
      },
    };

    return this.razorpay.orders.create(options);
  }

  async verifyPayment(orderId: string, paymentData: any): Promise<boolean> {
    if (!this.razorpay) {
      return false;
    }
    try {
      const payment = await this.razorpay.payments.fetch(paymentData.razorpay_payment_id);
      return payment.status === 'captured' && payment.order_id === orderId;
    } catch (error) {
      return false;
    }
  }

  async processPayout(payment: any): Promise<boolean> {
    // Implement Razorpay payout logic
    // This requires Razorpay X account
    try {
      if (!this.razorpay) {
        throw new Error('Razorpay is not configured.');
      }
      // Placeholder - implement actual payout
      return true;
    } catch (error) {
      return false;
    }
  }
}
