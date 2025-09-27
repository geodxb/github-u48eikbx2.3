import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FirestoreService } from '../../services/firestoreService';
import { SystemSettings } from '../../types/user';

interface GovernorTerminalControlProps {
  onClose?: () => void;
}

const GovernorTerminalControl = ({ onClose }: GovernorTerminalControlProps) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([
    'Interactive Brokers Governor Control Terminal v3.0.0',
    'Copyright (c) 2025 Interactive Brokers LLC',
    'All rights reserved.',
    '',
    'Governor Control System initialized...',
    'Security protocols active...',
    'Awaiting authentication...',
    '',
    'Enter authentication code to access system controls:'
  ]);
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [restrictionConfig, setRestrictionConfig] = useState({
    withdrawalsEnabled: true,
    messagingEnabled: true,
    profileUpdatesEnabled: true,
    loginEnabled: true,
    tradingEnabled: true,
    depositsEnabled: true,
    reportingEnabled: true,
    supportTicketsEnabled: true,
    accountCreationEnabled: true,
    dataExportEnabled: true,
    notificationsEnabled: true,
    apiAccessEnabled: true,
    restrictedMode: false,
    allowedPages: [] as string[],
    restrictionReason: '',
    restrictionLevel: 'none' as 'none' | 'partial' | 'full'
  });
  const [newAllowedPage, setNewAllowedPage] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  useEffect(() => {
    loadSystemSettings();
  }, []);

  const loadSystemSettings = async () => {
    try {
      const settings = await FirestoreService.getSystemSettings();
      if (settings) {
        setSystemSettings(settings);
        setRestrictionConfig({
          withdrawalsEnabled: settings.systemControls?.withdrawalsEnabled ?? true,
          messagingEnabled: settings.systemControls?.messagingEnabled ?? true,
          profileUpdatesEnabled: settings.systemControls?.profileUpdatesEnabled ?? true,
          loginEnabled: settings.systemControls?.loginEnabled ?? true,
          tradingEnabled: settings.systemControls?.tradingEnabled ?? true,
          depositsEnabled: settings.systemControls?.depositsEnabled ?? true,
          reportingEnabled: settings.systemControls?.reportingEnabled ?? true,
          supportTicketsEnabled: settings.systemControls?.supportTicketsEnabled ?? true,
          accountCreationEnabled: settings.systemControls?.accountCreationEnabled ?? true,
          dataExportEnabled: settings.systemControls?.dataExportEnabled ?? true,
          notificationsEnabled: settings.systemControls?.notificationsEnabled ?? true,
          apiAccessEnabled: settings.systemControls?.apiAccessEnabled ?? true,
          restrictedMode: settings.systemControls?.restrictedMode ?? false,
          allowedPages: settings.systemControls?.allowedPages ?? [],
          restrictionReason: settings.systemControls?.restrictionReason ?? '',
          restrictionLevel: settings.systemControls?.restrictionLevel ?? 'none'
        });
      }
    } catch (error) {
      console.error('Error loading system settings:', error);
    }
  };

  const addToHistory = (text: string) => {
    setCommandHistory(prev => [...prev, text]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    addToHistory('> ' + input);
    
    if (!isAuthenticated) {
      if (input.trim() === 'governor2025') {
        await startAuthenticationSequence();
      } else {
        addToHistory('ERROR: Invalid authentication code');
        addToHistory('Access denied. Please enter the correct authentication code.');
        addToHistory('');
      }
    } else {
      await processCommand(input.trim());
    }
    
    setInput('');
  };

  const startAuthenticationSequence = async () => {
    const authMessages = [
      'Authentication successful...',
      '[AUTH] Verifying Governor credentials...',
      '[AUTH] RSA-4096 key validation... PASSED',
      '[SEC] Running SHA-512 hash verification...',
      '[SEC] Hash: b7f9f35426b927411fc9231b56382173eacdc...',
      'Code validation complete.',
      '[SYS] Initializing secure memory allocation...',
      '[SYS] malloc(8192) -> 0x7fff5fbff000',
      '',
      'Loading Governor control systems...',
      '[NET] Establishing encrypted channel...',
      '[NET] Cipher: AES-256-GCM, ECDHE-RSA-4096-GCM-SHA512',
      '[SEC] Certificate chain validation... OK',
      'Loading system configuration...',
      '[DB] SELECT * FROM system_settings WHERE governor_access=1',
      '[DB] Query executed in 0.012ms',
      '[CACHE] Loading system state from Redis...',
      'Loading platform controls...',
      '[API] GET /api/v3/governor/controls HTTP/2.0',
      '[API] Response: 200 OK (Content-Length: 4521)',
      '[JSON] Parsing control configuration...',
      '',
      'Governor Control System ready.',
      '[AUDIT] Logging Governor terminal access...',
      '[MONITOR] Enabling real-time system monitoring...',
      'Access granted.',
      '',
      '████████████████████████████████████████████████████████████',
      '█              GOVERNOR CONTROL TERMINAL                   █',
      '████████████████████████████████████████████████████████████',
      '',
      'Available commands:',
      '  governor-status           - Show current system status',
      '  governor-set-restriction  - Configure system restrictions',
      '  governor-emergency        - Emergency system controls',
      '  governor-maintenance      - Toggle maintenance mode',
      '  governor-help            - Show all available commands',
      '  exit                     - Exit terminal',
      '',
      'Type a command to continue:'
    ];

    for (let i = 0; i < authMessages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
      addToHistory(authMessages[i]);
    }

    setIsAuthenticated(true);
  };

  const processCommand = async (command: string) => {
    switch (command.toLowerCase()) {
      case 'governor-status':
        await showSystemStatus();
        break;
      case 'governor-set-restriction':
        await openRestrictionConfig();
        break;
      case 'governor-emergency':
        await showEmergencyControls();
        break;
      case 'governor-maintenance':
        await toggleMaintenanceMode();
        break;
      case 'governor-help':
        await showHelp();
        break;
      case 'exit':
        addToHistory('Terminating Governor Control session...');
        addToHistory('[AUDIT] Governor terminal session ended');
        addToHistory('[CLEANUP] Clearing secure memory...');
        addToHistory('Session terminated.');
        setTimeout(() => {
          if (onClose) onClose();
        }, 1000);
        break;
      case 'clear':
        
        // Navigate back to governor dashboard after a brief delay
        setTimeout(() => {
          window.location.href = '/governor';
        }, 1500);
          'Interactive Brokers Governor Control Terminal v3.0.0',
          'Governor Control System ready.',
          '',
          'Type a command to continue:'
        ]);
        break;
      default:
        addToHistory(`ERROR: Unknown command '${command}'`);
        addToHistory('Type "governor-help" for available commands.');
        addToHistory('');
    }
  };

  const showSystemStatus = async () => {
    addToHistory('');
    addToHistory('[SYSTEM] Fetching current system status...');
    addToHistory('[DB] SELECT * FROM system_settings...');
    addToHistory('[STATUS] System status retrieved');
    addToHistory('');
    addToHistory('=== CURRENT SYSTEM STATUS ===');
    addToHistory(`Maintenance Mode: ${systemSettings?.maintenanceMode ? 'ENABLED' : 'DISABLED'}`);
    addToHistory(`Withdrawals: ${restrictionConfig.withdrawalsEnabled ? 'ENABLED' : 'DISABLED'}`);
    addToHistory(`Messaging: ${restrictionConfig.messagingEnabled ? 'ENABLED' : 'DISABLED'}`);
    addToHistory(`Profile Updates: ${restrictionConfig.profileUpdatesEnabled ? 'ENABLED' : 'DISABLED'}`);
    addToHistory(`Login Access: ${restrictionConfig.loginEnabled ? 'ENABLED' : 'DISABLED'}`);
    addToHistory(`Trading System: ${restrictionConfig.tradingEnabled ? 'ENABLED' : 'DISABLED'}`);
    addToHistory(`Deposits: ${restrictionConfig.depositsEnabled ? 'ENABLED' : 'DISABLED'}`);
    addToHistory(`Reporting: ${restrictionConfig.reportingEnabled ? 'ENABLED' : 'DISABLED'}`);
    addToHistory(`Support Tickets: ${restrictionConfig.supportTicketsEnabled ? 'ENABLED' : 'DISABLED'}`);
    addToHistory(`Account Creation: ${restrictionConfig.accountCreationEnabled ? 'ENABLED' : 'DISABLED'}`);
    addToHistory(`Data Export: ${restrictionConfig.dataExportEnabled ? 'ENABLED' : 'DISABLED'}`);
    addToHistory(`Notifications: ${restrictionConfig.notificationsEnabled ? 'ENABLED' : 'DISABLED'}`);
    addToHistory(`API Access: ${restrictionConfig.apiAccessEnabled ? 'ENABLED' : 'DISABLED'}`);
    addToHistory(`Restricted Mode: ${restrictionConfig.restrictedMode ? 'ACTIVE' : 'INACTIVE'}`);
    addToHistory(`Restriction Level: ${restrictionConfig.restrictionLevel.toUpperCase()}`);
    if (restrictionConfig.restrictionReason) {
      addToHistory(`Restriction Reason: ${restrictionConfig.restrictionReason}`);
    }
    addToHistory('================================');
    addToHistory('');
  };

  const openRestrictionConfig = async () => {
    addToHistory('');
    addToHistory('[SYSTEM] Opening restriction configuration interface...');
    addToHistory('[GUI] Initializing control panel...');
    addToHistory('[SECURITY] Enabling Governor override mode...');
    addToHistory('Restriction configuration panel opened.');
    addToHistory('');
    setShowRestrictionModal(true);
  };

  const showEmergencyControls = async () => {
    addToHistory('');
    addToHistory('[EMERGENCY] Emergency control options:');
    addToHistory('  emergency-shutdown    - Complete platform shutdown');
    addToHistory('  emergency-lockdown    - Lock all user access');
    addToHistory('  emergency-restore     - Restore all functionality');
    addToHistory('  emergency-withdrawals - Disable withdrawals only');
    addToHistory('  emergency-messaging   - Disable messaging only');
    addToHistory('');
    addToHistory('Type emergency command or "governor-help" for main menu.');
    addToHistory('');
  };

  const toggleMaintenanceMode = async () => {
    if (!user || !systemSettings) return;
    
    addToHistory('');
    addToHistory('[MAINTENANCE] Toggling maintenance mode...');
    
    try {
      const newMaintenanceMode = !systemSettings.maintenanceMode;
      await FirestoreService.updateSystemSetting(
        'maintenanceMode',
        newMaintenanceMode,
        user.id,
        user.name,
        systemSettings.maintenanceMode
      );
      
      addToHistory(`[SUCCESS] Maintenance mode ${newMaintenanceMode ? 'ENABLED' : 'DISABLED'}`);
      addToHistory('[AUDIT] Maintenance mode change logged');
      await loadSystemSettings();
    } catch (error) {
      addToHistory('[ERROR] Failed to toggle maintenance mode');
      console.error('Error toggling maintenance mode:', error);
    }
    addToHistory('');
  };

  const showHelp = async () => {
    addToHistory('');
    addToHistory('=== GOVERNOR CONTROL COMMANDS ===');
    addToHistory('');
    addToHistory('SYSTEM STATUS:');
    addToHistory('  governor-status           - Show current system status');
    addToHistory('');
    addToHistory('RESTRICTION CONTROLS:');
    addToHistory('  governor-set-restriction  - Configure system restrictions');
    addToHistory('  governor-maintenance      - Toggle maintenance mode');
    addToHistory('');
    addToHistory('EMERGENCY CONTROLS:');
    addToHistory('  governor-emergency        - Show emergency options');
    addToHistory('');
    addToHistory('UTILITY:');
    addToHistory('  governor-help            - Show this help menu');
    addToHistory('  clear                    - Clear terminal screen');
    addToHistory('  exit                     - Exit terminal');
    addToHistory('');
    addToHistory('==================================');
    addToHistory('');
  };

  const handleRestrictionSave = async () => {
    if (!user) return;

    try {
      addToHistory('');
      addToHistory('[SYSTEM] Applying restriction configuration...');
      addToHistory('[DB] UPDATE system_settings SET system_controls=?...');
      
      await FirestoreService.updateSystemControls(
        restrictionConfig,
        user.id,
        user.name
      );
      
      addToHistory('[SUCCESS] System restrictions updated successfully');
      addToHistory('[BROADCAST] Pushing changes to all connected users...');
      addToHistory('[AUDIT] Restriction changes logged');
      addToHistory(`Configuration applied: ${Object.entries(restrictionConfig).filter(([key, value]) => !value && key.includes('Enabled')).map(([key]) => key.replace('Enabled', '').toUpperCase()).join(', ')} disabled.`);
      addToHistory('');
      
      setShowRestrictionModal(false);
      await loadSystemSettings();
    } catch (error) {
      addToHistory('[ERROR] Failed to apply restrictions');
      console.error('Error updating restrictions:', error);
    }
  };

  const addAllowedPage = () => {
    if (newAllowedPage.trim() && !restrictionConfig.allowedPages.includes(newAllowedPage.trim())) {
      setRestrictionConfig(prev => ({
        ...prev,
        allowedPages: [...prev.allowedPages, newAllowedPage.trim()]
      }));
      setNewAllowedPage('');
    }
  };

  const removeAllowedPage = (page: string) => {
    setRestrictionConfig(prev => ({
      ...prev,
      allowedPages: prev.allowedPages.filter(p => p !== page)
    }));
  };

  const applyQuickRestriction = (type: 'full_lockdown' | 'disable_withdrawals' | 'disable_messaging' | 'restore_all') => {
    switch (type) {
      case 'full_lockdown':
        setRestrictionConfig({
          withdrawalsEnabled: false,
          messagingEnabled: false,
          profileUpdatesEnabled: false,
          loginEnabled: false,
          tradingEnabled: false,
          depositsEnabled: false,
          reportingEnabled: false,
          supportTicketsEnabled: false,
          accountCreationEnabled: false,
          dataExportEnabled: false,
          notificationsEnabled: false,
          apiAccessEnabled: false,
          restrictedMode: true,
          allowedPages: ['/governor'],
          restrictionReason: 'Full system lockdown activated by Governor',
          restrictionLevel: 'full'
        });
        break;
      case 'disable_withdrawals':
        setRestrictionConfig(prev => ({
          ...prev,
          withdrawalsEnabled: false,
          restrictedMode: true,
          restrictionReason: 'Withdrawal functionality disabled for security',
          restrictionLevel: 'partial'
        }));
        break;
      case 'disable_messaging':
        setRestrictionConfig(prev => ({
          ...prev,
          messagingEnabled: false,
          restrictedMode: true,
          restrictionReason: 'Messaging system disabled for maintenance',
          restrictionLevel: 'partial'
        }));
        break;
      case 'restore_all':
        setRestrictionConfig({
          withdrawalsEnabled: true,
          messagingEnabled: true,
          profileUpdatesEnabled: true,
          loginEnabled: true,
          tradingEnabled: true,
          depositsEnabled: true,
          reportingEnabled: true,
          supportTicketsEnabled: true,
          accountCreationEnabled: true,
          dataExportEnabled: true,
          notificationsEnabled: true,
          apiAccessEnabled: true,
          restrictedMode: false,
          allowedPages: [],
          restrictionReason: '',
          restrictionLevel: 'none'
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      <div className="w-full max-w-6xl relative z-10">
        {/* Windows 95 Style Window */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-2 sm:mx-0 bg-white border-2"
          style={{
            borderTopColor: '#ffffff',
            borderLeftColor: '#ffffff',
            borderRightColor: '#808080',
            borderBottomColor: '#808080',
            boxShadow: '4px 4px 8px rgba(0,0,0,0.3)'
          }}
        >
          {/* Windows 95 Title Bar */}
          <div 
            className="px-2 py-1 flex items-center text-black text-sm font-bold"
            style={{ background: '#ffffff' }}
          >
            <div className="flex items-center space-x-2 w-full justify-center">
              <div className="w-4 h-4 bg-white border border-black flex items-center justify-center">
                <span className="text-black text-xs font-bold">GC</span>
              </div>
              <span>Interactive Brokers Governor Control Terminal</span>
            </div>
          </div>
          
          {/* Terminal Content Area */}
          <div className="p-4 bg-white relative">
            {/* Background logo overlay */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <img 
                src="/Screenshot 2025-06-07 024813.png" 
                alt="Interactive Brokers" 
                className="h-4 sm:h-6 w-auto object-contain"
                style={{ opacity: 0.5 }}
              />
            </div>
            
            {/* Terminal screen */}
            <div 
              ref={terminalRef}
              className="relative h-96 sm:h-[500px] overflow-y-auto font-mono text-xs sm:text-sm p-3 bg-white border-2"
              style={{
                borderTopColor: '#808080',
                borderLeftColor: '#808080',
                borderRightColor: '#ffffff',
                borderBottomColor: '#ffffff',
                zIndex: 2
              }}
            >
              {/* Terminal content */}
              <div className="relative z-10">
                {commandHistory.map((line, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, delay: index * 0.02 }}
                    className="whitespace-pre-wrap leading-tight text-black"
                    style={{ fontFamily: 'Courier New, monospace' }}
                  >
                    {line}
                  </motion.div>
                ))}
                
                {/* Current Input Line */}
                <form onSubmit={handleSubmit} className="flex items-center mt-2">
                  <span 
                    className="mr-2 text-black"
                    style={{ fontFamily: 'Courier New, monospace' }}
                  >
                    {isAuthenticated ? "GOV:\\>" : "C:\\>"}
                  </span>
                  <input
                    ref={inputRef}
                    type={isAuthenticated ? "text" : "password"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none font-mono text-xs sm:text-sm text-black"
                    placeholder={isAuthenticated ? 'Enter command...' : 'Enter authentication code'}
                    autoComplete="off"
                    spellCheck={false}
                    style={{ 
                      fontFamily: 'Courier New, monospace',
                      caretColor: '#000000'
                    }}
                  />
                  <span 
                    className="ml-1 animate-pulse text-black"
                    style={{ fontFamily: 'Courier New, monospace' }}
                  >
                    _
                  </span>
                </form>
              </div>
            </div>
          </div>
          
          {/* Windows 95 Status Bar */}
          <div 
            className="px-2 py-1 bg-white border-t text-xs flex items-center justify-between"
            style={{ borderTopColor: '#ffffff' }}
          >
            <div className="flex items-center space-x-4">
              <div 
                className="px-2 py-1 border bg-white"
                style={{
                  borderTopColor: '#808080',
                  borderLeftColor: '#808080',
                  borderRightColor: '#ffffff',
                  borderBottomColor: '#ffffff'
                }}
              >
                <span className="text-black">
                  {isAuthenticated ? 'AUTHENTICATED' : 'LOCKED'}
                </span>
              </div>
              <span className="text-black">
                {isAuthenticated ? 'Governor Control Active' : 'Authentication Required'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 border"
                style={{
                  borderTopColor: '#808080',
                  borderLeftColor: '#808080',
                  borderRightColor: '#ffffff',
                  borderBottomColor: '#ffffff',
                  backgroundColor: isAuthenticated ? '#00ff00' : '#ff0000'
                }}
              />
              <span className="text-black text-xs">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Restriction Configuration Modal */}
      {showRestrictionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white border-2 w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            style={{
              borderTopColor: '#ffffff',
              borderLeftColor: '#ffffff',
              borderRightColor: '#808080',
              borderBottomColor: '#808080',
              boxShadow: '4px 4px 8px rgba(0,0,0,0.3)'
            }}
          >
            {/* Modal Title Bar */}
            <div 
              className="px-4 py-2 bg-white border-b flex justify-between items-center"
              style={{ borderBottomColor: '#808080' }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border border-black flex items-center justify-center">
                  <span className="text-black text-xs font-bold">RC</span>
                </div>
                <h3 className="text-sm font-bold text-black">GOVERNOR SYSTEM RESTRICTION CONFIGURATION</h3>
              </div>
              <button
                onClick={() => setShowRestrictionModal(false)}
                className="text-black hover:bg-gray-200 p-1 border"
                style={{
                  borderTopColor: '#ffffff',
                  borderLeftColor: '#ffffff',
                  borderRightColor: '#808080',
                  borderBottomColor: '#808080'
                }}
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            
            <div className="p-4 space-y-4 bg-white font-mono text-xs">
              {/* Quick Actions */}
              <div 
                className="bg-gray-200 p-3 border"
                style={{
                  borderTopColor: '#808080',
                  borderLeftColor: '#808080',
                  borderRightColor: '#ffffff',
                  borderBottomColor: '#ffffff'
                }}
              >
                <h4 className="font-bold text-black mb-3 text-xs">QUICK RESTRICTION ACTIONS</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => applyQuickRestriction('full_lockdown')}
                    className="p-2 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors border text-xs"
                    style={{
                      borderTopColor: '#ffffff',
                      borderLeftColor: '#ffffff',
                      borderRightColor: '#800000',
                      borderBottomColor: '#800000'
                    }}
                  >
                    FULL LOCKDOWN
                  </button>
                  <button
                    onClick={() => applyQuickRestriction('disable_withdrawals')}
                    className="p-2 bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors border text-xs"
                    style={{
                      borderTopColor: '#ffffff',
                      borderLeftColor: '#ffffff',
                      borderRightColor: '#804000',
                      borderBottomColor: '#804000'
                    }}
                  >
                    DISABLE WITHDRAWALS
                  </button>
                  <button
                    onClick={() => applyQuickRestriction('disable_messaging')}
                    className="p-2 bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors border text-xs"
                    style={{
                      borderTopColor: '#ffffff',
                      borderLeftColor: '#ffffff',
                      borderRightColor: '#400080',
                      borderBottomColor: '#400080'
                    }}
                  >
                    DISABLE MESSAGING
                  </button>
                  <button
                    onClick={() => applyQuickRestriction('restore_all')}
                    className="p-2 bg-green-600 text-white font-bold hover:bg-green-700 transition-colors border text-xs"
                    style={{
                      borderTopColor: '#ffffff',
                      borderLeftColor: '#ffffff',
                      borderRightColor: '#008000',
                      borderBottomColor: '#008000'
                    }}
                  >
                    RESTORE ALL
                  </button>
                </div>
              </div>

              {/* Individual Controls */}
              <div 
                className="bg-gray-200 p-3 border"
                style={{
                  borderTopColor: '#808080',
                  borderLeftColor: '#808080',
                  borderRightColor: '#ffffff',
                  borderBottomColor: '#ffffff'
                }}
              >
                <h4 className="font-bold text-black mb-3 text-xs">INDIVIDUAL FUNCTIONALITY CONTROLS</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <h5 className="font-bold text-black text-xs border-b border-gray-400 pb-1">CORE FUNCTIONS</h5>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-black mb-1">
                          WITHDRAWAL SYSTEM
                        </label>
                        <p className="text-xs text-gray-600">
                          {restrictionConfig.withdrawalsEnabled ? 'USERS CAN WITHDRAW FUNDS' : 'WITHDRAWALS BLOCKED'}
                        </p>
                      </div>
                      <div 
                        className="relative inline-flex items-center cursor-pointer p-1 border bg-white"
                        style={{
                          borderTopColor: '#808080',
                          borderLeftColor: '#808080',
                          borderRightColor: '#ffffff',
                          borderBottomColor: '#ffffff'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={restrictionConfig.withdrawalsEnabled}
                          onChange={(e) => setRestrictionConfig(prev => ({
                            ...prev,
                            withdrawalsEnabled: e.target.checked
                          }))}
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-black mb-1">
                          MESSAGING SYSTEM
                        </label>
                        <p className="text-xs text-gray-600">
                          {restrictionConfig.messagingEnabled ? 'MESSAGING ACTIVE' : 'MESSAGING DISABLED'}
                        </p>
                      </div>
                      <div 
                        className="relative inline-flex items-center cursor-pointer p-1 border bg-white"
                        style={{
                          borderTopColor: '#808080',
                          borderLeftColor: '#808080',
                          borderRightColor: '#ffffff',
                          borderBottomColor: '#ffffff'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={restrictionConfig.messagingEnabled}
                          onChange={(e) => setRestrictionConfig(prev => ({
                            ...prev,
                            messagingEnabled: e.target.checked
                          }))}
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-black mb-1">
                          PROFILE UPDATES
                        </label>
                        <p className="text-xs text-gray-600">
                          {restrictionConfig.profileUpdatesEnabled ? 'UPDATES ALLOWED' : 'UPDATES BLOCKED'}
                        </p>
                      </div>
                      <div 
                        className="relative inline-flex items-center cursor-pointer p-1 border bg-white"
                        style={{
                          borderTopColor: '#808080',
                          borderLeftColor: '#808080',
                          borderRightColor: '#ffffff',
                          borderBottomColor: '#ffffff'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={restrictionConfig.profileUpdatesEnabled}
                          onChange={(e) => setRestrictionConfig(prev => ({
                            ...prev,
                            profileUpdatesEnabled: e.target.checked
                          }))}
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-black mb-1">
                          LOGIN ACCESS
                        </label>
                        <p className="text-xs text-gray-600">
                          {restrictionConfig.loginEnabled ? 'LOGIN ALLOWED' : 'LOGIN BLOCKED'}
                        </p>
                      </div>
                      <div 
                        className="relative inline-flex items-center cursor-pointer p-1 border bg-white"
                        style={{
                          borderTopColor: '#808080',
                          borderLeftColor: '#808080',
                          borderRightColor: '#ffffff',
                          borderBottomColor: '#ffffff'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={restrictionConfig.loginEnabled}
                          onChange={(e) => setRestrictionConfig(prev => ({
                            ...prev,
                            loginEnabled: e.target.checked
                          }))}
                          className="w-3 h-3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-bold text-black text-xs border-b border-gray-400 pb-1">TRADING & FINANCE</h5>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-black mb-1">
                          TRADING SYSTEM
                        </label>
                        <p className="text-xs text-gray-600">
                          {restrictionConfig.tradingEnabled ? 'TRADING ACTIVE' : 'TRADING DISABLED'}
                        </p>
                      </div>
                      <div 
                        className="relative inline-flex items-center cursor-pointer p-1 border bg-white"
                        style={{
                          borderTopColor: '#808080',
                          borderLeftColor: '#808080',
                          borderRightColor: '#ffffff',
                          borderBottomColor: '#ffffff'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={restrictionConfig.tradingEnabled}
                          onChange={(e) => setRestrictionConfig(prev => ({
                            ...prev,
                            tradingEnabled: e.target.checked
                          }))}
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-black mb-1">
                          DEPOSIT SYSTEM
                        </label>
                        <p className="text-xs text-gray-600">
                          {restrictionConfig.depositsEnabled ? 'DEPOSITS ALLOWED' : 'DEPOSITS BLOCKED'}
                        </p>
                      </div>
                      <div 
                        className="relative inline-flex items-center cursor-pointer p-1 border bg-white"
                        style={{
                          borderTopColor: '#808080',
                          borderLeftColor: '#808080',
                          borderRightColor: '#ffffff',
                          borderBottomColor: '#ffffff'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={restrictionConfig.depositsEnabled}
                          onChange={(e) => setRestrictionConfig(prev => ({
                            ...prev,
                            depositsEnabled: e.target.checked
                          }))}
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-black mb-1">
                          REPORTING SYSTEM
                        </label>
                        <p className="text-xs text-gray-600">
                          {restrictionConfig.reportingEnabled ? 'REPORTS ACTIVE' : 'REPORTS DISABLED'}
                        </p>
                      </div>
                      <div 
                        className="relative inline-flex items-center cursor-pointer p-1 border bg-white"
                        style={{
                          borderTopColor: '#808080',
                          borderLeftColor: '#808080',
                          borderRightColor: '#ffffff',
                          borderBottomColor: '#ffffff'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={restrictionConfig.reportingEnabled}
                          onChange={(e) => setRestrictionConfig(prev => ({
                            ...prev,
                            reportingEnabled: e.target.checked
                          }))}
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-black mb-1">
                          ACCOUNT CREATION
                        </label>
                        <p className="text-xs text-gray-600">
                          {restrictionConfig.accountCreationEnabled ? 'CREATION ALLOWED' : 'CREATION BLOCKED'}
                        </p>
                      </div>
                      <div 
                        className="relative inline-flex items-center cursor-pointer p-1 border bg-white"
                        style={{
                          borderTopColor: '#808080',
                          borderLeftColor: '#808080',
                          borderRightColor: '#ffffff',
                          borderBottomColor: '#ffffff'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={restrictionConfig.accountCreationEnabled}
                          onChange={(e) => setRestrictionConfig(prev => ({
                            ...prev,
                            accountCreationEnabled: e.target.checked
                          }))}
                          className="w-3 h-3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-bold text-black text-xs border-b border-gray-400 pb-1">SUPPORT & ADMIN</h5>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-black mb-1">
                          SUPPORT TICKETS
                        </label>
                        <p className="text-xs text-gray-600">
                          {restrictionConfig.supportTicketsEnabled ? 'TICKETS ACTIVE' : 'TICKETS DISABLED'}
                        </p>
                      </div>
                      <div 
                        className="relative inline-flex items-center cursor-pointer p-1 border bg-white"
                        style={{
                          borderTopColor: '#808080',
                          borderLeftColor: '#808080',
                          borderRightColor: '#ffffff',
                          borderBottomColor: '#ffffff'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={restrictionConfig.supportTicketsEnabled}
                          onChange={(e) => setRestrictionConfig(prev => ({
                            ...prev,
                            supportTicketsEnabled: e.target.checked
                          }))}
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-black mb-1">
                          DATA EXPORT
                        </label>
                        <p className="text-xs text-gray-600">
                          {restrictionConfig.dataExportEnabled ? 'EXPORT ALLOWED' : 'EXPORT BLOCKED'}
                        </p>
                      </div>
                      <div 
                        className="relative inline-flex items-center cursor-pointer p-1 border bg-white"
                        style={{
                          borderTopColor: '#808080',
                          borderLeftColor: '#808080',
                          borderRightColor: '#ffffff',
                          borderBottomColor: '#ffffff'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={restrictionConfig.dataExportEnabled}
                          onChange={(e) => setRestrictionConfig(prev => ({
                            ...prev,
                            dataExportEnabled: e.target.checked
                          }))}
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-black mb-1">
                          NOTIFICATIONS
                        </label>
                        <p className="text-xs text-gray-600">
                          {restrictionConfig.notificationsEnabled ? 'NOTIFICATIONS ON' : 'NOTIFICATIONS OFF'}
                        </p>
                      </div>
                      <div 
                        className="relative inline-flex items-center cursor-pointer p-1 border bg-white"
                        style={{
                          borderTopColor: '#808080',
                          borderLeftColor: '#808080',
                          borderRightColor: '#ffffff',
                          borderBottomColor: '#ffffff'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={restrictionConfig.notificationsEnabled}
                          onChange={(e) => setRestrictionConfig(prev => ({
                            ...prev,
                            notificationsEnabled: e.target.checked
                          }))}
                          className="w-3 h-3"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-black mb-1">
                          API ACCESS
                        </label>
                        <p className="text-xs text-gray-600">
                          {restrictionConfig.apiAccessEnabled ? 'API ACTIVE' : 'API BLOCKED'}
                        </p>
                      </div>
                      <div 
                        className="relative inline-flex items-center cursor-pointer p-1 border bg-white"
                        style={{
                          borderTopColor: '#808080',
                          borderLeftColor: '#808080',
                          borderRightColor: '#ffffff',
                          borderBottomColor: '#ffffff'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={restrictionConfig.apiAccessEnabled}
                          onChange={(e) => setRestrictionConfig(prev => ({
                            ...prev,
                            apiAccessEnabled: e.target.checked
                          }))}
                          className="w-3 h-3"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Restriction Level */}
              <div 
                className="bg-gray-200 p-3 border"
                style={{
                  borderTopColor: '#808080',
                  borderLeftColor: '#808080',
                  borderRightColor: '#ffffff',
                  borderBottomColor: '#ffffff'
                }}
              >
                <h4 className="font-bold text-black mb-3 text-xs">RESTRICTION LEVEL</h4>
                <div className="flex space-x-2">
                  {[
                    { key: 'none', label: 'NONE', color: 'bg-green-600' },
                    { key: 'partial', label: 'PARTIAL', color: 'bg-yellow-600' },
                    { key: 'full', label: 'FULL', color: 'bg-red-600' }
                  ].map(level => (
                    <button
                      key={level.key}
                      onClick={() => setRestrictionConfig(prev => ({
                        ...prev,
                        restrictionLevel: level.key as any
                      }))}
                      className={`px-3 py-2 font-bold transition-colors text-xs border ${
                        restrictionConfig.restrictionLevel === level.key
                          ? `${level.color} text-white`
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                      style={restrictionConfig.restrictionLevel === level.key ? {} : {
                        borderTopColor: '#ffffff',
                        borderLeftColor: '#ffffff',
                        borderRightColor: '#808080',
                        borderBottomColor: '#808080'
                      }}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Restriction Reason */}
              <div 
                className="bg-gray-200 p-3 border"
                style={{
                  borderTopColor: '#808080',
                  borderLeftColor: '#808080',
                  borderRightColor: '#ffffff',
                  borderBottomColor: '#ffffff'
                }}
              >
                <h4 className="font-bold text-black mb-3 text-xs">RESTRICTION REASON</h4>
                <textarea
                  value={restrictionConfig.restrictionReason}
                  onChange={(e) => setRestrictionConfig(prev => ({
                    ...prev,
                    restrictionReason: e.target.value
                  }))}
                  className="w-full px-2 py-2 border font-mono text-xs"
                  style={{
                    borderTopColor: '#808080',
                    borderLeftColor: '#808080',
                    borderRightColor: '#ffffff',
                    borderBottomColor: '#ffffff'
                  }}
                  rows={3}
                  placeholder="Enter reason for system restrictions..."
                />
              </div>

              {/* Allowed Pages (for restricted mode) */}
              <div 
                className="bg-gray-200 p-3 border"
                style={{
                  borderTopColor: '#808080',
                  borderLeftColor: '#808080',
                  borderRightColor: '#ffffff',
                  borderBottomColor: '#ffffff'
                }}
              >
                <h4 className="font-bold text-black mb-3 text-xs">ALLOWED PAGES (RESTRICTED MODE)</h4>
                <div className="space-y-2">
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      value={newAllowedPage}
                      onChange={(e) => setNewAllowedPage(e.target.value)}
                      className="flex-1 px-2 py-1 border font-mono text-xs"
                      style={{
                        borderTopColor: '#808080',
                        borderLeftColor: '#808080',
                        borderRightColor: '#ffffff',
                        borderBottomColor: '#ffffff'
                      }}
                      placeholder="e.g., /admin/dashboard"
                    />
                    <button
                      onClick={addAllowedPage}
                      disabled={!newAllowedPage.trim()}
                      className="px-2 py-1 bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 text-xs border"
                      style={{
                        borderTopColor: '#ffffff',
                        borderLeftColor: '#ffffff',
                        borderRightColor: '#000000',
                        borderBottomColor: '#000000'
                      }}
                    >
                      ADD
                    </button>
                  </div>
                  
                  {restrictionConfig.allowedPages.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-black">CURRENTLY ALLOWED PAGES:</p>
                      {restrictionConfig.allowedPages.map((page, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between bg-white p-1 border"
                          style={{
                            borderTopColor: '#808080',
                            borderLeftColor: '#808080',
                            borderRightColor: '#ffffff',
                            borderBottomColor: '#ffffff'
                          }}
                        >
                          <span className="font-mono text-xs text-black">{page}</span>
                          <button
                            onClick={() => removeAllowedPage(page)}
                            className="text-red-600 hover:text-red-800 font-bold text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Apply Configuration */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowRestrictionModal(false)}
                  className="flex-1 px-3 py-2 bg-white border text-black font-bold hover:bg-gray-100 transition-colors text-xs"
                  style={{
                    borderTopColor: '#ffffff',
                    borderLeftColor: '#ffffff',
                    borderRightColor: '#808080',
                    borderBottomColor: '#808080'
                  }}
                >
                  CANCEL
                </button>
                <button
                  onClick={handleRestrictionSave}
                  className="flex-1 px-3 py-2 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors border text-xs"
                  style={{
                    borderTopColor: '#ffffff',
                    borderLeftColor: '#ffffff',
                    borderRightColor: '#800000',
                    borderBottomColor: '#800000'
                  }}
                >
                  APPLY RESTRICTIONS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernorTerminalControl;