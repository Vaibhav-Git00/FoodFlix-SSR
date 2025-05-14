const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    specialInstructions: String
  }],
  orderType: {
    type: String,
    enum: ['Delivery', 'Pickup', 'Dine-in'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'Cash', 'Digital Wallet', 'Pay on Delivery'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  transactionId: String,
  subtotal: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  tipAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    specialInstructions: String
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  orderNotes: String,
  rating: {
    food: {
      type: Number,
      min: 1,
      max: 5
    },
    delivery: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String
  },
  couponCode: String,
  trackingInfo: {
    currentLocation: {
      latitude: Number,
      longitude: Number
    },
    deliveryPersonName: String,
    deliveryPersonContact: String
  }
}, {
  timestamps: true
});

// Virtual for order duration
OrderSchema.virtual('orderDuration').get(function() {
  if (this.actualDeliveryTime && this.createdAt) {
    return (this.actualDeliveryTime - this.createdAt) / (1000 * 60); // in minutes
  }
  return null;
});

// Calculate total amount before saving
OrderSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate total
  this.totalAmount = this.subtotal + this.taxAmount + this.deliveryFee + this.tipAmount - this.discountAmount;
  
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
