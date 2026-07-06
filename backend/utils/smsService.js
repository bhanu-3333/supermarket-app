const axios = require('axios');

class SMSService {
  constructor() {
    // Using Fast2SMS - you can replace with any SMS provider
    this.apiKey = process.env.SMS_API_KEY || 'demo-key';
    this.baseUrl = 'https://www.fast2sms.com/dev/bulkV2';
  }

  async sendOrderNotification(phone, orderDetails) {
    try {
      // Create product list string
      let productListText = '';
      if (orderDetails.orderItems && orderDetails.orderItems.length > 0) {
        productListText = orderDetails.orderItems.map(item => 
          `${item.name} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`
        ).join(', ');
      }

      const message = `Hi ${orderDetails.customerName}! Order #${orderDetails.orderId} placed successfully at ${orderDetails.storeName}.\n\nItems: ${productListText}\n\nTotal: ₹${orderDetails.totalPrice}\n\nThank you for shopping with SmartCart!`;
      
      // If using a demo key, just log the message
      if (this.apiKey === 'demo-key') {
        console.log('SMS Service (Demo Mode):', {
          phone,
          message,
          orderDetails
        });
        return { success: true, message: 'SMS sent (demo mode)' };
      }

      const response = await axios.post(this.baseUrl, {
        authorization: this.apiKey,
        sender_id: 'FSTSMS',
        message: message,
        language: 'english',
        route: 'p',
        numbers: phone,
      });

      if (response.data.return) {
        console.log('SMS sent successfully:', response.data);
        return { success: true, data: response.data };
      } else {
        console.error('SMS sending failed:', response.data);
        return { success: false, error: response.data };
      }
    } catch (error) {
      console.error('SMS Service Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeMessage(phone, customerName, storeName) {
    try {
      const message = `Welcome to ${storeName}, ${customerName}! You have successfully registered with SmartCart. Start shopping and enjoy seamless checkout!`;
      
      // If using a demo key, just log the message
      if (this.apiKey === 'demo-key') {
        console.log('SMS Service (Demo Mode):', {
          phone,
          message
        });
        return { success: true, message: 'Welcome SMS sent (demo mode)' };
      }

      const response = await axios.post(this.baseUrl, {
        authorization: this.apiKey,
        sender_id: 'FSTSMS',
        message: message,
        language: 'english',
        route: 'p',
        numbers: phone,
      });

      if (response.data.return) {
        console.log('Welcome SMS sent successfully:', response.data);
        return { success: true, data: response.data };
      } else {
        console.error('Welcome SMS sending failed:', response.data);
        return { success: false, error: response.data };
      }
    } catch (error) {
      console.error('SMS Service Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSService();