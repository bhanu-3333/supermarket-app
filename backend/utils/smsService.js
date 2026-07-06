const axios = require('axios');

class SMSService {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY;
    this.baseUrl = 'https://www.fast2sms.com/dev/bulkV2';
  }

  async sendOrderNotification(phone, orderDetails) {
    try {
      const productListText = (orderDetails.orderItems || [])
        .map(item => `${item.name} x${item.quantity} - Rs.${(item.price * item.quantity).toFixed(2)}`)
        .join(', ');

      const message = `Hi ${orderDetails.customerName}! Order #${orderDetails.orderId} placed at ${orderDetails.storeName}. Items: ${productListText}. Total: Rs.${orderDetails.totalPrice}. Thank you for shopping with SmartCart!`;

      return await this._send(phone, message, 'Order notification');
    } catch (error) {
      console.error('[SMS] sendOrderNotification error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeMessage(phone, customerName, storeName) {
    try {
      const message = `Welcome to ${storeName}, ${customerName}! You have successfully registered with SmartCart. Start shopping and enjoy seamless checkout!`;
      return await this._send(phone, message, 'Welcome message');
    } catch (error) {
      console.error('[SMS] sendWelcomeMessage error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async _send(phone, message, label) {
    if (!this.apiKey) {
      console.log(`[SMS] No API key set — skipping ${label} to ${phone}`);
      console.log(`[SMS] Message: ${message}`);
      return { success: false, error: 'SMS_API_KEY not configured' };
    }

    console.log(`[SMS] Sending ${label} to ${phone}...`);
    console.log(`[SMS] Message: ${message}`);

    try {
      // Fast2SMS bulkV2 — authorization goes in the HEADER, not the body
      const response = await axios.post(
        this.baseUrl,
        {
          sender_id: 'FSTSMS',
          message,
          language: 'english',
          route: 'p',
          numbers: phone,
        },
        {
          headers: {
            authorization: this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.return === true) {
        console.log(`[SMS] ${label} sent successfully to ${phone}`);
        return { success: true, data: response.data };
      } else {
        console.error(`[SMS] ${label} failed:`, response.data);
        return { success: false, error: response.data };
      }
    } catch (err) {
      console.error(`[SMS] HTTP error for ${label}:`, err.response?.data || err.message);
      return { success: false, error: err.response?.data || err.message };
    }
  }
}

module.exports = new SMSService();
