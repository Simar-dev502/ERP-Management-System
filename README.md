# ERP Management System

A full-stack Enterprise Resource Planning (ERP) system built with the MERN stack (MongoDB, Express, React, Node.js). Features JWT authentication, role-based access control (Admin, Sales, Purchase, Inventory), and comprehensive business modules.

## 🚀 Tech Stack

### Frontend
- **React 18** (Vite) — Fast development & build tooling
- **React Router v6** — Client-side routing
- **Redux Toolkit + RTK Query** — State management & API caching
- **Material-UI v5** — Component library & theming
- **Formik + Yup** — Form handling & validation
- **Recharts** — Data visualization
- **jsPDF + html2canvas** — PDF invoice generation
- **react-toastify** — Notifications

### Backend
- **Node.js + Express** — REST API server
- **Mongoose** — MongoDB ODM
- **JWT + bcrypt** — Authentication & password hashing
- **express-validator** — Input validation
- **helmet + cors + morgan** — Security & logging
- **swagger-ui-express** — API documentation
- **multer** — File uploads

### Testing
- **Jest + Supertest** — Backend integration tests
- **Vitest + React Testing Library** — Frontend component tests

## 📁 Project Structure

```
erp-system/
├── backend/               # Express API server
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/     # Auth, role, error handling
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express routes
│   │   ├── utils/         # Helpers & utilities
│   │   ├── app.js         # Express app setup
│   │   └── server.js      # Server entry point
│   ├── .env.example
│   └── package.json
├── frontend/              # React client
│   ├── src/
│   │   ├── api/           # Axios instance & interceptors
│   │   ├── app/           # Redux store
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Redux slices & RTK Query
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── routes/        # Route configuration
│   │   ├── theme/         # MUI theme customization
│   │   ├── utils/         # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── .gitignore
├── .editorconfig
├── .prettierrc
├── eslint.config.js
├── package.json           # Root scripts (concurrently)
└── README.md
```

## 🧩 Business Modules

| Module | Description | Roles |
|--------|-------------|-------|
| **Products** | Inventory items with SKU, stock tracking, categories | Admin, Inventory |
| **Customers** | Customer records with contact & GST info | Admin, Sales |
| **Suppliers** | Supplier records with contact & GST info | Admin, Purchase |
| **Sales Orders** | Customer orders with line items & status workflow | Admin, Sales |
| **Purchase Orders** | Supplier orders with line items & status workflow | Admin, Purchase |
| **GRN** | Goods Received Note linked to POs, auto-updates stock | Admin, Inventory |
| **Invoices** | Customer invoices linked to SOs, PDF export | Admin, Sales |
| **Users** | User management with role assignment | Admin |

## 🔐 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all modules & user management |
| **Sales** | Products (read), Customers, Sales Orders, Invoices |
| **Purchase** | Products (read), Suppliers, Purchase Orders, GRN |
| **Inventory** | Products (CRUD), GRN |

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/erp-system.git
cd erp-system

# Install all dependencies (root + backend + frontend)
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and JWT secret

# Start development (backend + frontend concurrently)
npm run dev
```

The API server runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | 5000 |
| `MONGO_URI` | MongoDB connection string | mongodb://localhost:27017/erp |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRE` | JWT expiration | 30d |
| `NODE_ENV` | Environment mode | development |

## 📚 API Documentation

Once the server is running, visit `http://localhost:5000/api/docs` for Swagger API documentation.

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests only
npm --prefix backend run test

# Frontend tests only
npm --prefix frontend run test
```

## 🚢 Deployment

### Backend (Render)
1. Push to GitHub
2. Create a new Web Service on Render
3. Set build command: `npm --prefix backend install`
4. Set start command: `npm --prefix backend run start`
5. Add environment variables in Render dashboard

### Frontend (Vercel)
1. Push to GitHub
2. Import project in Vercel
3. Set framework preset: Vite
4. Set `VITE_API_URL` environment variable to your backend URL

### Database (MongoDB Atlas)
1. Create a free cluster on MongoDB Atlas
2. Get your connection string
3. Set `MONGO_URI` in your deployment environment

## 📄 License

MIT