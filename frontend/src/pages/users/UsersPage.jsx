import { useState, useEffect, useCallback } from 'react';
import {
  Box, Chip, IconButton, Tooltip, TextField, InputAdornment, MenuItem, Select,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Search as SearchIcon, Block as BlockIcon, CheckCircle as ActiveIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';

const roleColors = { admin: 'error', sales: 'primary', purchase: 'warning', inventory: 'success' };

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { limit: 100 };
      if (search) params.search = search;
      const { data } = await axiosInstance.get('/users', { params });
      setUsers(data.data); setTotal(data.total);
    } catch (err) { setError(err.response?.data?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (id, role) => {
    try { await axiosInstance.put(`/users/${id}/role`, { role }); toast.success('Role updated'); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to update role'); }
  };

  const handleToggleActive = async (id) => {
    try { await axiosInstance.put(`/users/${id}/toggle-active`); toast.success('Status toggled'); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to toggle status'); }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    {
      field: 'role', headerName: 'Role', width: 140,
      renderCell: (params) => (
        <Select size="small" value={params.row.role} onChange={(e) => handleRoleChange(params.row._id, e.target.value)} sx={{ '& .MuiSelect-select': { py: 0.5 } }}>
          {['admin', 'sales', 'purchase', 'inventory'].map((r) => (<MenuItem key={r} value={r}><Chip label={r} size="small" color={roleColors[r]} /></MenuItem>))}
        </Select>
      ),
    },
    {
      field: 'isActive', headerName: 'Status', width: 100,
      renderCell: (params) => (
        <Chip icon={params.value ? <ActiveIcon /> : <BlockIcon />} label={params.value ? 'Active' : 'Inactive'} color={params.value ? 'success' : 'default'} size="small" />
      ),
    },
    {
      field: 'actions', headerName: 'Actions', width: 100, sortable: false,
      renderCell: (params) => (
        <Tooltip title={params.row.isActive ? 'Deactivate' : 'Activate'}>
          <IconButton size="small" color={params.row.isActive ? 'error' : 'success'} onClick={() => handleToggleActive(params.row._id)}>
            {params.row.isActive ? <BlockIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader title="User Management" subtitle="Manage users, roles, and account status" />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField size="small" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ minWidth: 280 }} />
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ height: 520, width: '100%' }}>
        <DataGrid rows={users} columns={columns} getRowId={(r) => r._id} loading={loading} rowCount={total} pageSizeOptions={[10, 25, 50]} paginationMode="client" disableRowSelectionOnClick sx={{ borderRadius: 2, bgcolor: 'background.paper' }} />
      </Box>
    </Box>
  );
};

export default UsersPage;