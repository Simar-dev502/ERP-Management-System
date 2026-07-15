import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Chip, IconButton, Tooltip, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert, Typography, Grid,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
} from '@mui/icons-material';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { salesOrderSchema } from '../../utils/validationSchemas';

const statusColors = { pending: 'warning', confirmed: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error' };

const SalesOrdersPage = () => {
  const { user } = useSelector((state) => state.auth);
  const canWrite = user && ['admin', 'sales'].includes(user.role);

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { page: page + 1, limit: pageSize, sort: '-createdAt' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await axiosInstance.get('/sales-orders', { params });
      setOrders(data.data); setTotal(data.total);
    } catch (err) { setError(err.response?.data?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [page, pageSize, search, statusFilter]);

  const fetchLookups = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        axiosInstance.get('/customers', { params: { limit: 200 } }),
        axiosInstance.get('/products', { params: { limit: 200 } }),
      ]);
      setCustomers(custRes.data.data);
      setProducts(prodRes.data.data);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const formik = useFormik({
    initialValues: { customer: '', items: [{ product: '', quantity: 1, price: '' }] },
    validationSchema: salesOrderSchema,
    onSubmit: async (values, { resetForm }) => {
      setSubmitting(true);
      try {
        const payload = {
          customer: values.customer,
          items: values.items.map((i) => ({ product: i.product, quantity: parseInt(i.quantity, 10), price: parseFloat(i.price) })),
        };
        if (editItem) {
          await axiosInstance.put(`/sales-orders/${editItem._id}`, payload);
          toast.success('Order updated');
        } else {
          await axiosInstance.post('/sales-orders', payload);
          toast.success('Order created');
        }
        resetForm(); setModalOpen(false); setEditItem(null); fetchOrders();
      } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
      finally { setSubmitting(false); }
    },
  });

  const openAdd = () => {
    setEditItem(null);
    formik.resetForm({ values: { customer: '', items: [{ product: '', quantity: 1, price: '' }] } });
    fetchLookups();
    setModalOpen(true);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axiosInstance.put(`/sales-orders/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update status'); }
  };

  const handleDelete = async () => {
    try { await axiosInstance.delete(`/sales-orders/${deleteId}`); toast.success('Deleted'); setDeleteId(null); fetchOrders(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleProductSelect = (index, productId) => {
    const product = products.find((p) => p._id === productId);
    formik.setFieldValue(`items.${index}.product`, productId);
    if (product) formik.setFieldValue(`items.${index}.price`, product.price.toString());
  };

  const columns = [
    { field: 'orderNumber', headerName: 'Order #', width: 160 },
    { field: 'customer', headerName: 'Customer', flex: 1, minWidth: 150, valueGetter: (params) => params.row.customer?.name || '—' },
    { field: 'totalPrice', headerName: 'Total', width: 110, type: 'number', valueFormatter: (v) => `₹${v?.toFixed(2)}` },
    {
      field: 'status', headerName: 'Status', width: 130,
      renderCell: (params) => (
        <Select
          size="small" value={params.row.status}
          onChange={(e) => handleStatusUpdate(params.row._id, e.target.value)}
          sx={{ '& .MuiSelect-select': { py: 0.5 } }}
          disabled={!canWrite}
        >
          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <MenuItem key={s} value={s}>
              <Chip label={s} size="small" color={statusColors[s]} />
            </MenuItem>
          ))}
        </Select>
      ),
    },
    { field: 'items', headerName: 'Items', width: 80, valueGetter: (params) => params.row.items?.length || 0 },
    { field: 'createdAt', headerName: 'Date', width: 110, valueFormatter: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { field: 'actions', headerName: 'Actions', width: 80, sortable: false, renderCell: (p) => (
      <Box>{canWrite && <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteId(p.row._id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>}</Box>
    )},
  ];

  return (
    <Box>
      <PageHeader title="Sales Orders" subtitle="Manage customer sales orders" onAdd={canWrite ? openAdd : undefined} addLabel="New Sales Order" />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField size="small" placeholder="Search by order #..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ minWidth: 280 }} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">All</MenuItem>
            {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ height: 520, width: '100%' }}>
        <DataGrid rows={orders} columns={columns} getRowId={(r) => r._id} loading={loading} rowCount={total} pageSizeOptions={[5, 10, 25, 50]} paginationModel={{ page, pageSize }} onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }} paginationMode="server" disableRowSelectionOnClick sx={{ borderRadius: 2, bgcolor: 'background.paper' }} />
      </Box>

      {/* Add Order Modal */}
      <Dialog open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} maxWidth="md" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>New Sales Order</DialogTitle>
          <DialogContent>
            <TextField fullWidth select label="Customer" name="customer" value={formik.values.customer} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.customer && Boolean(formik.errors.customer)} helperText={formik.touched.customer && formik.errors.customer} margin="normal">
              {customers.map((c) => <MenuItem key={c._id} value={c._id}>{c.name} ({c.email})</MenuItem>)}
            </TextField>

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Order Items</Typography>
            {formik.values.items.map((item, index) => (
              <Grid container spacing={1} key={index} sx={{ mb: 1 }}>
                <Grid item xs={5}>
                  <TextField fullWidth size="small" select label="Product" value={item.product} onChange={(e) => handleProductSelect(index, e.target.value)} error={formik.touched.items?.[index]?.product && Boolean(formik.errors.items?.[index]?.product)}>
                    {products.map((p) => <MenuItem key={p._id} value={p._id}>{p.title} ({p.sku})</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth size="small" label="Qty" type="number" value={item.quantity} onChange={(e) => formik.setFieldValue(`items.${index}.quantity`, e.target.value)} inputProps={{ min: 1 }} />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth size="small" label="Price" type="number" value={item.price} onChange={(e) => formik.setFieldValue(`items.${index}.price`, e.target.value)} inputProps={{ step: 0.01 }} />
                </Grid>
                <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                  {formik.values.items.length > 1 && (
                    <Button size="small" color="error" onClick={() => {
                      const newItems = formik.values.items.filter((_, i) => i !== index);
                      formik.setFieldValue('items', newItems);
                    }}>X</Button>
                  )}
                </Grid>
              </Grid>
            ))}
            <Button size="small" startIcon={<AddIcon />} onClick={() => {
              formik.setFieldValue('items', [...formik.values.items, { product: '', quantity: 1, price: '' }]);
            }}>Add Item</Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setModalOpen(false); setEditItem(null); }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>{submitting ? <CircularProgress size={20} /> : 'Create Order'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog open={!!deleteId} title="Delete Order" message="Are you sure?" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} severity="error" />
    </Box>
  );
};

export default SalesOrdersPage;