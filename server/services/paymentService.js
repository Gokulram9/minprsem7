const crypto = require('crypto');

// Mock transaction database in-memory for immediate testing/analytics compatibility
const transactions = [];

class PaymentService {
  /**
   * Initialize payment session (Stripe / PayPal ready configuration)
   */
  async createPaymentSession({ userId, amount, purpose, currency = 'LKR', details = {} }) {
    // Abstraction checks if real environment keys are present
    const provider = process.env.PAYMENT_PROVIDER || 'MOCK_GATEWAY';
    
    const transactionId = 'TXN_' + crypto.randomBytes(8).toString('hex').toUpperCase();
    const paymentUrl = `https://checkout.lexora.gov/pay/${transactionId}`;

    const txnRecord = {
      transactionId,
      userId,
      amount,
      currency,
      purpose, // e.g. 'Consultation Fee', 'Booking Fee', 'Legal Service Fee'
      status: 'Pending',
      provider,
      details,
      createdAt: new Date()
    };

    transactions.push(txnRecord);
    
    return {
      success: true,
      transactionId,
      paymentUrl,
      status: 'Pending'
    };
  }

  /**
   * Capture and confirm payment callback hook
   */
  async confirmPayment(transactionId) {
    const txn = transactions.find(t => t.transactionId === transactionId);
    if (!txn) {
      throw new Error('Transaction not found');
    }
    txn.status = 'Completed';
    txn.completedAt = new Date();
    return { success: true, transaction: txn };
  }

  /**
   * Process refund requests
   */
  async refundPayment(transactionId, amount) {
    const txn = transactions.find(t => t.transactionId === transactionId);
    if (!txn) {
      throw new Error('Transaction not found');
    }
    
    txn.status = 'Refunded';
    txn.refundedAmount = amount || txn.amount;
    txn.refundedAt = new Date();
    
    return { success: true, transaction: txn };
  }

  /**
   * Retrieve transaction history
   */
  async getTransactionHistory(userId) {
    return transactions.filter(t => t.userId === userId.toString());
  }

  /**
   * Retrieve all transaction logs for Admin Analytics
   */
  async getAllTransactions() {
    return transactions;
  }
}

module.exports = new PaymentService();
