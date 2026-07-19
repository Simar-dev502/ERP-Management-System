import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';
import {
  Inventory as ProductIcon,
  People as CustomerIcon,
  ShoppingCart as OrderIcon,
  Warning as LowStockIcon,
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import axiosInstance from '../../api/axios';

const PIE_COLORS = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#d32f2f'];

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, display: 'flex' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Typography variant="h4" fontWeight="bold">{value ?? '—'}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const ChartCard = ({ title, children }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        {children}
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axiosInstance.get('/dashboard/stats');
        setStats(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress size={60} /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!stats) return null;

  // Prepare chart data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const salesTrendData = (stats.monthlySales || []).map((s) => ({
    name: `${monthNames[s.month - 1]} ${s.year}`,
    Revenue: s.total,
    Orders: s.count,
  }));

  const topProductsData = (stats.topProducts || []).map((p) => ({
    name: p.title || p.sku || 'Unknown',
    'Units Sold': p.totalSold,
    Revenue: p.revenue,
  }));

  const orderStatusData = Object.entries(stats.orderStatusCounts || {})
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Dashboard</Typography>

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Products" value={stats.totalProducts} icon={<ProductIcon sx={{ color: '#1976d2', fontSize: 32 }} />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Customers" value={stats.totalCustomers} icon={<CustomerIcon sx={{ color: '#388e3c', fontSize: 32 }} />} color="#388e3c" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Sales Orders" value={stats.totalSalesOrders} icon={<OrderIcon sx={{ color: '#f57c00', fontSize: 32 }} />} color="#f57c00" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Low Stock Items" value={stats.lowStockProducts} icon={<LowStockIcon sx={{ color: '#d32f2f', fontSize: 32 }} />} color="#d32f2f" />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ChartCard title="Sales Trend (Last 6 Months)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Revenue" stroke="#1976d2" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <ChartCard title="Order Status">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {orderStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12}>
          <ChartCard title="Top 5 Products by Units Sold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Units Sold" fill="#1976d2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Revenue" fill="#388e3c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;