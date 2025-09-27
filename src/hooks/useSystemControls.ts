import { useState, useEffect } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { SystemSettings } from '../types/user';

export const useSystemControls = () => {
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔧 useSystemControls: Setting up real-time listener for systemSettings/main...');
    // Set up real-time listener for system settings
    
    const unsubscribe = FirestoreService.subscribeToSystemSettings((settings) => {
      console.log('🔧 System controls updated from Firebase:', {
        maintenanceMode: settings?.maintenanceMode,
        systemControls: settings?.systemControls,
        restrictionLevel: settings?.systemControls?.restrictionLevel,
        updatedBy: settings?.updatedBy,
        updatedAt: settings?.updatedAt
      });
      setSystemSettings(settings);
      setLoading(false);
      setError(null);
    });

    // Cleanup listener on unmount
    return () => {
      console.log('🔄 Cleaning up system controls listener');
      unsubscribe();
    };
  }, []);

  // Helper functions to check specific restrictions
  const isWithdrawalsEnabled = () => {
    const enabled = systemSettings?.systemControls?.withdrawalsEnabled !== false;
    console.log('🔧 isWithdrawalsEnabled check:', enabled, 'Firebase value:', systemSettings?.systemControls?.withdrawalsEnabled);
    return enabled;
  };

  const isMessagingEnabled = () => {
    const enabled = systemSettings?.systemControls?.messagingEnabled !== false;
    console.log('🔧 isMessagingEnabled check:', enabled, 'Firebase value:', systemSettings?.systemControls?.messagingEnabled);
    return enabled;
  };

  const isProfileUpdatesEnabled = () => {
    const enabled = systemSettings?.systemControls?.profileUpdatesEnabled !== false;
    console.log('🔧 isProfileUpdatesEnabled check:', enabled, 'Firebase value:', systemSettings?.systemControls?.profileUpdatesEnabled);
    return enabled;
  };

  const isLoginEnabled = () => {
    const enabled = systemSettings?.systemControls?.loginEnabled !== false;
    console.log('🔧 isLoginEnabled check:', enabled, 'Firebase value:', systemSettings?.systemControls?.loginEnabled);
    return enabled;
  };

  const isTradingEnabled = () => {
    const enabled = systemSettings?.systemControls?.tradingEnabled !== false;
    console.log('🔧 isTradingEnabled check:', enabled, 'Firebase value:', systemSettings?.systemControls?.tradingEnabled);
    return enabled;
  };

  const isDepositsEnabled = () => {
    const enabled = systemSettings?.systemControls?.depositsEnabled !== false;
    console.log('🔧 isDepositsEnabled check:', enabled, 'Firebase value:', systemSettings?.systemControls?.depositsEnabled);
    return enabled;
  };

  const isReportingEnabled = () => {
    const enabled = systemSettings?.systemControls?.reportingEnabled !== false;
    console.log('🔧 isReportingEnabled check:', enabled, 'Firebase value:', systemSettings?.systemControls?.reportingEnabled);
    return enabled;
  };

  const isAccountCreationEnabled = () => {
    const enabled = systemSettings?.systemControls?.accountCreationEnabled !== false;
    console.log('🔧 isAccountCreationEnabled check:', enabled, 'Firebase value:', systemSettings?.systemControls?.accountCreationEnabled);
    return enabled;
  };

  const isSupportTicketsEnabled = () => {
    const enabled = systemSettings?.systemControls?.supportTicketsEnabled !== false;
    console.log('🔧 isSupportTicketsEnabled check:', enabled, 'Firebase value:', systemSettings?.systemControls?.supportTicketsEnabled);
    return enabled;
  };

  const isDataExportEnabled = () => {
    const enabled = systemSettings?.systemControls?.dataExportEnabled !== false;
    console.log('🔧 isDataExportEnabled check:', enabled, 'Firebase value:', systemSettings?.systemControls?.dataExportEnabled);
    return enabled;
  };

  const isNotificationsEnabled = () => {
    const enabled = systemSettings?.systemControls?.notificationsEnabled !== false;
    console.log('🔧 isNotificationsEnabled check:', enabled, 'Firebase value:', systemSettings?.systemControls?.notificationsEnabled);
    return enabled;
  };

  const isApiAccessEnabled = () => {
    const enabled = systemSettings?.systemControls?.apiAccessEnabled !== false;
    console.log('🔧 isApiAccessEnabled check:', enabled, 'Firebase value:', systemSettings?.systemControls?.apiAccessEnabled);
    return enabled;
  };

  const isPageAllowed = (pagePath: string) => {
    // Always allow Governor pages regardless of restrictions
    if (pagePath.startsWith('/governor')) {
      return true;
    }
    
    // If restricted mode is not active, allow all pages
    if (!systemSettings?.systemControls?.restrictedMode) {
      return true;
    }
    
    // If restricted mode is active, check allowed pages
    const allowedPages = systemSettings.systemControls.allowedPages || [];
    
    // If no allowed pages specified during restriction, block everything except Governor
    if (allowedPages.length === 0) {
      return false;
    }
    
    return allowedPages.some(allowedPath => 
      pagePath.startsWith(allowedPath) || 
      (allowedPath.endsWith('/*') && pagePath.startsWith(allowedPath.slice(0, -2)))
    );
  };

  const getRestrictionMessage = () => {
    return systemSettings?.systemControls?.restrictionReason || 'This functionality is currently restricted.';
  };

  const getRestrictionLevel = () => {
    return systemSettings?.systemControls?.restrictionLevel || 'none';
  };

  return {
    systemSettings,
    loading,
    error,
    isWithdrawalsEnabled,
    isMessagingEnabled,
    isProfileUpdatesEnabled,
    isLoginEnabled,
    isTradingEnabled,
    isDepositsEnabled,
    isReportingEnabled,
    isAccountCreationEnabled,
    isSupportTicketsEnabled,
    isDataExportEnabled,
    isNotificationsEnabled,
    isApiAccessEnabled,
    isPageAllowed,
    getRestrictionMessage,
    getRestrictionLevel
  };
};