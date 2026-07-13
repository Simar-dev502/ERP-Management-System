import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const registerSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long').required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  role: yup.string().oneOf(['admin', 'sales', 'purchase', 'inventory'], 'Select a valid role').required('Role is required'),
});

export const productSchema = yup.object({
  title: yup.string().min(2, 'Title must be at least 2 characters').max(100).required('Title is required'),
  sku: yup.string().matches(/^[A-Z0-9-]+$/, 'SKU: uppercase letters, numbers, hyphens only').required('SKU is required'),
  price: yup.number().min(0, 'Price cannot be negative').required('Price is required'),
  stock: yup.number().integer().min(0, 'Stock cannot be negative').required('Stock is required'),
  reorderLevel: yup.number().integer().min(0).default(10),
  category: yup.string().required('Category is required'),
});

export const customerSchema = yup.object({
  name: yup.string().min(2).max(100).required('Name is required'),
  email: yup.string().email().required('Email is required'),
  phone: yup.string().matches(/^\+?[\d\s-]{7,15}$/, 'Invalid phone number').required('Phone is required'),
  gstNo: yup.string().matches(/^[0-9A-Z]{15}$/, 'GST must be 15 characters').nullable(),
});

export const supplierSchema = yup.object({
  name: yup.string().min(2).max(100).required('Name is required'),
  email: yup.string().email().required('Email is required'),
  phone: yup.string().matches(/^\+?[\d\s-]{7,15}$/, 'Invalid phone number').required('Phone is required'),
  gstNo: yup.string().matches(/^[0-9A-Z]{15}$/, 'GST must be 15 characters').nullable(),
});

export const salesOrderSchema = yup.object({
  customer: yup.string().required('Customer is required'),
  items: yup.array().of(
    yup.object({
      product: yup.string().required('Product is required'),
      quantity: yup.number().integer().min(1, 'Min quantity is 1').required('Quantity is required'),
      price: yup.number().min(0, 'Price cannot be negative').required('Price is required'),
    }),
  ).min(1, 'At least one item required'),
});

export const purchaseOrderSchema = yup.object({
  supplier: yup.string().required('Supplier is required'),
  items: yup.array().of(
    yup.object({
      product: yup.string().required('Product is required'),
      quantity: yup.number().integer().min(1).required('Quantity is required'),
      price: yup.number().min(0).required('Price is required'),
    }),
  ).min(1, 'At least one item required'),
});