import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Chip, IconButton, Tooltip, TextField, InputAdornment, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Warning as WarningIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { productSchema } from '../../utils/validationSchemas';

const initialValues = { title: '', sku: '', price: '', stock: '', reorderLevel: 10, category: 'other', description: '', isActive: true };

const categories = [
  'raw-materials', 'finished-goods', 'packaging', 'electronics',
  'furniture', 'clothing', 'food-beverages', 'pharmaceuticals', 'automotive', 'other',
];

const ProductsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const canWrite = user && ['admin', 'inventory'].includes(user.role);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: page + 1, limit: pageSize, sort: '-createdAt' };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const { data } = await axiosInstance.get('/products', { params });
      setProducts(data.data);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, categoryFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const formik = useFormik({
    initialValues,
    validationSchema: productSchema,
    onSubmit: async (values, { resetForm }) => {
      setSubmitting(true);
      try {
        const payload = { ...values, price: parseFloat(values.price), stock: parseInt(values.stock, 10), reorderLevel: parseInt(values.reorderLevel, 10) };
        if (editProduct) {
          await axiosInstance.put(`/products/${editProduct._id}`, payload);
          toast.success('Product updated');
        } else {
          await axiosInstance.post('/products', payload);
          toast.success('Product created');
        }
        resetForm();
        setModalOpen(false);
        setEditProduct(null);
        fetchProducts();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to save product');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const openAdd = () => {
    setEditProduct(null);
    formik.resetForm({ values: initialValues });
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    formik.resetForm({
      values: {
        title: product.title,
        sku: product.sku,
        price: product.price.toString(),
        stock: product.stock.toString(),
        reorderLevel: product.reorderLevel?.toString() || '10',
        category: product.category,
        description: product.description || '',
        isActive: product.isActive,
      },
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/products/${deleteId}`);
      toast.success('Product deleted');
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const columns = [
    {
      field: 'title', headerName: 'Title', flex: 1.5, minWidth: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {params.row.title}
          {params.row.isLowStock && (
            <Tooltip title="Low Stock">
              <WarningIcon color="warning" fontSize="small" />
            </Tooltip>
          )}
        </Box>
      ),
    },
    { field: 'sku', headerName: 'SKU', width: 120 },
    {
      field: 'price', headerName: 'Price', width: 100, type: 'number',
      valueFormatter: (value) => `₹${value?.toFixed(2)}`,
    },
    {
      field: 'stock', headerName: 'Stock', width: 90, type: 'number',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.row.isLowStock ? 'warning' : 'default'}
          variant={params.row.isLowStock ? 'filled' : 'outlined'}
        />
      ),
    },
    { field: 'reorderLevel', headerName: 'Reorder At', width: 100, type: 'number' },
    {
      field: 'category', headerName: 'Category', width: 130,
      renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" />,
    },
    {
      field: 'isActive', headerName: 'Status', width: 90,
      renderCell: (params) => (
        <Chip label={params.value ? 'Active' : 'Inactive'} color={params.value ? 'success' : 'default'} size="small" />
      ),
    },
    {
      field: 'actions', headerName: 'Actions', width: 100, sortable: false,
      renderCell: (params) => (
        <Box>
          {canWrite && (
            <>
              <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(params.row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteId(params.row._id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader title="Products" subtitle="Manage your product inventory" onAdd={canWrite ? openAdd : undefined} addLabel="Add Product" />

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          size="small" placeholder="Search products..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ minWidth: 280 }}
        />
        <TextField
          select size="small" value={categoryFilter} label="Category"
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Data Grid */}
      <Box sx={{ height: 520, width: '100%' }}>
        <DataGrid
          rows={products}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          rowCount={total}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
          paginationMode="server"
          disableRowSelectionOnClick
          sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
        />
      </Box>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => { setModalOpen(false); setEditProduct(null); }} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Title" name="title" value={formik.values.title} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.title && Boolean(formik.errors.title)} helperText={formik.touched.title && formik.errors.title} margin="normal" />
            <TextField fullWidth label="SKU" name="sku" value={formik.values.sku} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.sku && Boolean(formik.errors.sku)} helperText={formik.touched.sku && formik.errors.sku} margin="normal" disabled={!!editProduct} />
            <TextField fullWidth label="Price" name="price" type="number" value={formik.values.price} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.price && Boolean(formik.errors.price)} helperText={formik.touched.price && formik.errors.price} margin="normal" inputProps={{ step: 0.01 }} />
            <TextField fullWidth label="Stock" name="stock" type="number" value={formik.values.stock} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.stock && Boolean(formik.errors.stock)} helperText={formik.touched.stock && formik.errors.stock} margin="normal" />
            <TextField fullWidth label="Reorder Level" name="reorderLevel" type="number" value={formik.values.reorderLevel} onChange={formik.handleChange} onBlur={formik.handleBlur} margin="normal" />
            <TextField fullWidth select label="Category" name="category" value={formik.values.category} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.category && Boolean(formik.errors.category)} helperText={formik.touched.category && formik.errors.category} margin="normal">
              {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Description" name="description" value={formik.values.description} onChange={formik.handleChange} margin="normal" multiline rows={2} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setModalOpen(false); setEditProduct(null); }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>{submitting ? <CircularProgress size={20} /> : editProduct ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        severity="error"
      />
    </Box>
  );
};

export default ProductsPage;