import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Box, Paper, Typography, TextField, Button, Alert, CircularProgress,
  MenuItem,
} from '@mui/material';
import { register } from '../../features/auth/authSlice';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'sales' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(formData));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Create Account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} margin="normal" required />
            <TextField fullWidth select label="Role" name="role" value={formData.role} onChange={handleChange} margin="normal">
              <MenuItem value="sales">Sales</MenuItem>
              <MenuItem value="purchase">Purchase</MenuItem>
              <MenuItem value="inventory">Inventory</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <Button type="submit" fullWidth variant="contained" size="large" disabled={isLoading} sx={{ mt: 2, mb: 2 }}>
              {isLoading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </form>

          <Typography variant="body2" align="center">
            Already have an account? <Link to="/login">Sign In</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;