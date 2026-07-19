import { useFormik } from 'formik';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Box, Paper, Typography, TextField, Button, Alert, CircularProgress,
  MenuItem,
} from '@mui/material';
import useAuth from '../../hooks/useAuth';
import { registerSchema } from '../../utils/validationSchemas';

const RegisterPage = () => {
  const { register, isLoading, error, clearError } = useAuth();

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', role: 'sales' },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      await register(values);
      setSubmitting(false);
    },
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              margin="normal"
            />
            <TextField
              fullWidth
              select
              label="Role"
              name="role"
              value={formik.values.role}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.role && Boolean(formik.errors.role)}
              helperText={formik.touched.role && formik.errors.role}
              margin="normal"
            >
              <MenuItem value="sales">Sales</MenuItem>
              <MenuItem value="purchase">Purchase</MenuItem>
              <MenuItem value="inventory">Inventory</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading || formik.isSubmitting}
              sx={{ mt: 2, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </form>

          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <RouterLink to="/login" onClick={clearError}>
              Sign In
            </RouterLink>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;