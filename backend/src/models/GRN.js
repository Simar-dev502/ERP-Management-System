const mongoose = require('mongoose');

const grnItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    orderedQuantity: {
      type: Number,
      required: [true, 'Ordered quantity is required'],
      min: [1, 'Ordered quantity must be at least 1'],
    },
    receivedQuantity: {
      type: Number,
      required: [true, 'Received quantity is required'],
      min: [0, 'Received quantity cannot be negative'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
  },
  { _id: false },
);

const grnSchema = new mongoose.Schema(
  {
    grnNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: [true, 'Purchase order is required'],
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    items: {
      type: [grnItemSchema],
      required: [true, 'At least one item is required'],
      validate: {
        validator: (items) => items.length > 0,
        message: 'GRN must have at least one item',
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

grnSchema.pre('save', async function () {
  if (this.isNew && !this.grnNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('GRN').countDocuments();
    this.grnNumber = `GRN-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
});

grnSchema.index({ grnNumber: 1, purchaseOrder: 1, createdAt: -1 });

module.exports = mongoose.model('GRN', grnSchema);