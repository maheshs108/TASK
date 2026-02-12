import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/PersonAdd';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import UserTable from '../components/users/UserTable';
import NotificationSnackbar from '../components/feedback/NotificationSnackbar';
import { deleteUser, exportUsersToCsv, fetchUsers } from '../services/api';

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, pages: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ open: false, severity: 'success', message: '' });

  const navigate = useNavigate();

  const showNotification = (severity, message) => {
    setNotif({ open: true, severity, message });
  };

  const loadUsers = async ({ page = pagination.page, limit = pagination.limit, search = searchTerm } = {}) => {
    try {
      setLoading(true);
      const result = await fetchUsers({ page, limit, search });
      setUsers(result.data);
      setPagination(result.pagination);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load users';
      showNotification('error', message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers({ page: 1, limit: pagination.limit, search: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    loadUsers({ page: 1, limit: pagination.limit, search: searchTerm });
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      showNotification('success', 'User deleted successfully');
      loadUsers();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user';
      showNotification('error', message);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">User Management</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            size="small"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
            }}
          />
          <Button variant="contained" color="primary" onClick={handleSearch}>
            Search
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/users/new')}
          >
            Add User
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={() => exportUsersToCsv(searchTerm)}
          >
            Export To CSV
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <UserTable
          rows={users}
          pagination={pagination}
          onPageChange={(page) => loadUsers({ page })}
          onRowsPerPageChange={(limit) => loadUsers({ page: 1, limit })}
          onDelete={handleDelete}
        />
      )}

      <NotificationSnackbar
        open={notif.open}
        severity={notif.severity}
        message={notif.message}
        onClose={() => setNotif((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
}

export default UserListPage;

