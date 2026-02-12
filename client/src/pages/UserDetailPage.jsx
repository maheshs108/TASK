import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import NotificationSnackbar from '../components/feedback/NotificationSnackbar';
import { fetchUserById } from '../services/api';
import UserStatusChip from '../components/users/UserStatusChip';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function UserDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState({ open: false, severity: 'success', message: '' });

  const showNotification = (severity, message) => {
    setNotif({ open: true, severity, message });
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await fetchUserById(id);
        setUser(result.data);
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to load user';
        showNotification('error', message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const profileUrl = user.profileImage ? `${API_BASE_URL}/uploads/${user.profileImage}` : undefined;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">User Details</Typography>
      </Box>

      <Card sx={{ maxWidth: 800, mx: 'auto', borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={profileUrl}
              alt={fullName}
              sx={{ width: 80, height: 80, mb: 1 }}
            />
            <Typography variant="h6">{fullName}</Typography>
            <UserStatusChip status={user.status} />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Mobile
              </Typography>
              <Typography variant="body1">{user.mobile}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Gender
              </Typography>
              <Typography variant="body1">{user.gender}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body1">{user.location}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body1">
                {new Date(user.createdAt).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Updated At
              </Typography>
              <Typography variant="body1">
                {new Date(user.updatedAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <NotificationSnackbar
        open={notif.open}
        severity={notif.severity}
        message={notif.message}
        onClose={() => setNotif((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
}

export default UserDetailPage;

