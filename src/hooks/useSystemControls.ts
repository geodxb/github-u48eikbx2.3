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

  const isPageAllowed = (pagePath: string) => {
    // If restricted mode is not active, allow all pages
    if (!systemSettings?.systemControls?.restrictedMode) {
      return true;
    }
    
    // If restricted mode is active but no specific pages are restricted, allow all pages
    if (!systemSettings.systemControls.allowedPages || systemSettings.systemControls.allowedPages.length === 0) {
      return true;
    }
    
    const allowedPages = systemSettings.systemControls.allowedPages || [];
    return allowedPages.some(allowedPath => pagePath.startsWith(allowedPath));
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
    isPageAllowed,
    getRestrictionMessage,
    getRestrictionLevel
  };
};