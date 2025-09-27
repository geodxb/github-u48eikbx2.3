import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useSystemControls } from './hooks/useSystemControls';
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';
import FunctionalityGuard from './components/common/FunctionalityGuard';
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
  const { systemSettings, isPageAllowed, getRestrictionMessage } = useSystemControls();
  const navigate = useNavigate();
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

  // Check if current page is allowed during restricted mode
  if (user && user.role !== 'governor' && systemSettings?.systemControls?.restrictedMode && !isPageAllowed(location.pathname)) {
    return (
      <FunctionalityGuard 
        functionality="apiAccess"
        fallbackMessage={`Platform access has been restricted by the Governor. ${getRestrictionMessage()}`}
      >
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-300 shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 border border-red-300 rounded-lg flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
            ACCESS RESTRICTED
          </h1>
          <p className="text-gray-700 mb-6 uppercase tracking-wide text-sm font-medium">
            {getRestrictionMessage()}
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-red-800 mb-2 uppercase tracking-wide">SYSTEM STATUS</h4>
            <div className="text-left text-sm space-y-1">
              <p className="text-red-700">• Withdrawals: {isWithdrawalsEnabled() ? 'ENABLED' : 'DISABLED'}</p>
              <p className="text-red-700">• Messaging: {isMessagingEnabled() ? 'ENABLED' : 'DISABLED'}</p>
              <p className="text-red-700">• Trading: {isTradingEnabled() ? 'ENABLED' : 'DISABLED'}</p>
              <p className="text-red-700">• Reports: {isReportingEnabled() ? 'ENABLED' : 'DISABLED'}</p>
              <p className="text-red-700">• Login: {isLoginEnabled() ? 'ENABLED' : 'DISABLED'}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(user.role === 'governor' ? '/governor' : '/admin')}
            className="px-6 py-3 bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors rounded-lg uppercase tracking-wide"
          >
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
      </FunctionalityGuard>
    );
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

