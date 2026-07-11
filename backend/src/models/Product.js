const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      min: [0, 'Reorder level cannot be negative'],
      default: 10,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
      enum: {
        values: [
          'raw-materials',
          'finished-goods',
          'packaging',
          'electronics',
          'furniture',
          'clothing',
          'food-beverages',
          'pharmaceuticals',
          'automotive',
          'other',
        ],
        message: '{VALUE} is not a valid category',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual: isLowStock
productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.reorderLevel;
});

// Index for search and sort performance
productSchema.index({ title: 'text', sku: 'text', category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });

module.exports = mongoose.model('Product', productSchema);