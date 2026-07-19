import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Chip, IconButton, Tooltip, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { customerSchema } from '../../utils/validationSchemas';

const initialValues = { name: '', email: '', phone: '', gstNo: '', address: { street: '', city: '', state: '', zipCode: '', country: 'India' } };

const CustomersPage = () => {
  const { user } = useSelector((state) => state.auth);
  const canWrite = user && ['admin', 'sales'].includes(user.role);

  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { page: page + 1, limit: pageSize, sort: '-createdAt' };
      if (search) params.search = search;
      const { data } = await axiosInstance.get('/customers', { params });
      setCustomers(data.data); setTotal(data.total);
    } catch (err) { setError(err.response?.data?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [page, pageSize, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formik = useFormik({
    initialValues,
    validationSchema: customerSchema,
    onSubmit: async (values, { resetForm }) => {
      setSubmitting(true);
      try {
        if (editItem) {
          await axiosInstance.put(`/customers/${editItem._id}`, values);
          toast.success('Customer updated');
        } else {
          await axiosInstance.post('/customers', values);
          toast.success('Customer created');
        }
        resetForm(); setModalOpen(false); setEditItem(null); fetchData();
      } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
      finally { setSubmitting(false); }
    },
  });

  const openAdd = () => { setEditItem(null); formik.resetForm({ values: initialValues }); setModalOpen(true); };
  const openEdit = (item) => {
    setEditItem(item);
    formik.resetForm({
      values: {
        name: item.name, email: item.email, phone: item.phone, gstNo: item.gstNo || '',
        address: item.address || initialValues.address,
      },
    });
    setModalOpen(true);
  };
  const handleDelete = async () => {
    try { await axiosInstance.delete(`/customers/${deleteId}`); toast.success('Deleted'); setDeleteId(null); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 140 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    { field: 'phone', headerName: 'Phone', width: 140 },
    { field: 'gstNo', headerName: 'GST No', width: 150 },
    { field: 'isActive', headerName: 'Status', width: 90, renderCell: (p) => <Chip label={p.value ? 'Active' : 'Inactive'} color={p.value ? 'success' : 'default'} size="small" /> },
    { field: 'actions', headerName: 'Actions', width: 100, sortable: false, renderCell: (p) => (
      <Box>{canWrite && (<><Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p.row)}><EditIcon fontSize="small" /></IconButton></Tooltip><Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteId(p.row._id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip></>)}</Box>
    )},
  ];

  return (
    <Box>
      <PageHeader title="Customers" subtitle="Manage your customers" onAdd={canWrite ? openAdd : undefined} addLabel="Add Customer" />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField size="small" placeholder="Search customers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ minWidth: 280 }} />
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ height: 520, width: '100%' }}>
        <DataGrid rows={customers} columns={columns} getRowId={(r) => r._id} loading={loading} rowCount={total} pageSizeOptions={[5, 10, 25, 50]} paginationModel={{ page, pageSize }} onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }} paginationMode="server" disableRowSelectionOnClick sx={{ borderRadius: 2, bgcolor: 'background.paper' }} />
      </Box>
      <Dialog open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>{editItem ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Name" name="name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && formik.errors.name} margin="normal" />
            <TextField fullWidth label="Email" name="email" type="email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.email && Boolean(formik.errors.email)} helperText={formik.touched.email && formik.errors.email} margin="normal" />
            <TextField fullWidth label="Phone" name="phone" value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.phone && Boolean(formik.errors.phone)} helperText={formik.touched.phone && formik.errors.phone} margin="normal" />
            <TextField fullWidth label="GST No" name="gstNo" value={formik.values.gstNo} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.gstNo && Boolean(formik.errors.gstNo)} helperText={formik.touched.gstNo && formik.errors.gstNo} margin="normal" />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setModalOpen(false); setEditItem(null); }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>{submitting ? <CircularProgress size={20} /> : editItem ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <ConfirmDialog open={!!deleteId} title="Delete Customer" message="Are you sure?" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} severity="error" />
    </Box>
  );
};

export default CustomersPage;