const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['order_issue', 'technical_issue', 'payment_issue', 'other']
  },
  orderId: {
    type: String
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  adminNotes: {
    type: String
  },
  adminResponse: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema); 