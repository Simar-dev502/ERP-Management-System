import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axios';

const useApi = (urlPattern) => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await axiosInstance.get(urlPattern, { params });
      setData(res.data);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 0);
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch data';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [urlPattern]);

  const fetchOne = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data: res } = await axiosInstance.get(`${urlPattern}/${id}`);
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [urlPattern]);

  const create = useCallback(async (body) => {
    try {
      const { data: res } = await axiosInstance.post(urlPattern, body);
      toast.success('Created successfully');
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
      throw err;
    }
  }, [urlPattern]);

  const update = useCallback(async (id, body) => {
    try {
      const { data: res } = await axiosInstance.put(`${urlPattern}/${id}`, body);
      toast.success('Updated successfully');
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
      throw err;
    }
  }, [urlPattern]);

  const remove = useCallback(async (id) => {
    try {
      await axiosInstance.delete(`${urlPattern}/${id}`);
      toast.success('Deleted successfully');
      setData((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
      throw err;
    }
  }, [urlPattern]);

  return { data, total, totalPages, loading, error, fetchAll, fetchOne, create, update, remove };
};

export default useApi;