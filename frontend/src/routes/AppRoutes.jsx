import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleRoute from '../components/common/RoleRoute';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProductsPage from '../pages/products/ProductsPage';
import CustomersPage from '../pages/customers/CustomersPage';
import SuppliersPage from '../pages/suppliers/SuppliersPage';
import SalesOrdersPage from '../pages/salesOrders/SalesOrdersPage';
import PurchaseOrdersPage from '../pages/purchaseOrders/PurchaseOrdersPage';
import GrnPage from '../pages/grn/GrnPage';
import InvoicesPage from '../pages/invoices/InvoicesPage';
import UsersPage from '../pages/users/UsersPage';

const ProtectedLayout = ({ children, mode, toggleTheme }) => (
  <Layout mode={mode} toggleTheme={toggleTheme}>
    {children}
  </Layout>
);

const AppRoutes = ({ mode, toggleTheme }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public routes - no layout */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />

      {/* Protected routes with layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ProtectedLayout mode={mode} toggleTheme={toggleTheme}>
              <DashboardPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProtectedLayout mode={mode} toggleTheme={toggleTheme}>
              <ProductsPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <ProtectedLayout mode={mode} toggleTheme={toggleTheme}>
              <CustomersPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <ProtectedLayout mode={mode} toggleTheme={toggleTheme}>
              <SuppliersPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales-orders"
        element={
          <ProtectedRoute>
            <ProtectedLayout mode={mode} toggleTheme={toggleTheme}>
              <SalesOrdersPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchase-orders"
        element={
          <ProtectedRoute>
            <ProtectedLayout mode={mode} toggleTheme={toggleTheme}>
              <PurchaseOrdersPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/grn"
        element={
          <ProtectedRoute>
            <ProtectedLayout mode={mode} toggleTheme={toggleTheme}>
              <GrnPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <ProtectedLayout mode={mode} toggleTheme={toggleTheme}>
              <InvoicesPage />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['admin']}>
              <ProtectedLayout mode={mode} toggleTheme={toggleTheme}>
                <UsersPage />
              </ProtectedLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;