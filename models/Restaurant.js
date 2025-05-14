const mongoose = require('mongoose');

const OperatingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  openTime: {
    type: String,
    required: true
  },
  closeTime: {
    type: String,
    required: true
  },
  isClosed: {
    type: Boolean,
    default: false
  }
});

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  cuisine: {
    type: String,
    required: true
  },
  cuisineType: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    default: '$$'
  },
  location: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Temporarily Closed'],
    default: 'Open'
  },
  operatingHours: [OperatingHoursSchema],
  image: {
    type: String,
    required: true
  },
  gallery: [String],
  features: {
    hasDelivery: {
      type: Boolean,
      default: true
    },
    hasTakeout: {
      type: Boolean,
      default: true
    },
    hasDineIn: {
      type: Boolean,
      default: true
    },
    hasOutdoorSeating: {
      type: Boolean,
      default: false
    },
    acceptsReservations: {
      type: Boolean,
      default: false
    },
    acceptsOnlineOrders: {
      type: Boolean,
      default: true
    }
  },
  deliveryInfo: {
    deliveryFee: {
      type: Number,
      default: 0
    },
    minimumOrderAmount: {
      type: Number,
      default: 0
    },
    estimatedDeliveryTime: {
      type: Number, // in minutes
      default: 30
    },
    deliveryRadius: {
      type: Number, // in miles or km
      default: 5
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPromoted: {
    type: Boolean,
    default: false
  },
  promotionExpiryDate: Date,
  averagePreparationTime: {
    type: Number, // in minutes
    default: 20
  },
  tags: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
