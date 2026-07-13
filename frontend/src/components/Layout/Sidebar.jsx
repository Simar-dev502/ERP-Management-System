import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Typography, Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductIcon,
  People as CustomerIcon,
  LocalShipping as SupplierIcon,
  ShoppingCart as SalesOrderIcon,
  ReceiptLong as PurchaseOrderIcon,
  Assignment as GrnIcon,
  Receipt as InvoiceIcon,
  ManageAccounts as UserIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, roles: ['admin', 'sales', 'purchase', 'inventory'] },
  { label: 'Products', path: '/products', icon: <ProductIcon />, roles: ['admin', 'sales', 'purchase', 'inventory'] },
  { label: 'Customers', path: '/customers', icon: <CustomerIcon />, roles: ['admin', 'sales'] },
  { label: 'Suppliers', path: '/suppliers', icon: <SupplierIcon />, roles: ['admin', 'purchase'] },
  { label: 'Sales Orders', path: '/sales-orders', icon: <SalesOrderIcon />, roles: ['admin', 'sales'] },
  { label: 'Purchase Orders', path: '/purchase-orders', icon: <PurchaseOrderIcon />, roles: ['admin', 'purchase'] },
  { label: 'GRN', path: '/grn', icon: <GrnIcon />, roles: ['admin', 'inventory'] },
  { label: 'Invoices', path: '/invoices', icon: <InvoiceIcon />, roles: ['admin', 'sales'] },
  { label: 'Users', path: '/users', icon: <UserIcon />, roles: ['admin'] },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ProductIcon color="primary" />
          <Typography variant="h6" noWrap>
            ERP System
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1 }}>
        {filteredNav.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
export { DRAWER_WIDTH };