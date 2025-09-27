import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';
// Removed: import ShadowBanCheck from './components/investor/ShadowBanCheck'; // Removed investor-specific component
import ProtectedRoute from './components/auth/ProtectedRoute';
import PinEntryScreen from './pages/auth/PinEntryScreen';

// Auth pages
import AdminLogin from './pages/auth/AdminLogin';
// Removed: import AffiliateLogin from './pages/auth/AffiliateLogin'; // Removed investor-specific login

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import InvestorsListPage from './pages/admin/InvestorsList';
import InvestorProfile from './pages/admin/InvestorProfile';
import WithdrawalsPage from './pages/admin/WithdrawalsPage';
import CommissionsPage from './pages/admin/CommissionsPage';
import SettingsPage from './pages/admin/SettingsPage';
import MessagesPage from './pages/admin/MessagesPage';
import EnhancedMessagesPage from './pages/admin/EnhancedMessagesPage';

// Removed: Investor pages
// Removed: import InvestorDashboard from './pages/investor/Dashboard'; // Removed investor-specific page

// Governor pages
import GovernorDashboard from './pages/governor/Dashboard';
import GovernorInvestorsPage from './pages/governor/InvestorsPage';
import GovernorInvestorProfile from './pages/governor/InvestorProfile';
import GovernorWithdrawalsPage from './pages/governor/WithdrawalsPage';
import GovernorAccountManagementPage from './pages/governor/AccountManagementPage';
import GovernorDeletionApprovalsPage from './pages/governor/DeletionApprovalsPage';
import GovernorMessagesPage from './pages/governor/MessagesPage';
import GovernorEnhancedMessagesPage from './pages/governor/EnhancedMessagesPage';
import GovernorConfigPage from './pages/governor/ConfigPage';
import GovernorSecurityPage from './pages/governor/SecurityPage';
import GovernorLogsPage from './pages/governor/LogsPage';
import GovernorSystemMonitoringPage from './pages/governor/SystemMonitoringPage';
import GovernorSystemControlsPage from './pages/governor/SystemControlsPage';
import GovernorDatabasePage from './pages/governor/DatabasePage';
import GovernorSupportTicketsPage from './pages/governor/SupportTicketsPage';
import AccountCreationRequests from './pages/governor/AccountCreationRequests';

function App() {
  const { user, isLoading } = useAuth();
  const [isPinAuthenticated, setIsPinAuthenticated] = useState(false);
  const [targetPath, setTargetPath] = useState<string>('/login');
  const location = useLocation();

  // Check PIN authentication on app load
  useEffect(() => {
    const pinAuth = sessionStorage.getItem('pin_authenticated');
    const redirectPath = sessionStorage.getItem('login_redirect_path');
    
    if (pinAuth === 'true') {
      setIsPinAuthenticated(true);
      if (redirectPath) {
        setTargetPath(redirectPath);
      }
    }
  }, []);

  const handlePinAuthenticated = (path?: string) => {
    setIsPinAuthenticated(true);
    if (path) {
      setTargetPath(path);
      window.location.href = path;
    }
  };

  // Show PIN entry screen if not authenticated
  if (!isPinAuthenticated) {
    return <PinEntryScreen onAuthenticated={handlePinAuthenticated} />;
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <ErrorBoundary 
        fallbackTitle="MESSAGING SYSTEM ERROR"
        fallbackMessage="The messaging interface encountered an error and needs to be reloaded"
      >
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<AdminLogin />} />
          {/* Removed: <Route path="/affiliate-login" element={<AffiliateLogin />} /> */}
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/investors" element={
            <ProtectedRoute role="admin">
              <InvestorsListPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/investor/:id" element={
            <ProtectedRoute role="admin">
              <InvestorProfile />
            </ProtectedRoute>
          } />
          <Route path="/admin/withdrawals" element={
            <ProtectedRoute role="admin">
              <WithdrawalsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/commissions" element={
            <ProtectedRoute role="admin">
              <CommissionsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute role="admin">
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/messages" element={
            <ProtectedRoute role="admin">
              <ErrorBoundary fallbackTitle="MESSAGING ERROR" fallbackMessage="The messaging system encountered an error">
                <EnhancedMessagesPage />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Removed: Investor Routes */}
          {/* Removed: <Route path="/investor" element={
            <ProtectedRoute role="investor">
              <ShadowBanCheck>
                <InvestorDashboard />
              </ShadowBanCheck>
            </ProtectedRoute>
          } /> */}
          {/* Removed: <Route path="/investor/messages" element={
            <ProtectedRoute role="investor">
              <ShadowBanCheck>
                <MessagesPage />
              </ShadowBanCheck>
            </ProtectedRoute>
          } /> */}
          
          {/* Governor Routes */}
          <Route path="/governor" element={
            <ProtectedRoute role="governor">
              <GovernorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/governor/investors" element={
            <ProtectedRoute role="governor">
              <GovernorInvestorsPage />
            </ProtectedRoute>
          } />
          <Route path="/governor/investor/:id" element={
            <ProtectedRoute role="governor">
              <GovernorInvestorProfile />
            </ProtectedRoute>
          } />
          <Route path="/governor/withdrawals" element={
            <ProtectedRoute role="governor">
              <GovernorWithdrawalsPage />
            </ProtectedRoute>
          } />
          <Route path="/governor/account-management" element={
            <ProtectedRoute role="governor">
              <GovernorAccountManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/governor/deletion-approvals" element={
            <ProtectedRoute role="governor">
              <GovernorDeletionApprovalsPage />
            </ProtectedRoute>
          } />
          <Route path="/governor/messages" element={
            <ProtectedRoute role="governor">
              <ErrorBoundary fallbackTitle="GOVERNOR MESSAGING ERROR" fallbackMessage="The governor messaging system encountered an error">
                <GovernorEnhancedMessagesPage />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/governor/config" element={
            <ProtectedRoute role="governor">
              <GovernorConfigPage />
            </ProtectedRoute>
          } />
          <Route path="/governor/security" element={
            <ProtectedRoute role="governor">
              <GovernorSecurityPage />
            </ProtectedRoute>
          } />
          <Route path="/governor/logs" element={
            <ProtectedRoute role="governor">
              <GovernorLogsPage />
            </ProtectedRoute>
          } />
          <Route path="/governor/system-monitoring" element={
            <ProtectedRoute role="governor">
              <GovernorSystemMonitoringPage />
            </ProtectedRoute>
          } />
          <Route path="/governor/system-controls" element={
            <ProtectedRoute role="governor">
              <GovernorSystemControlsPage />
            </ProtectedRoute>
          } />
          <Route path="/governor/database" element={
            <ProtectedRoute role="governor">
              <GovernorDatabasePage />
            </ProtectedRoute>
          } />
          <Route path="/governor/support-tickets" element={
            <ProtectedRoute role="governor">
              <GovernorSupportTicketsPage />
            </ProtectedRoute>
          } />
          <Route path="/governor/account-requests" element={
            <ProtectedRoute role="governor">
              <AccountCreationRequests />
            </ProtectedRoute>
          } />
          
          {/* Default redirects */}
          <Route path="/" element={
            user ? (
              <Navigate to={
                user.role === 'governor' ? '/governor' :
                user.role === 'admin' ? '/admin' : '/login' // Changed: Removed investor redirect
              } replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default App;

