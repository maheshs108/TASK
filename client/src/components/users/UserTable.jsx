import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserStatusChip from './UserStatusChip';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function UserTable({ rows, pagination, onPageChange, onRowsPerPageChange, onDelete }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleMenuOpen = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const handleView = () => {
    if (selectedUserId) {
      navigate(`/users/${selectedUserId}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedUserId) {
      navigate(`/users/${selectedUserId}/edit`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedUserId) {
      onDelete(selectedUserId);
    }
    handleMenuClose();
  };

  const page = (pagination?.page || 1) - 1;
  const rowsPerPage = pagination?.limit || 5;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>FullName</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Profile</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No users found.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row, index) => (
              <TableRow key={row._id} hover>
                <TableCell>{(pagination.page - 1) * pagination.limit + index + 1}</TableCell>
                <TableCell>{`${row.firstName} ${row.lastName}`}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.gender?.charAt(0)}</TableCell>
                <TableCell>
                  <UserStatusChip status={row.status} />
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/users/${row._id}`)}
                  >
                    <Avatar
                      src={
                        row.profileImage
                          ? `${API_BASE_URL}/uploads/${row.profileImage}`
                          : undefined
                      }
                      alt={row.firstName}
                      sx={{ width: 28, height: 28 }}
                    />
                    <Typography variant="body2" color="primary">
                      View
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, row._id)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={pagination?.total || 0}
        page={page}
        onPageChange={(event, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[5, 10, 20]}
      />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleView}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> View
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Paper>
  );
}

export default UserTable;

