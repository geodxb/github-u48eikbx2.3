import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FirestoreService } from '../../services/firestoreService';
import { AccountClosureService } from '../../services/accountClosureService';
import { SystemSettings } from '../../types/user';

const GovernorTerminalControl = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([
    'Interactive Brokers Governor Control Terminal v3.0.0',
    'Copyright (c) 2025 Interactive Brokers LLC',
    'All rights reserved.',
    '',
    'Governor Control System initialized...',
    'Security protocols active...',
    'System restrictions management ready...',
    '',
    'Type "help" for available commands or "exit" to return to dashboard.',
    ''
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSystemSettings();
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const loadSystemSettings = async () => {
    try {
      const settings = await FirestoreService.getSystemSettings();
      setSystemSettings(settings);
    } catch (error) {
      console.error('Error loading system settings:', error);
    }
  };

  const addToHistory = (text: string) => {
    setCommandHistory(prev => [...prev, text]);
  };

  const handleCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim();
    addToHistory(`C:\\GOVERNOR> ${command}`);
    
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    switch (cmd) {
      case 'help':
        addToHistory('');
        addToHistory('AVAILABLE COMMANDS:');
        addToHistory('');
        addToHistory('SYSTEM CONTROL:');
        addToHistory('  status          - Show current system status');
        addToHistory('  restrictions    - Show current restrictions');
        addToHistory('  disable <func>  - Disable system function');
        addToHistory('  enable <func>   - Enable system function');
        addToHistory('  emergency       - Emergency system shutdown');
        addToHistory('');
        addToHistory('INVESTOR CONTROL:');
        addToHistory('  list investors  - Show all investors');
        addToHistory('  delete <name>   - Permanently delete investor');
        addToHistory('  wipe <name>     - Complete data wipe (irreversible)');
        addToHistory('  suspend <name>  - Suspend investor account');
        addToHistory('  activate <name> - Activate investor account');
        addToHistory('');
        addToHistory('SYSTEM LOCKDOWN:');
        addToHistory('  lockdown        - Complete platform lockdown');
        addToHistory('  unlock          - Remove all restrictions');
        addToHistory('  restrict <level> - Set restriction level (partial/full)');
        addToHistory('');
        addToHistory('FUNCTIONS:');
        addToHistory('  withdrawals     - Withdrawal system');
        addToHistory('  messaging       - Messaging system');
        addToHistory('  profiles        - Profile updates');
        addToHistory('  login          - Login access');
        addToHistory('  trading        - Trading system');
        addToHistory('  deposits       - Deposit system');
        addToHistory('  reporting      - Reporting system');
        addToHistory('  accounts       - Account creation');
        addToHistory('  tickets        - Support tickets');
        addToHistory('  exports        - Data export');
        addToHistory('  notifications  - Push notifications');
        addToHistory('  api           - API access');
        addToHistory('');
        addToHistory('NAVIGATION:');
        addToHistory('  exit           - Return to dashboard');
        addToHistory('  clear          - Clear terminal');
        addToHistory('');
        break;

      case 'status':
        addToHistory('');
        addToHistory('SYSTEM STATUS REPORT:');
        addToHistory('========================');
        addToHistory(`Maintenance Mode: ${systemSettings?.maintenanceMode ? 'ENABLED' : 'DISABLED'}`);
        addToHistory(`Security Level: ${systemSettings?.securityLevel || 'MEDIUM'}`);
        addToHistory(`Restricted Mode: ${systemSettings?.systemControls?.restrictedMode ? 'ACTIVE' : 'INACTIVE'}`);
        addToHistory('');
        addToHistory('FUNCTION STATUS:');
        addToHistory(`  Withdrawals: ${systemSettings?.systemControls?.withdrawalsEnabled !== false ? 'ENABLED' : 'DISABLED'}`);
        addToHistory(`  Messaging: ${systemSettings?.systemControls?.messagingEnabled !== false ? 'ENABLED' : 'DISABLED'}`);
        addToHistory(`  Profiles: ${systemSettings?.systemControls?.profileUpdatesEnabled !== false ? 'ENABLED' : 'DISABLED'}`);
        addToHistory(`  Login: ${systemSettings?.systemControls?.loginEnabled !== false ? 'ENABLED' : 'DISABLED'}`);
        addToHistory('');
        break;

      case 'restrictions':
        addToHistory('');
        addToHistory('CURRENT RESTRICTIONS:');
        addToHistory('====================');
        const controls = systemSettings?.systemControls;
        if (controls) {
          const restrictions = [];
          if (controls.withdrawalsEnabled === false) restrictions.push('WITHDRAWALS DISABLED');
          if (controls.messagingEnabled === false) restrictions.push('MESSAGING DISABLED');
          if (controls.profileUpdatesEnabled === false) restrictions.push('PROFILE UPDATES DISABLED');
          if (controls.loginEnabled === false) restrictions.push('LOGIN DISABLED');
          
          if (restrictions.length === 0) {
            addToHistory('No active restrictions.');
          } else {
            restrictions.forEach(restriction => addToHistory(`  ${restriction}`));
          }
        } else {
          addToHistory('Unable to load restriction data.');
        }
        addToHistory('');
        break;

      case 'clear':
        setCommandHistory([
          'Interactive Brokers Governor Control Terminal v3.0.0',
          'Copyright (c) 2025 Interactive Brokers LLC',
          'All rights reserved.',
          '',
          'Terminal cleared by Governor command.',
          ''
        ]);
        break;

      case 'exit':
        addToHistory('');
        addToHistory('Logging out of Governor Control Terminal...');
        addToHistory('Saving session data...');
        addToHistory('Clearing secure memory...');
        addToHistory('Session terminated.');
        addToHistory('Returning to Governor Dashboard...');
        
        // Navigate back to dashboard after showing logout messages
        setTimeout(() => {
          navigate('/governor');
        }, 1500);
        break;

      case 'emergency':
        if (!confirm('EMERGENCY SHUTDOWN: This will enable maintenance mode and block all user access. Continue?')) {
          addToHistory('Emergency shutdown cancelled by Governor.');
          break;
        }
        
        addToHistory('');
        addToHistory('INITIATING EMERGENCY SHUTDOWN...');
        addToHistory('Enabling maintenance mode...');
        addToHistory('Blocking all user access...');
        
        try {
          if (user && systemSettings) {
            await FirestoreService.updateSystemControls({
              ...systemSettings.systemControls,
              restrictedMode: true,
              loginEnabled: false,
              withdrawalsEnabled: false,
              messagingEnabled: false,
              profileUpdatesEnabled: false,
              allowedPages: ['/governor'],
              restrictionReason: 'EMERGENCY SHUTDOWN ACTIVATED BY GOVERNOR',
              restrictionLevel: 'full'
            }, user.id, user.name);
            
            await FirestoreService.updateSystemSetting(
              'maintenanceMode',
              true,
              user.id,
              user.name,
              systemSettings.maintenanceMode
            );
            
            addToHistory('EMERGENCY SHUTDOWN COMPLETED.');
            addToHistory('All systems locked down.');
          }
        } catch (error) {
          addToHistory('ERROR: Emergency shutdown failed.');
        }
        break;

      default:
        // Handle disable/enable commands
        if (cmd.startsWith('disable ')) {
          const func = cmd.substring(8);
          await handleFunctionToggle(func, false);
        } else if (cmd.startsWith('enable ')) {
          const func = cmd.substring(7);
          await handleFunctionToggle(func, true);
        } else {
          addToHistory(`ERROR: Unknown command '${command}'`);
          addToHistory('Type "help" for available commands.');
        }
        break;
    }
    
    setIsProcessing(false);
  };

  const handleFunctionToggle = async (func: string, enable: boolean) => {
    if (!user || !systemSettings) {
      addToHistory('ERROR: Unable to access system settings.');
      return;
    }

    const functionMap: Record<string, keyof SystemSettings['systemControls']> = {
      'withdrawals': 'withdrawalsEnabled',
      'messaging': 'messagingEnabled',
      'profiles': 'profileUpdatesEnabled',
      'login': 'loginEnabled'
    };

    const settingKey = functionMap[func];
    if (!settingKey) {
      addToHistory(`ERROR: Unknown function '${func}'`);
      addToHistory('Available functions: withdrawals, messaging, profiles, login');
      return;
    }

    try {
      addToHistory('');
      addToHistory(`${enable ? 'ENABLING' : 'DISABLING'} ${func.toUpperCase()}...`);
      addToHistory('Updating system configuration...');
      
      const updatedControls = {
        ...systemSettings.systemControls,
        [settingKey]: enable
      };

      await FirestoreService.updateSystemControls(
        updatedControls,
        user.id,
        user.name
      );

      // Reload settings
      await loadSystemSettings();
      
      addToHistory(`${func.toUpperCase()} ${enable ? 'ENABLED' : 'DISABLED'} successfully.`);
      addToHistory('Configuration saved.');
      addToHistory('');
    } catch (error) {
      addToHistory(`ERROR: Failed to ${enable ? 'enable' : 'disable'} ${func}.`);
      console.error('Error updating system controls:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    await handleCommand(input.trim());
    setInput('');
  };

  return (
    <div className="space-y-6">
      {/* Windows 95 Style Terminal */}
      <div 
        className="bg-white border-2"
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
          style={{ background: '#c0c0c0' }}
        >
          <div className="flex items-center space-x-2 w-full justify-center">
            <div className="w-4 h-4 bg-white border border-black flex items-center justify-center">
              <span className="text-black text-xs font-bold">GT</span>
            </div>
            <span>Governor Control Terminal</span>
          </div>
        </div>
        
        {/* Terminal Screen */}
        <div 
          ref={terminalRef}
          className="h-96 overflow-y-auto font-mono text-sm p-3 bg-black text-green-400 border-2"
          style={{
            borderTopColor: '#808080',
            borderLeftColor: '#808080',
            borderRightColor: '#ffffff',
            borderBottomColor: '#ffffff',
            fontFamily: 'Courier New, monospace'
          }}
        >
          {commandHistory.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap leading-tight">
              {line}
            </div>
          ))}
          
          {/* Current Input Line */}
          <form onSubmit={handleSubmit} className="flex items-center mt-2">
            <span className="mr-2 text-green-400">C:\GOVERNOR&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-green-400"
              disabled={isProcessing}
              autoComplete="off"
              spellCheck={false}
              style={{ 
                fontFamily: 'Courier New, monospace',
                caretColor: '#00ff00'
              }}
            />
            {/* Blinking cursor */}
            <span className="ml-1 animate-pulse text-green-400">_</span>
          </form>
        </div>
        
        {/* Windows 95 Status Bar */}
        <div 
          className="px-2 py-1 bg-gray-300 border-t text-xs flex items-center justify-between"
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
                {isProcessing ? 'PROCESSING' : 'READY'}
              </span>
            </div>
            <span className="text-black">Governor Terminal Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 border"
              style={{
                borderTopColor: '#808080',
                borderLeftColor: '#808080',
                borderRightColor: '#ffffff',
                borderBottomColor: '#ffffff',
                backgroundColor: '#000000'
              }}
            />
            <span className="text-black text-xs">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* System Restrictions Panel - Windows 95 Style */}
      <div 
        className="bg-white border-2"
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
          style={{ background: '#c0c0c0' }}
        >
          <div className="flex items-center space-x-2 w-full justify-center">
            <div className="w-4 h-4 bg-white border border-black flex items-center justify-center">
              <span className="text-black text-xs font-bold">SC</span>
            </div>
            <span>System Controls</span>
          </div>
        </div>

        {/* Control Panel Content */}
        <div className="p-4 bg-gray-200" style={{ fontFamily: 'MS Sans Serif, sans-serif' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Core Functions Group */}
            <div 
              className="bg-white border-2 p-3"
              style={{
                borderTopColor: '#ffffff',
                borderLeftColor: '#ffffff',
                borderRightColor: '#808080',
                borderBottomColor: '#808080'
              }}
            >
              <h4 className="text-black font-bold text-sm mb-3 border-b border-gray-400 pb-1">
                CORE FUNCTIONS
              </h4>
              <div className="space-y-2">
                {[
                  { key: 'withdrawalsEnabled', label: 'Withdrawal System' },
                  { key: 'messagingEnabled', label: 'Messaging System' },
                  { key: 'profileUpdatesEnabled', label: 'Profile Updates' },
                  { key: 'loginEnabled', label: 'Login Access' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-2 text-black text-xs">
                    <input
                      type="checkbox"
                      checked={systemSettings?.systemControls?.[key as keyof typeof systemSettings.systemControls] !== false}
                      onChange={async (e) => {
                        if (!user || !systemSettings) return;
                        
                        const updatedControls = {
                          ...systemSettings.systemControls,
                          [key]: e.target.checked
                        };
                        
                        try {
                          await FirestoreService.updateSystemControls(updatedControls, user.id, user.name);
                          await loadSystemSettings();
                          
                          addToHistory('');
                          addToHistory(`${label.toUpperCase()} ${e.target.checked ? 'ENABLED' : 'DISABLED'} via control panel.`);
                          addToHistory('');
                        } catch (error) {
                          console.error('Error updating controls:', error);
                        }
                      }}
                      className="w-3 h-3"
                      style={{
                        accentColor: '#000000'
                      }}
                    />
                    <span className="font-bold">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Trading & Finance Group */}
            <div 
              className="bg-white border-2 p-3"
              style={{
                borderTopColor: '#ffffff',
                borderLeftColor: '#ffffff',
                borderRightColor: '#808080',
                borderBottomColor: '#808080'
              }}
            >
              <h4 className="text-black font-bold text-sm mb-3 border-b border-gray-400 pb-1">
                TRADING & FINANCE
              </h4>
              <div className="space-y-2">
                {[
                  { key: 'tradingEnabled', label: 'Trading System' },
                  { key: 'depositsEnabled', label: 'Deposit System' },
                  { key: 'reportingEnabled', label: 'Reporting System' },
                  { key: 'accountCreationEnabled', label: 'Account Creation' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-2 text-black text-xs">
                    <input
                      type="checkbox"
                      checked={systemSettings?.systemControls?.[key as keyof typeof systemSettings.systemControls] !== false}
                      onChange={async (e) => {
                        if (!user || !systemSettings) return;
                        
                        const updatedControls = {
                          ...systemSettings.systemControls,
                          [key]: e.target.checked
                        };
                        
                        try {
                          await FirestoreService.updateSystemControls(updatedControls, user.id, user.name);
                          await loadSystemSettings();
                          
                          addToHistory('');
                          addToHistory(`${label.toUpperCase()} ${e.target.checked ? 'ENABLED' : 'DISABLED'} via control panel.`);
                          addToHistory('');
                        } catch (error) {
                          console.error('Error updating controls:', error);
                        }
                      }}
                      className="w-3 h-3"
                      style={{
                        accentColor: '#000000'
                      }}
                    />
                    <span className="font-bold">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Support & Admin Group */}
            <div 
              className="bg-white border-2 p-3"
              style={{
                borderTopColor: '#ffffff',
                borderLeftColor: '#ffffff',
                borderRightColor: '#808080',
                borderBottomColor: '#808080'
              }}
            >
              <h4 className="text-black font-bold text-sm mb-3 border-b border-gray-400 pb-1">
                SUPPORT & ADMIN
              </h4>
              <div className="space-y-2">
                {[
                  { key: 'supportTicketsEnabled', label: 'Support Tickets' },
                  { key: 'dataExportEnabled', label: 'Data Export' },
                  { key: 'notificationsEnabled', label: 'Notifications' },
                  { key: 'apiAccessEnabled', label: 'API Access' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-2 text-black text-xs">
                    <input
                      type="checkbox"
                      checked={systemSettings?.systemControls?.[key as keyof typeof systemSettings.systemControls] !== false}
                      onChange={async (e) => {
                        if (!user || !systemSettings) return;
                        
                        const updatedControls = {
                          ...systemSettings.systemControls,
                          [key]: e.target.checked
                        };
                        
                        try {
                          await FirestoreService.updateSystemControls(updatedControls, user.id, user.name);
                          await loadSystemSettings();
                          
                          addToHistory('');
                          addToHistory(`${label.toUpperCase()} ${e.target.checked ? 'ENABLED' : 'DISABLED'} via control panel.`);
                          addToHistory('');
                        } catch (error) {
                          console.error('Error updating controls:', error);
                        }
                      }}
                      className="w-3 h-3"
                      style={{
                        accentColor: '#000000'
                      }}
                    />
                    <span className="font-bold">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Controls */}
          <div className="mt-4">
            <div 
              className="bg-white border-2 p-3"
              style={{
                borderTopColor: '#ffffff',
                borderLeftColor: '#ffffff',
                borderRightColor: '#808080',
                borderBottomColor: '#808080'
              }}
            >
              <h4 className="text-black font-bold text-sm mb-3 border-b border-gray-400 pb-1">
                EMERGENCY CONTROLS
              </h4>
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    if (!confirm('EMERGENCY SHUTDOWN: This will lock down the entire platform. Continue?')) return;
                    
                    if (user && systemSettings) {
                      try {
                        await FirestoreService.updateSystemControls({
                          ...systemSettings.systemControls,
                          restrictedMode: true,
                          loginEnabled: false,
                          withdrawalsEnabled: false,
                          messagingEnabled: false,
                          profileUpdatesEnabled: false,
                          allowedPages: ['/governor'],
                          restrictionReason: 'EMERGENCY SHUTDOWN ACTIVATED',
                          restrictionLevel: 'full'
                        }, user.id, user.name);
                        
                        addToHistory('');
                        addToHistory('EMERGENCY SHUTDOWN ACTIVATED.');
                        addToHistory('All systems locked down.');
                        addToHistory('');
                      } catch (error) {
                        addToHistory('ERROR: Emergency shutdown failed.');
                      }
                    }
                  }}
                  className="px-3 py-1 bg-red-600 text-white text-xs font-bold border-2 border-red-800"
                  style={{
                    borderTopColor: '#ff8080',
                    borderLeftColor: '#ff8080',
                    borderRightColor: '#800000',
                    borderBottomColor: '#800000'
                  }}
                >
                  EMERGENCY SHUTDOWN
                </button>
                
                <button
                  onClick={async () => {
                    if (!user || !systemSettings) return;
                    
                    try {
                      await FirestoreService.updateSystemControls({
                        withdrawalsEnabled: true,
                        messagingEnabled: true,
                        profileUpdatesEnabled: true,
                        loginEnabled: true,
                        restrictedMode: false,
                        allowedPages: [],
                        restrictionReason: '',
                        restrictionLevel: 'none'
                      }, user.id, user.name);
                      
                      await loadSystemSettings();
                      
                      addToHistory('');
                      addToHistory('ALL SYSTEMS RESTORED TO NORMAL OPERATION.');
                      addToHistory('All restrictions lifted.');
                      addToHistory('');
                    } catch (error) {
                      addToHistory('ERROR: System restore failed.');
                    }
                  }}
                  className="px-3 py-1 bg-green-600 text-white text-xs font-bold border-2 border-green-800"
                  style={{
                    borderTopColor: '#80ff80',
                    borderLeftColor: '#80ff80',
                    borderRightColor: '#008000',
                    borderBottomColor: '#008000'
                  }}
                >
                  RESTORE ALL SYSTEMS
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernorTerminalControl;