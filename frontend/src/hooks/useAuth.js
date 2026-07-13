import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, register, logout, getMe, clearError } from '../features/auth/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const handleLogin = async (credentials) => {
    const result = await dispatch(login(credentials));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(`Welcome back, ${result.payload.name}!`);
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Login failed');
    }
    return result;
  };

  const handleRegister = async (userData) => {
    const result = await dispatch(register(userData));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
    return result;
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const fetchMe = async () => {
    const result = await dispatch(getMe());
    if (result.meta.requestStatus === 'rejected') {
      handleLogout();
    }
    return result;
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    fetchMe,
    clearError: () => dispatch(clearError()),
    hasRole,
  };
};

export default useAuth;