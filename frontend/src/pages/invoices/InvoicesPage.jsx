import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Chip, IconButton, Tooltip, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert, Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, PictureAsPdf as PdfIcon, Search as SearchIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axiosInstance from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import * as yup from 'yup';

const statusColors = { paid: 'success', unpaid: 'warning', overdue: 'error', cancelled: 'default' };

const InvoicesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const canWrite = user && ['admin', 'sales'].includes(user.role);

  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [salesOrders, setSalesOrders] = useState([]);

  const fetchInvoices = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { page: page + 1, limit: pageSize, sort: '-createdAt' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await axiosInstance.get('/invoices', { params });
      setInvoices(data.data); setTotal(data.total);
    } catch (err) { setError(err.response?.data?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const openAdd = async () => {
    try {
      const { data } = await axiosInstance.get('/sales-orders', { params: { limit: 200 } });
      setSalesOrders(data.data);
      formik.resetForm();
      setModalOpen(true);
    } catch { toast.error('Failed to load sales orders'); }
  };

  const formik = useFormik({
    initialValues: { salesOrder: '', taxRate: 0, dueDate: '', notes: '' },
    onSubmit: async (values, { resetForm }) => {
      setSubmitting(true);
      try {
        await axiosInstance.post('/invoices', values);
        toast.success('Invoice created');
        resetForm(); setModalOpen(false); fetchInvoices();
      } catch (err) { toast.error(err.response?.data?.message || 'Failed to create'); }
      finally { setSubmitting(false); }
    },
  });

  const generatePdf = async (invoice) => {
    try {
      const { data } = await axiosInstance.get(`/invoices/${invoice._id}`);
      const inv = data.data;
      const doc = new jsPDF();
      doc.setFontSize(20); doc.text('INVOICE', 14, 20);
      doc.setFontSize(10);
      doc.text(`Invoice #: ${inv.invoiceNumber}`, 14, 30);
      doc.text(`Date: ${new Date(inv.createdAt).toLocaleDateString()}`, 14, 36);
      doc.text(`Customer: ${inv.customer?.name || 'N/A'}`, 14, 42);
      doc.text(`GST: ${inv.customer?.gstNo || 'N/A'}`, 14, 48);
      doc.text(`Status: ${inv.status.toUpperCase()}`, 14, 54);
      const rows = inv.items.map((item, i) => [i + 1, item.description || item.product?.title || 'Item', item.quantity, `₹${item.price.toFixed(2)}`, `₹${(item.quantity * item.price).toFixed(2)}`]);
      doc.autoTable({ startY: 60, head: [['#', 'Description', 'Qty', 'Price', 'Total']], body: rows });
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.text(`Subtotal: ₹${inv.subtotal?.toFixed(2)}`, 14, finalY);
      doc.text(`Tax (${inv.taxRate}%): ₹${inv.taxAmount?.toFixed(2)}`, 14, finalY + 6);
      doc.setFontSize(14); doc.text(`Total: ₹${inv.totalAmount?.toFixed(2)}`, 14, finalY + 14);
      doc.save(`invoice-${inv.invoiceNumber}.pdf`);
    } catch { toast.error('Failed to generate PDF'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await axiosInstance.put(`/invoices/${id}/status`, { status }); toast.success('Status updated'); fetchInvoices(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const columns = [
    { field: 'invoiceNumber', headerName: 'Invoice #', width: 160 },
    { field: 'customer', headerName: 'Customer', flex: 1, valueGetter: (p) => p.row.customer?.name || '—' },
    { field: 'totalAmount', headerName: 'Amount', width: 110, type: 'number', valueFormatter: (v) => `₹${v?.toFixed(2)}` },
    {
      field: 'status', headerName: 'Status', width: 120,
      renderCell: (params) => (
        <Select size="small" value={params.row.status} onChange={(e) => handleStatusUpdate(params.row._id, e.target.value)} sx={{ '& .MuiSelect-select': { py: 0.5 } }} disabled={!canWrite}>
          {['paid', 'unpaid', 'overdue', 'cancelled'].map((s) => (<MenuItem key={s} value={s}><Chip label={s} size="small" color={statusColors[s]} /></MenuItem>))}
        </Select>
      ),
    },
    { field: 'createdAt', headerName: 'Date', width: 110, valueFormatter: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    {
      field: 'actions', headerName: 'Actions', width: 100, sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="Download PDF"><IconButton size="small" color="primary" onClick={() => generatePdf(p.row)}><PdfIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader title="Invoices" subtitle="Manage customer invoices" onAdd={canWrite ? openAdd : undefined} addLabel="New Invoice" />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField size="small" placeholder="Search invoices..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ minWidth: 280 }} />
        <FormControl size="small" sx={{ minWidth: 140 }}><InputLabel>Status</InputLabel><Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}><MenuItem value="">All</MenuItem>{['paid', 'unpaid', 'overdue', 'cancelled'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></FormControl>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ height: 520, width: '100%' }}>
        <DataGrid rows={invoices} columns={columns} getRowId={(r) => r._id} loading={loading} rowCount={total} pageSizeOptions={[5, 10, 25, 50]} paginationModel={{ page, pageSize }} onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }} paginationMode="server" disableRowSelectionOnClick sx={{ borderRadius: 2, bgcolor: 'background.paper' }} />
      </Box>
      <Dialog open={modalOpen} onClose={() => { setModalOpen(false); }} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Create Invoice from Sales Order</DialogTitle>
          <DialogContent>
            <TextField fullWidth select label="Sales Order" name="salesOrder" value={formik.values.salesOrder} onChange={formik.handleChange} margin="normal">
              {salesOrders.map((so) => <MenuItem key={so._id} value={so._id}>{so.orderNumber} - {so.customer?.name} (₹{so.totalPrice?.toFixed(2)})</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Tax Rate (%)" name="taxRate" type="number" value={formik.values.taxRate} onChange={formik.handleChange} margin="normal" inputProps={{ min: 0, max: 100 }} />
            <TextField fullWidth label="Due Date" name="dueDate" type="date" value={formik.values.dueDate} onChange={formik.handleChange} margin="normal" InputLabelProps={{ shrink: true }} />
            <TextField fullWidth label="Notes" name="notes" value={formik.values.notes} onChange={formik.handleChange} margin="normal" multiline rows={2} />
          </DialogContent>
          <DialogActions><Button onClick={() => { setModalOpen(false); }}>Cancel</Button><Button type="submit" variant="contained" disabled={submitting}>{submitting ? <CircularProgress size={20} /> : 'Create Invoice'}</Button></DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default InvoicesPage;