import { useEffect, useState } from 'react';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import UserForm from '../components/users/UserForm';
import NotificationSnackbar from '../components/feedback/NotificationSnackbar';
import { createUser, fetchUserById, updateUser } from '../services/api';

function UserFormPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [notif, setNotif] = useState({ open: false, severity: 'success', message: '' });

  const showNotification = (severity, message) => {
    setNotif({ open: true, severity, message });
  };

  useEffect(() => {
    const loadUser = async () => {
      if (mode === 'edit' && id) {
        try {
          setLoading(true);
          const result = await fetchUserById(id);
          setInitialValues(result.data);
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to load user';
          showNotification('error', message);
        } finally {
          setLoading(false);
        }
      } else {
        setInitialValues({});
      }
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mode]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      if (mode === 'edit' && id) {
        await updateUser(id, formData);
        showNotification('success', 'User updated successfully');
      } else {
        await createUser(formData);
        showNotification('success', 'User created successfully');
      }
      setTimeout(() => navigate('/users'), 500);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save user';
      showNotification('error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">
          {mode === 'edit' ? 'Edit User Details' : 'Add User Details'}
        </Typography>
      </Box>

      {loading || !initialValues ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <UserForm initialValues={initialValues} mode={mode} onSubmit={handleSubmit} submitting={submitting} />
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

export default UserFormPage;

