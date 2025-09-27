import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FirestoreService } from '../../services/firestoreService';
import { useSystemControls } from '../../hooks/useSystemControls';
import { SystemSettings } from '../../types/user';
import { TestTube, CircleCheck as CheckCircle, Circle as XCircle, TriangleAlert as AlertTriangle, Shield, MessageSquareOff, CreditCard, UserX, Lock, Clock as Unlock, RefreshCw, Eye, Settings } from 'lucide-react';

const RestrictionTestingPanel = () => {
  const { user } = useAuth();
  const { 
    systemSettings, 
    isWithdrawalsEnabled, 
    isMessagingEnabled, 
    isProfileUpdatesEnabled,
    isLoginEnabled,
    getRestrictionMessage,
    getRestrictionLevel 
  } = useSystemControls();
  
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [lastTestRun, setLastTestRun] = useState<Date | null>(null);

  const runRestrictionTests = async () => {
    if (!user || !systemSettings) return;
    
    setIsRunningTests(true);
    const results = [];
    
    // Test 1: Withdrawal Restrictions
    results.push({
      test: 'Withdrawal System',
      enabled: isWithdrawalsEnabled(),
      setting: systemSettings.systemControls?.withdrawalsEnabled,
      status: isWithdrawalsEnabled() ? 'ENABLED' : 'DISABLED',
      impact: 'Affects withdrawal forms and processing in investor app'
    });

    // Test 2: Messaging Restrictions
    results.push({
      test: 'Messaging System',
      enabled: isMessagingEnabled(),
      setting: systemSettings.systemControls?.messagingEnabled,
      status: isMessagingEnabled() ? 'ENABLED' : 'DISABLED',
      impact: 'Affects messaging interface in investor app'
    });

    // Test 3: Profile Update Restrictions
    results.push({
      test: 'Profile Updates',
      enabled: isProfileUpdatesEnabled(),
      setting: systemSettings.systemControls?.profileUpdatesEnabled,
      status: isProfileUpdatesEnabled() ? 'ENABLED' : 'DISABLED',
      impact: 'Affects profile editing forms in investor app'
    });

    // Test 4: Login Restrictions
    results.push({
      test: 'Login Access',
      enabled: isLoginEnabled(),
      setting: systemSettings.systemControls?.loginEnabled,
      status: isLoginEnabled() ? 'ENABLED' : 'DISABLED',
      impact: 'Affects investor login capability'
    });

    // Test 5: Restricted Mode
    results.push({
      test: 'Restricted Mode',
      enabled: !systemSettings.systemControls?.restrictedMode,
      setting: systemSettings.systemControls?.restrictedMode,
      status: systemSettings.systemControls?.restrictedMode ? 'ACTIVE' : 'INACTIVE',
      impact: 'Global platform access restrictions'
    });

    // Test 6: Maintenance Mode
    results.push({
      test: 'Maintenance Mode',
      enabled: !systemSettings.maintenanceMode,
      setting: systemSettings.maintenanceMode,
      status: systemSettings.maintenanceMode ? 'ACTIVE' : 'INACTIVE',
      impact: 'Complete platform lockdown'
    });

    setTestResults(results);
    setLastTestRun(new Date());
    setIsRunningTests(false);
  };

  const quickToggleRestriction = async (
    settingKey: keyof SystemSettings['systemControls'],
    currentValue: boolean,
    functionName: string
  ) => {
    if (!user || !systemSettings) return;

    try {
      const updatedControls = {
        ...systemSettings.systemControls,
        [settingKey]: !currentValue
      };

      await FirestoreService.updateSystemControls(
        updatedControls,
        user.id,
        user.name
      );

      // Re-run tests after change
      setTimeout(() => {
        runRestrictionTests();
      }, 1000);
    } catch (error) {
      console.error(`Error toggling ${functionName}:`, error);
      alert(`Failed to toggle ${functionName}. Please try again.`);
    }
  };

  useEffect(() => {
    if (systemSettings) {
      runRestrictionTests();
    }
  }, [systemSettings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-300 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 border border-gray-400 rounded-lg flex items-center justify-center">
              <TestTube size={24} className="text-gray-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">RESTRICTION TESTING PANEL</h1>
              <p className="text-gray-600 uppercase tracking-wide text-sm font-medium">VERIFY GOVERNOR RESTRICTIONS ARE PROPERLY APPLIED</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={runRestrictionTests}
              disabled={isRunningTests}
              className="px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 uppercase tracking-wide border border-blue-700"
            >
              <RefreshCw size={16} className={`mr-2 inline ${isRunningTests ? 'animate-spin' : ''}`} />
              {isRunningTests ? 'TESTING...' : 'RUN TESTS'}
            </button>
            {lastTestRun && (
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide">LAST TEST</p>
                <p className="text-sm font-bold text-gray-900">{lastTestRun.toLocaleTimeString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Restriction Status */}
      <div className="bg-white border border-gray-300">
        <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">CURRENT RESTRICTION STATUS</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wide">RESTRICTION LEVEL</h4>
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    getRestrictionLevel() === 'full' ? 'bg-red-500' :
                    getRestrictionLevel() === 'partial' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <span className="font-bold text-gray-900 uppercase tracking-wide">
                    {getRestrictionLevel().toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wide">RESTRICTION MESSAGE</h4>
                <p className="text-gray-700 text-sm font-medium">
                  {getRestrictionMessage()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wide">MAINTENANCE STATUS</h4>
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    systemSettings?.maintenanceMode ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                  }`}></div>
                  <span className="font-bold text-gray-900 uppercase tracking-wide">
                    {systemSettings?.maintenanceMode ? 'MAINTENANCE ACTIVE' : 'OPERATIONAL'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wide">LAST UPDATED</h4>
                <p className="text-gray-700 text-sm font-medium">
                  {systemSettings?.updatedAt?.toLocaleString() || 'Unknown'}
                </p>
                <p className="text-gray-600 text-xs uppercase tracking-wide">
                  BY: {systemSettings?.updatedBy || 'System'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white border border-gray-300">
        <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
            RESTRICTION TEST RESULTS ({testResults.length} TESTS)
          </h3>
        </div>
        
        {testResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">FUNCTION</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wide">STATUS</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wide">FIREBASE VALUE</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">INVESTOR APP IMPACT</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wide">QUICK TOGGLE</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((result, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-gray-300 ${
                          result.enabled ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {result.test === 'Withdrawal System' && <CreditCard size={16} className={result.enabled ? 'text-green-600' : 'text-red-600'} />}
                          {result.test === 'Messaging System' && <MessageSquareOff size={16} className={result.enabled ? 'text-green-600' : 'text-red-600'} />}
                          {result.test === 'Profile Updates' && <UserX size={16} className={result.enabled ? 'text-green-600' : 'text-red-600'} />}
                          {result.test === 'Login Access' && <Lock size={16} className={result.enabled ? 'text-green-600' : 'text-red-600'} />}
                          {result.test === 'Restricted Mode' && <Shield size={16} className={result.enabled ? 'text-green-600' : 'text-red-600'} />}
                          {result.test === 'Maintenance Mode' && <Settings size={16} className={result.enabled ? 'text-green-600' : 'text-red-600'} />}
                        </div>
                        <span className="font-bold text-gray-900 uppercase tracking-wide">{result.test}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {result.enabled ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-red-600" />
                        )}
                        <span className={`px-3 py-1 text-xs font-bold border uppercase tracking-wide ${
                          result.enabled 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono text-sm font-bold text-gray-900">
                        {result.setting === true ? 'TRUE' : 
                         result.setting === false ? 'FALSE' : 
                         result.setting === null ? 'NULL' : 
                         String(result.setting)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 font-medium">{result.impact}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(result.test === 'Withdrawal System' || 
                        result.test === 'Messaging System' || 
                        result.test === 'Profile Updates' || 
                        result.test === 'Login Access') && (
                        <button
                          onClick={() => {
                            const settingMap: Record<string, keyof SystemSettings['systemControls']> = {
                              'Withdrawal System': 'withdrawalsEnabled',
                              'Messaging System': 'messagingEnabled',
                              'Profile Updates': 'profileUpdatesEnabled',
                              'Login Access': 'loginEnabled'
                            };
                            const settingKey = settingMap[result.test];
                            if (settingKey) {
                              quickToggleRestriction(settingKey, result.enabled, result.test);
                            }
                          }}
                          className={`px-3 py-1 text-xs font-bold border transition-colors uppercase tracking-wide ${
                            result.enabled
                              ? 'bg-red-600 text-white border-red-700 hover:bg-red-700'
                              : 'bg-green-600 text-white border-green-700 hover:bg-green-700'
                          }`}
                        >
                          {result.enabled ? 'DISABLE' : 'ENABLE'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TestTube size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">NO TEST RESULTS</h3>
            <p className="text-gray-500 uppercase tracking-wide text-sm">Click "RUN TESTS" to verify restriction status</p>
          </div>
        )}
      </div>

      {/* Testing Instructions */}
      <div className="bg-white border border-gray-300">
        <div className="px-6 py-4 border-b border-gray-300 bg-blue-50">
          <h3 className="text-lg font-bold text-blue-900 uppercase tracking-wide">TESTING INSTRUCTIONS</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-800 mb-3 uppercase tracking-wide">HOW TO TEST RESTRICTIONS</h4>
              <ol className="text-blue-700 text-sm space-y-2 list-decimal list-inside font-medium">
                <li className="uppercase tracking-wide">DISABLE A FUNCTION USING THE QUICK TOGGLE BUTTONS ABOVE</li>
                <li className="uppercase tracking-wide">OPEN YOUR INVESTOR-SIDE APPLICATION IN A NEW TAB</li>
                <li className="uppercase tracking-wide">LOGIN AS AN INVESTOR AND VERIFY THE RESTRICTION IS APPLIED</li>
                <li className="uppercase tracking-wide">CHECK THAT FUNCTIONALITY GUARD COMPONENTS SHOW RESTRICTION MESSAGES</li>
                <li className="uppercase tracking-wide">VERIFY SYSTEM RESTRICTION BANNERS APPEAR AT THE TOP OF PAGES</li>
                <li className="uppercase tracking-wide">RE-ENABLE THE FUNCTION AND VERIFY IT WORKS AGAIN</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-bold text-yellow-800 mb-3 uppercase tracking-wide">WHAT TO VERIFY IN INVESTOR APP</h4>
              <ul className="text-yellow-700 text-sm space-y-1 list-disc list-inside font-medium">
                <li className="uppercase tracking-wide">WITHDRAWAL FORMS SHOULD BE HIDDEN/DISABLED WHEN WITHDRAWALS ARE DISABLED</li>
                <li className="uppercase tracking-wide">MESSAGING INTERFACE SHOULD SHOW RESTRICTION MESSAGE WHEN MESSAGING IS DISABLED</li>
                <li className="uppercase tracking-wide">PROFILE EDIT FORMS SHOULD BE BLOCKED WHEN PROFILE UPDATES ARE DISABLED</li>
                <li className="uppercase tracking-wide">LOGIN SHOULD BE BLOCKED WHEN LOGIN IS DISABLED</li>
                <li className="uppercase tracking-wide">RESTRICTION BANNERS SHOULD APPEAR AT THE TOP OF ALL PAGES</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-bold text-red-800 mb-3 uppercase tracking-wide">EMERGENCY TESTING</h4>
              <p className="text-red-700 text-sm font-medium uppercase tracking-wide">
                TO TEST COMPLETE PLATFORM LOCKDOWN, ENABLE MAINTENANCE MODE OR ACTIVATE FULL RESTRICTED MODE. 
                THIS WILL BLOCK ALL INVESTOR ACCESS EXCEPT GOVERNOR PAGES.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Firebase Data */}
      <div className="bg-white border border-gray-300">
        <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">LIVE FIREBASE DATA</h3>
        </div>
        <div className="p-6">
          <div className="bg-gray-900 text-green-400 p-6 border border-gray-700 font-mono text-xs">
            <div className="mb-4">
              <h4 className="text-white font-bold uppercase tracking-wide">SYSTEMSETTINGS/MAIN DOCUMENT</h4>
            </div>
            <pre className="whitespace-pre-wrap overflow-x-auto">
{JSON.stringify({
  maintenanceMode: systemSettings?.maintenanceMode,
  maintenanceMessage: systemSettings?.maintenanceMessage,
  systemControls: systemSettings?.systemControls,
  minWithdrawal: systemSettings?.minWithdrawal,
  maxWithdrawal: systemSettings?.maxWithdrawal,
  commissionRate: systemSettings?.commissionRate,
  securityLevel: systemSettings?.securityLevel,
  requireW8Ben: systemSettings?.requireW8Ben,
  updatedAt: systemSettings?.updatedAt?.toISOString(),
  updatedBy: systemSettings?.updatedBy
}, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

};

export default RestrictionTestingPanel;