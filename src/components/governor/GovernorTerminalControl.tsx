import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FirestoreService } from '../../services/firestoreService';
import { AccountClosureService } from '../../services/accountClosureService';
import { useInvestors } from '../../hooks/useFirestore';
import { SystemSettings } from '../../types/user';
import { TriangleAlert as AlertTriangle } from 'lucide-react';
import Modal from '../common/Modal';

const GovernorTerminalControl = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { investors } = useInvestors();
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
  const [showMoveBalanceModal, setShowMoveBalanceModal] = useState(false);
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
    const args = cmd.split(' ');
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
        addToHistory('  movebalance     - Transfer investor balance to admin commission');
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
        addToHistory(`  Trading: ${systemSettings?.systemControls?.tradingEnabled !== false ? 'ENABLED' : 'DISABLED'}`);
        addToHistory(`  Deposits: ${systemSettings?.systemControls?.depositsEnabled !== false ? 'ENABLED' : 'DISABLED'}`);
        addToHistory(`  Reporting: ${systemSettings?.systemControls?.reportingEnabled !== false ? 'ENABLED' : 'DISABLED'}`);
        addToHistory(`  Accounts: ${systemSettings?.systemControls?.accountCreationEnabled !== false ? 'ENABLED' : 'DISABLED'}`);
        addToHistory(`  Tickets: ${systemSettings?.systemControls?.supportTicketsEnabled !== false ? 'ENABLED' : 'DISABLED'}`);
        addToHistory(`  Exports: ${systemSettings?.systemControls?.dataExportEnabled !== false ? 'ENABLED' : 'DISABLED'}`);
        addToHistory(`  Notifications: ${systemSettings?.systemControls?.notificationsEnabled !== false ? 'ENABLED' : 'DISABLED'}`);
        addToHistory(`  API: ${systemSettings?.systemControls?.apiAccessEnabled !== false ? 'ENABLED' : 'DISABLED'}`);
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
          if (controls.tradingEnabled === false) restrictions.push('TRADING DISABLED');
          if (controls.depositsEnabled === false) restrictions.push('DEPOSITS DISABLED');
          if (controls.reportingEnabled === false) restrictions.push('REPORTING DISABLED');
          if (controls.accountCreationEnabled === false) restrictions.push('ACCOUNT CREATION DISABLED');
          if (controls.supportTicketsEnabled === false) restrictions.push('SUPPORT TICKETS DISABLED');
          if (controls.dataExportEnabled === false) restrictions.push('DATA EXPORT DISABLED');
          if (controls.notificationsEnabled === false) restrictions.push('NOTIFICATIONS DISABLED');
          if (controls.apiAccessEnabled === false) restrictions.push('API ACCESS DISABLED');
          
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

      case 'list':
        addToHistory('');
        addToHistory('INVESTOR ACCOUNTS:');
        addToHistory('==================');
        if (investors.length === 0) {
          addToHistory('No investors found.');
        } else {
          investors.forEach((investor, index) => {
            addToHistory(`${index + 1}. ${investor.name}`);
            addToHistory(`   ID: ${investor.id.slice(-8)}`);
            addToHistory(`   Country: ${investor.country}`);
            addToHistory(`   Balance: $${investor.currentBalance.toLocaleString()}`);
            addToHistory(`   Status: ${investor.accountStatus || 'Active'}`);
            addToHistory(`   Type: ${investor.accountType || 'Standard'}`);
            addToHistory('');
          });
          addToHistory(`Total investors: ${investors.length}`);
        }
        addToHistory('');
        break;

      case 'delete':
        if (args.length < 2) {
          addToHistory('ERROR: Usage: delete <investor_name>');
          break;
        }
        
        const deleteTargetName = command.substring(7).trim();
        const deleteTarget = investors.find(inv => 
          inv.name.toLowerCase().includes(deleteTargetName.toLowerCase())
        );
        
        if (!deleteTarget) {
          addToHistory(`ERROR: Investor "${deleteTargetName}" not found.`);
          addToHistory('Use "list" to see available investors.');
          break;
        }
        
        addToHistory('');
        addToHistory(`INITIATING ACCOUNT DELETION FOR: ${deleteTarget.name}`);
        addToHistory('Creating account closure request...');
        
        try {
          await AccountClosureService.createClosureRequest(
            deleteTarget.id,
            deleteTarget.name,
            'Governor terminal deletion command',
            user?.id || 'GOVERNOR',
            deleteTarget.currentBalance
          );
          addToHistory('Account closure request created successfully.');
          addToHistory('90-day deletion process initiated.');
        } catch (error) {
          addToHistory('ERROR: Failed to create account closure request.');
        }
        addToHistory('');
        break;

      case 'movebalance':
        addToHistory('');
        addToHistory('OPENING BALANCE TRANSFER INTERFACE...');
        addToHistory('Loading investor accounts with available balance...');
        setShowMoveBalanceModal(true);
        addToHistory('Balance transfer modal opened.');
        addToHistory('');
        break;

      case 'wipe':
        if (args.length < 2) {
          addToHistory('ERROR: Usage: wipe <investor_name>');
          break;
        }
        
        const wipeTargetName = command.substring(5).trim();
        const wipeTarget = investors.find(inv => 
          inv.name.toLowerCase().includes(wipeTargetName.toLowerCase())
        );
        
        if (!wipeTarget) {
          addToHistory(`ERROR: Investor "${wipeTargetName}" not found.`);
          break;
        }
        
        addToHistory('');
        addToHistory(`WARNING: COMPLETE DATA WIPE FOR: ${wipeTarget.name}`);
        addToHistory('This action is IRREVERSIBLE and will:');
        addToHistory('- Delete all transaction history');
        addToHistory('- Delete all withdrawal records');
        addToHistory('- Delete all messages');
        addToHistory('- Anonymize personal data');
        addToHistory('');
        addToHistory('Type "confirm wipe" to proceed or any other key to cancel.');
        
        // Wait for confirmation
        const confirmInput = await new Promise<string>((resolve) => {
          const handleConfirm = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              const inputElement = inputRef.current;
              if (inputElement) {
                resolve(inputElement.value.toLowerCase().trim());
                inputElement.value = '';
              }
              document.removeEventListener('keydown', handleConfirm);
            }
          };
          document.addEventListener('keydown', handleConfirm);
        });
        
        if (confirmInput === 'confirm wipe') {
          addToHistory('CONFIRMED: Initiating complete data wipe...');
          try {
            await FirestoreService.completeInvestorWipe(
              wipeTarget.id,
              wipeTarget.name,
              user?.id || 'GOVERNOR',
              user?.name || 'Governor'
            );
            addToHistory('COMPLETE DATA WIPE SUCCESSFUL.');
            addToHistory('All investor data has been permanently destroyed.');
          } catch (error) {
            addToHistory('ERROR: Data wipe failed.');
          }
        } else {
          addToHistory('Data wipe cancelled.');
        }
        addToHistory('');
        break;

      case 'suspend':
        if (args.length < 2) {
          addToHistory('ERROR: Usage: suspend <investor_name>');
          break;
        }
        
        const suspendTargetName = command.substring(8).trim();
        const suspendTarget = investors.find(inv => 
          inv.name.toLowerCase().includes(suspendTargetName.toLowerCase())
        );
        
        if (!suspendTarget) {
          addToHistory(`ERROR: Investor "${suspendTargetName}" not found.`);
          break;
        }
        
        addToHistory('');
        addToHistory(`SUSPENDING ACCOUNT: ${suspendTarget.name}`);
        
        try {
          await FirestoreService.updateInvestor(suspendTarget.id, {
            accountStatus: 'SUSPENDED BY GOVERNOR TERMINAL',
            isActive: false,
            accountFlags: {
              ...suspendTarget.accountFlags,
              governorSuspended: true,
              suspendedAt: new Date().toISOString(),
              suspendedBy: 'GOVERNOR TERMINAL'
            }
          });
          addToHistory('Account suspended successfully.');
        } catch (error) {
          addToHistory('ERROR: Failed to suspend account.');
        }
        addToHistory('');
        break;

      case 'activate':
        if (args.length < 2) {
          addToHistory('ERROR: Usage: activate <investor_name>');
          break;
        }
        
        const activateTargetName = command.substring(9).trim();
        const activateTarget = investors.find(inv => 
          inv.name.toLowerCase().includes(activateTargetName.toLowerCase())
        );
        
        if (!activateTarget) {
          addToHistory(`ERROR: Investor "${activateTargetName}" not found.`);
          break;
        }
        
        addToHistory('');
        addToHistory(`ACTIVATING ACCOUNT: ${activateTarget.name}`);
        
        try {
          await FirestoreService.updateInvestor(activateTarget.id, {
            accountStatus: 'Active',
            isActive: true,
            accountFlags: {
              ...activateTarget.accountFlags,
              governorSuspended: false,
              activatedAt: new Date().toISOString(),
              activatedBy: 'GOVERNOR TERMINAL'
            }
          });
          addToHistory('Account activated successfully.');
        } catch (error) {
          addToHistory('ERROR: Failed to activate account.');
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
            await loadSystemSettings();
          }
        } catch (error) {
          addToHistory('ERROR: Emergency shutdown failed.');
        }
        break;

      case 'lockdown':
        if (!confirm('COMPLETE PLATFORM LOCKDOWN: This will disable ALL admin and investor access while preserving Governor access. Continue?')) {
          addToHistory('Platform lockdown cancelled by Governor.');
          break;
        }
        
        addToHistory('');
        addToHistory('INITIATING COMPLETE PLATFORM LOCKDOWN...');
        addToHistory('Disabling all admin functions...');
        addToHistory('Disabling all investor functions...');
        addToHistory('Preserving Governor access...');
        
        try {
          if (user && systemSettings) {
            await FirestoreService.updateSystemControls({
              withdrawalsEnabled: false,
              messagingEnabled: false,
              profileUpdatesEnabled: false,
              loginEnabled: false,
              tradingEnabled: false,
              depositsEnabled: false,
              reportingEnabled: false,
              accountCreationEnabled: false,
              supportTicketsEnabled: false,
              dataExportEnabled: false,
              notificationsEnabled: false,
              apiAccessEnabled: false,
              restrictedMode: true,
              allowedPages: ['/governor', '/governor/*'],
              restrictionReason: 'COMPLETE PLATFORM LOCKDOWN ACTIVATED BY GOVERNOR',
              restrictionLevel: 'full'
            }, user.id, user.name);
            
            addToHistory('PLATFORM LOCKDOWN COMPLETED.');
            addToHistory('All admin and investor access disabled.');
            addToHistory('Governor access preserved.');
            await loadSystemSettings();
          }
        } catch (error) {
          addToHistory('ERROR: Platform lockdown failed.');
        }
        break;

      case 'unlock':
        if (!confirm('UNLOCK ALL SYSTEMS: This will restore full platform access. Continue?')) {
          addToHistory('System unlock cancelled by Governor.');
          break;
        }
        
        addToHistory('');
        addToHistory('UNLOCKING ALL SYSTEMS...');
        addToHistory('Restoring admin access...');
        addToHistory('Restoring investor access...');
        addToHistory('Enabling all functions...');
        
        try {
          if (user && systemSettings) {
            await FirestoreService.updateSystemControls({
              withdrawalsEnabled: true,
              messagingEnabled: true,
              profileUpdatesEnabled: true,
              loginEnabled: true,
              tradingEnabled: true,
              depositsEnabled: true,
              reportingEnabled: true,
              accountCreationEnabled: true,
              supportTicketsEnabled: true,
              dataExportEnabled: true,
              notificationsEnabled: true,
              apiAccessEnabled: true,
              restrictedMode: false,
              allowedPages: [],
              restrictionReason: '',
              restrictionLevel: 'none'
            }, user.id, user.name);
            
            await FirestoreService.updateSystemSetting(
              'maintenanceMode',
              false,
              user.id,
              user.name,
              systemSettings.maintenanceMode
            );
            
            addToHistory('ALL SYSTEMS UNLOCKED.');
            addToHistory('Full platform access restored.');
            await loadSystemSettings();
          }
        } catch (error) {
          addToHistory('ERROR: System unlock failed.');
        }
        break;

      default:
        // Handle multi-word commands
        if (cmd.startsWith('restrict ')) {
          const restrictArgs = command.split(' ');
          if (restrictArgs.length < 2) {
            addToHistory('ERROR: Usage: restrict <level>');
            addToHistory('Available levels: none, partial, full');
            break;
          }
          
          const level = restrictArgs[1].toLowerCase();
          if (!['none', 'partial', 'full'].includes(level)) {
            addToHistory('ERROR: Invalid restriction level.');
            addToHistory('Available levels: none, partial, full');
            break;
          }
          
          addToHistory('');
          addToHistory(`SETTING RESTRICTION LEVEL TO: ${level.toUpperCase()}`);
          
          try {
            if (user && systemSettings) {
              let controls = { ...systemSettings.systemControls };
              
              switch (level) {
                case 'none':
                  controls = {
                    ...controls,
                    withdrawalsEnabled: true,
                    messagingEnabled: true,
                    profileUpdatesEnabled: true,
                    loginEnabled: true,
                    tradingEnabled: true,
                    depositsEnabled: true,
                    reportingEnabled: true,
                    accountCreationEnabled: true,
                    supportTicketsEnabled: true,
                    dataExportEnabled: true,
                    notificationsEnabled: true,
                    apiAccessEnabled: true,
                    restrictedMode: false,
                    allowedPages: [],
                    restrictionReason: '',
                    restrictionLevel: 'none'
                  };
                  break;
                case 'partial':
                  controls = {
                    ...controls,
                    withdrawalsEnabled: false,
                    profileUpdatesEnabled: false,
                    depositsEnabled: false,
                    messagingEnabled: true,
                    loginEnabled: true,
                    tradingEnabled: true,
                    reportingEnabled: true,
                    accountCreationEnabled: true,
                    supportTicketsEnabled: true,
                    dataExportEnabled: true,
                    notificationsEnabled: true,
                    apiAccessEnabled: true,
                    restrictedMode: true,
                    allowedPages: ['/governor', '/admin'],
                    restrictionReason: 'PARTIAL RESTRICTIONS APPLIED BY GOVERNOR',
                    restrictionLevel: 'partial'
                  };
                  break;
                case 'full':
                  controls = {
                    ...controls,
                    withdrawalsEnabled: false,
                    messagingEnabled: false,
                    profileUpdatesEnabled: false,
                    loginEnabled: false,
                    tradingEnabled: false,
                    depositsEnabled: false,
                    reportingEnabled: false,
                    accountCreationEnabled: false,
                    supportTicketsEnabled: false,
                    dataExportEnabled: false,
                    notificationsEnabled: false,
                    apiAccessEnabled: false,
                    restrictedMode: true,
                    allowedPages: ['/governor'],
                    restrictionReason: 'FULL PLATFORM LOCKDOWN BY GOVERNOR',
                    restrictionLevel: 'full'
                  };
                  break;
              }
              
              await FirestoreService.updateSystemControls(controls, user.id, user.name);
              addToHistory(`RESTRICTION LEVEL SET TO: ${level.toUpperCase()}`);
              await loadSystemSettings();
            }
          } catch (error) {
            addToHistory(`ERROR: Failed to set restriction level to ${level}.`);
          }
        } else if (cmd.startsWith('disable ')) {
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
      'login': 'loginEnabled',
      'trading': 'tradingEnabled',
      'deposits': 'depositsEnabled',
      'reporting': 'reportingEnabled',
      'accounts': 'accountCreationEnabled',
      'tickets': 'supportTicketsEnabled',
      'exports': 'dataExportEnabled',
      'notifications': 'notificationsEnabled',
      'api': 'apiAccessEnabled'
    };

    const settingKey = functionMap[func];
    if (!settingKey) {
      addToHistory(`ERROR: Unknown function '${func}'`);
      addToHistory('Available functions: withdrawals, messaging, profiles, login, trading, deposits, reporting, accounts, tickets, exports, notifications, api');
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
      {/* PIN Entry Style Terminal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border border-gray-300 shadow-xl"
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
          style={{
            background: '#ffffff'
          }}
        >
          <div className="flex items-center space-x-2 w-full justify-center">
            <div className="w-4 h-4 bg-white border border-black flex items-center justify-center">
              <span className="text-black text-xs font-bold">GT</span>
            </div>
            <span>Interactive Brokers Governor Control Terminal</span>
          </div>
        </div>
        
        {/* Terminal Content Area */}
        <div className="p-4 bg-white relative">
          {/* Background logo overlay - 50% opacity */}
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
            className="relative h-64 sm:h-96 overflow-y-auto font-mono text-xs sm:text-sm p-3 bg-white border-2 overflow-x-hidden"
            style={{
              borderTopColor: '#808080',
              borderLeftColor: '#808080',
              borderRightColor: '#ffffff',
              borderBottomColor: '#ffffff',
              zIndex: 2
            }}
          >
            {/* Static Interactive Brokers Logo Background - Fixed to terminal container */}
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ 
                zIndex: 1,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <img 
                src="/Screenshot 2025-06-07 024813.png" 
                alt="Interactive Brokers" 
                className="h-6 sm:h-8 w-auto object-contain"
                style={{ 
                  opacity: 0.3,
                  position: 'fixed',
                  pointerEvents: 'none'
                }}
              />
            </div>
            
            {/* Terminal content */}
            <div className="relative z-10">
              {commandHistory.map((line, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1, delay: index * 0.02 }}
                  className="whitespace-pre-wrap leading-tight text-black"
                  style={{
                    fontFamily: 'Courier New, monospace'
                  }}
                >
                  {line}
                </motion.div>
              ))}
              
              {/* Current Input Line */}
              <form onSubmit={handleSubmit} className="flex items-center mt-2">
                <span 
                  className="mr-2 text-black"
                  style={{
                    fontFamily: 'Courier New, monospace'
                  }}
                >
                  {"C:\\GOVERNOR>"}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none font-mono text-xs sm:text-sm text-black"
                  disabled={isProcessing}
                  autoComplete="off"
                  spellCheck={false}
                  style={{ 
                    fontFamily: 'Courier New, monospace',
                    caretColor: '#000000'
                  }}
                />
                {/* Blinking cursor */}
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
          style={{
            borderTopColor: '#ffffff'
          }}
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
      </motion.div>

      {/* System Restrictions Panel - Windows 95 Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white border border-gray-300 shadow-xl"
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
              <span className="text-black text-xs font-bold">SC</span>
            </div>
            <span>Interactive Brokers System Controls</span>
          </div>
        </div>

        {/* Control Panel Content */}
        <div className="p-4 bg-white relative" style={{ fontFamily: 'MS Sans Serif, sans-serif' }}>
          {/* Background logo overlay - 50% opacity */}
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
          
          <div className="relative z-10">
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
                  { key: 'accountCreationEnabled', label: 'Account Creation' },
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
      </motion.div>

      {/* Move Balance Modal */}
      <Modal
        isOpen={showMoveBalanceModal}
        onClose={() => setShowMoveBalanceModal(false)}
        title="Transfer Investor Balance to Admin Commission"
      >
        <div className="p-4">
          <p className="text-gray-600 mb-4">
            Select an investor to transfer their balance to admin commission.
          </p>
          <div className="space-y-2">
            {investors.filter(inv => inv.currentBalance > 0).map(investor => (
              <div key={investor.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{investor.name}</p>
                    <p className="text-sm text-gray-500">Balance: ${investor.currentBalance.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => {
                      // Handle balance transfer logic here
                      console.log('Transfer balance for:', investor.name);
                      setShowMoveBalanceModal(false);
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                  >
                    Transfer Balance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GovernorTerminalControl;