import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import UserListPage from './pages/UserListPage';
import UserFormPage from './pages/UserFormPage';
import UserDetailPage from './pages/UserDetailPage';
import AppLayout from './components/layout/AppLayout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7b1f24', // maroon-ish similar to design
    },
    secondary: {
      main: '#1976d2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/users" replace />} />
          <Route path="/users" element={<UserListPage />} />
          <Route path="/users/new" element={<UserFormPage mode="create" />} />
          <Route path="/users/:id/edit" element={<UserFormPage mode="edit" />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="*" element={<Navigate to="/users" replace />} />
        </Routes>
      </AppLayout>
    </ThemeProvider>
  );
}

export default App;
