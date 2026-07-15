import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Chip, TextField, InputAdornment, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert, Typography, Grid,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import * as yup from 'yup';

const GrnPage = () => {
  const { user } = useSelector((state) => state.auth);
  const canWrite = user && ['admin', 'inventory'].includes(user.role);

  const [grns, setGrns] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pos, setPos] = useState([]);
  const [selectedPo, setSelectedPo] = useState(null);

  const fetchGrns = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { page: page + 1, limit: pageSize, sort: '-createdAt' };
      if (search) params.search = search;
      const { data } = await axiosInstance.get('/grn', { params });
      setGrns(data.data); setTotal(data.total);
    } catch (err) { setError(err.response?.data?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [page, pageSize, search]);

  useEffect(() => { fetchGrns(); }, [fetchGrns]);

  const openAdd = async () => {
    try {
      const { data } = await axiosInstance.get('/purchase-orders', { params: { status: 'shipped', limit: 100 } });
      setPos(data.data);
      setSelectedPo(null);
      formik.resetForm();
      setModalOpen(true);
    } catch { toast.error('Failed to load POs'); }
  };

  const formik = useFormik({
    initialValues: { purchaseOrder: '', items: [], notes: '' },
    onSubmit: async (values, { resetForm }) => {
      setSubmitting(true);
      try {
        await axiosInstance.post('/grn', values);
        toast.success('GRN created - stock updated');
        resetForm(); setModalOpen(false); fetchGrns();
      } catch (err) { toast.error(err.response?.data?.message || 'Failed to create GRN'); }
      finally { setSubmitting(false); }
    },
  });

  const handlePoSelect = async (poId) => {
    formik.setFieldValue('purchaseOrder', poId);
    try {
      const { data } = await axiosInstance.get(`/purchase-orders/${poId}`);
      setSelectedPo(data.data);
      formik.setFieldValue('items', data.data.items.map((item) => ({
        product: item.product._id,
        orderedQuantity: item.quantity,
        receivedQuantity: item.quantity,
        unitPrice: item.price,
      })));
    } catch { toast.error('Failed to load PO details'); }
  };

  const columns = [
    { field: 'grnNumber', headerName: 'GRN #', width: 160 },
    { field: 'purchaseOrder', headerName: 'PO', width: 160, valueGetter: (p) => p.row.purchaseOrder?.orderNumber || '—' },
    { field: 'supplier', headerName: 'Supplier', flex: 1, valueGetter: (p) => p.row.supplier?.name || '—' },
    { field: 'items', headerName: 'Items', width: 80, valueGetter: (p) => p.row.items?.length || 0 },
    { field: 'createdAt', headerName: 'Date', width: 110, valueFormatter: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  return (
    <Box>
      <PageHeader title="Goods Received Notes" subtitle="Receive inventory from purchase orders" onAdd={canWrite ? openAdd : undefined} addLabel="New GRN" />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField size="small" placeholder="Search GRN..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ minWidth: 280 }} />
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ height: 520, width: '100%' }}>
        <DataGrid rows={grns} columns={columns} getRowId={(r) => r._id} loading={loading} rowCount={total} pageSizeOptions={[5, 10, 25, 50]} paginationModel={{ page, pageSize }} onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }} paginationMode="server" disableRowSelectionOnClick sx={{ borderRadius: 2, bgcolor: 'background.paper' }} />
      </Box>
      <Dialog open={modalOpen} onClose={() => { setModalOpen(false); }} maxWidth="md" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Create Goods Received Note</DialogTitle>
          <DialogContent>
            <TextField fullWidth select label="Select Shipped Purchase Order" value={formik.values.purchaseOrder} onChange={(e) => handlePoSelect(e.target.value)} margin="normal">
              {pos.map((po) => <MenuItem key={po._id} value={po._id}>{po.orderNumber} - {po.supplier?.name}</MenuItem>)}
            </TextField>
            {selectedPo && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Items to Receive</Typography>
                {formik.values.items.map((item, index) => (
                  <Grid container spacing={1} key={index} sx={{ mb: 1 }}>
                    <Grid item xs={4}><TextField fullWidth size="small" label="Product" value={item.product} disabled /></Grid>
                    <Grid item xs={3}><TextField fullWidth size="small" label="Ordered" type="number" value={item.orderedQuantity} disabled /></Grid>
                    <Grid item xs={3}><TextField fullWidth size="small" label="Receiving" type="number" value={item.receivedQuantity} onChange={(e) => { const newItems = [...formik.values.items]; newItems[index].receivedQuantity = parseInt(e.target.value, 10) || 0; formik.setFieldValue('items', newItems); }} inputProps={{ min: 0 }} /></Grid>
                    <Grid item xs={2}><TextField fullWidth size="small" label="Price" type="number" value={item.unitPrice} disabled /></Grid>
                  </Grid>
                ))}
                <TextField fullWidth label="Notes" name="notes" value={formik.values.notes} onChange={formik.handleChange} margin="normal" multiline rows={2} />
              </>
            )}
          </DialogContent>
          <DialogActions><Button onClick={() => { setModalOpen(false); }}>Cancel</Button><Button type="submit" variant="contained" disabled={submitting || !formik.values.purchaseOrder}>{submitting ? <CircularProgress size={20} /> : 'Create GRN'}</Button></DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default GrnPage;