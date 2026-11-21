import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { SavedJobsPage } from './pages/SavedJobsPage';
import { ImportPage } from './pages/ImportPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="jobs/:id" element={<JobDetailsPage />} />
            <Route
              path="saved"
              element={
                <ProtectedRoute>
                  <SavedJobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="import"
              element={
                <ProtectedRoute>
                  <ImportPage />
                </ProtectedRoute>
              }
            />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
