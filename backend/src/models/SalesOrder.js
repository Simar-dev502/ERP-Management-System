const mongoose = require('mongoose');

const salesOrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
  },
  { _id: false },
);

const salesOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    items: {
      type: [salesOrderItemSchema],
      required: [true, 'At least one item is required'],
      validate: {
        validator: (items) => items.length > 0,
        message: 'Order must have at least one item',
      },
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        message: '{VALUE} is not a valid order status',
      },
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

// Auto-generate order number before save
salesOrderSchema.pre('save', async function () {
  if (this.isNew && !this.orderNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('SalesOrder').countDocuments();
    this.orderNumber = `SO-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
});

// Auto-calculate totalPrice
salesOrderSchema.pre('save', function () {
  if (this.items && this.items.length > 0) {
    this.totalPrice = this.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }
});

salesOrderSchema.index({ orderNumber: 1, customer: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('SalesOrder', salesOrderSchema);