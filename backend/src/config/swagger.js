const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ERP Management System API',
      version: '1.0.0',
      description: 'RESTful API for managing products, customers, suppliers, sales orders, purchase orders, GRN, invoices, and users with JWT authentication and RBAC.',
      contact: {
        name: 'ERP System Support',
        email: 'support@erpsystem.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            _id: { type: 'string', description: 'Auto-generated MongoDB ID' },
            name: { type: 'string', description: 'User full name' },
            email: { type: 'string', format: 'email', description: 'User email' },
            role: { type: 'string', enum: ['admin', 'sales', 'purchase', 'inventory'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          required: ['title', 'sku', 'price', 'stock', 'reorderLevel', 'category'],
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            sku: { type: 'string' },
            price: { type: 'number' },
            stock: { type: 'integer' },
            reorderLevel: { type: 'integer' },
            category: { type: 'string', enum: ['raw-materials', 'finished-goods', 'packaging', 'electronics', 'furniture', 'clothing', 'food-beverages', 'pharmaceuticals', 'automotive', 'other'] },
            description: { type: 'string' },
            isLowStock: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Customer: {
          type: 'object',
          required: ['name', 'email', 'phone'],
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' },
                country: { type: 'string' },
              },
            },
            gstNo: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Supplier: {
          type: 'object',
          required: ['name', 'email', 'phone'],
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' },
                country: { type: 'string' },
              },
            },
            gstNo: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        SalesOrder: {
          type: 'object',
          required: ['customer', 'items'],
          properties: {
            _id: { type: 'string' },
            orderNumber: { type: 'string' },
            customer: { type: 'string', description: 'Customer ID' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string' },
                  quantity: { type: 'integer' },
                  price: { type: 'number' },
                },
              },
            },
            totalPrice: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PurchaseOrder: {
          type: 'object',
          required: ['supplier', 'items'],
          properties: {
            _id: { type: 'string' },
            orderNumber: { type: 'string' },
            supplier: { type: 'string', description: 'Supplier ID' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string' },
                  quantity: { type: 'integer' },
                  price: { type: 'number' },
                },
              },
            },
            totalPrice: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'received', 'cancelled'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        GRN: {
          type: 'object',
          required: ['purchaseOrder', 'items'],
          properties: {
            _id: { type: 'string' },
            grnNumber: { type: 'string' },
            purchaseOrder: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string' },
                  orderedQuantity: { type: 'integer' },
                  receivedQuantity: { type: 'integer' },
                  unitPrice: { type: 'number' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Invoice: {
          type: 'object',
          required: ['salesOrder'],
          properties: {
            _id: { type: 'string' },
            invoiceNumber: { type: 'string' },
            salesOrder: { type: 'string' },
            subtotal: { type: 'number' },
            taxRate: { type: 'number' },
            taxAmount: { type: 'number' },
            totalAmount: { type: 'number' },
            status: { type: 'string', enum: ['paid', 'unpaid', 'overdue', 'cancelled'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            status: { type: 'integer' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management (Admin only)' },
      { name: 'Products', description: 'Product inventory management' },
      { name: 'Customers', description: 'Customer management' },
      { name: 'Suppliers', description: 'Supplier management' },
      { name: 'Sales Orders', description: 'Sales order management' },
      { name: 'Purchase Orders', description: 'Purchase order management' },
      { name: 'GRN', description: 'Goods Received Notes' },
      { name: 'Invoices', description: 'Invoice management' },
      { name: 'Health', description: 'API health check' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsDoc(swaggerOptions);