const twilio = require('twilio');

class SMSService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendOrderNotification(phone, orderDetails) {
    const productListText = (orderDetails.orderItems || [])
      .map(item => `${item.name} x${item.quantity} - Rs.${(item.price * item.quantity).toFixed(2)}`)
      .join(', ');

    const message = `Hi ${orderDetails.customerName}! Order #${orderDetails.orderId} placed at ${orderDetails.storeName}. Items: ${productListText}. Total: Rs.${orderDetails.totalPrice}. Thank you for shopping with SmartCart!`;

    return this._send(phone, message, 'Order notification');
  }

  async sendWelcomeMessage(phone, customerName, storeName) {
    const message = `Welcome to ${storeName}, ${customerName}! You have successfully registered with SmartCart. Start shopping and enjoy seamless checkout!`;
    return this._send(phone, message, 'Welcome message');
  }

  async _send(phone, message, label) {
    if (!this.accountSid || !this.authToken || !this.fromNumber || this.fromNumber === 'REPLACE_WITH_YOUR_TWILIO_NUMBER') {
      console.log(`[SMS] Twilio not configured — skipping ${label}`);
      console.log(`[SMS] Would have sent to ${phone}: ${message}`);
      return { success: false, error: 'Twilio not configured' };
    }

    // Format phone to E.164 — add +91 for Indian numbers
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`;

    console.log(`[SMS] Sending ${label} to ${formatted}...`);

    try {
      const client = twilio(this.accountSid, this.authToken);
      const result = await client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formatted,
      });

      console.log(`[SMS] ${label} sent! SID: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (err) {
      console.error(`[SMS] ${label} failed:`, err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new SMSService();
