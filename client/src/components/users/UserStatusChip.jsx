import { Chip } from '@mui/material';

function UserStatusChip({ status }) {
  const isActive = status === 'Active';

  return (
    <Chip
      label={status}
      color={isActive ? 'success' : 'default'}
      size="small"
      variant={isActive ? 'filled' : 'outlined'}
      sx={{ fontWeight: 500 }}
    />
  );
}

export default UserStatusChip;

