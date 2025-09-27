import { useState, useEffect } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { SystemSettings } from '../types/user';

export const useSystemControls = () => {
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up real-time listener for system settings
    console.log('🔄 Setting up real-time listener for system controls...');
    
    const unsubscribe = FirestoreService.subscribeToSystemSettings((settings) => {
      console.log('🔄 System controls updated:', settings?.systemControls);
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
    return systemSettings?.systemControls?.withdrawalsEnabled !== false;
  };

  const isMessagingEnabled = () => {
    return systemSettings?.systemControls?.messagingEnabled !== false;
  };

  const isProfileUpdatesEnabled = () => {
    return systemSettings?.systemControls?.profileUpdatesEnabled !== false;
  };

  const isLoginEnabled = () => {
    return systemSettings?.systemControls?.loginEnabled !== false;
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