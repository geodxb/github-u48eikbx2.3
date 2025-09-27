import { ReactNode } from 'react';
import { useSystemControls } from '../../hooks/useSystemControls';
import { TriangleAlert as AlertTriangle, Lock, Shield } from 'lucide-react';

interface FunctionalityGuardProps {
  children: ReactNode;
  functionality: 'withdrawals' | 'messaging' | 'profileUpdates' | 'trading' | 'deposits' | 'reporting' | 'accountCreation' | 'supportTickets' | 'dataExport' | 'notifications' | 'apiAccess';
  fallbackMessage?: string;
  showFallback?: boolean;
}

const FunctionalityGuard = ({ 
  children, 
  functionality, 
  fallbackMessage,
  showFallback = true 
}: FunctionalityGuardProps) => {
  const { 
    isWithdrawalsEnabled, 
    isMessagingEnabled, 
    isProfileUpdatesEnabled,
    isTradingEnabled,
    isDepositsEnabled,
    isReportingEnabled,
    isAccountCreationEnabled,
    isSupportTicketsEnabled,
    isDataExportEnabled,
    isNotificationsEnabled,
    isApiAccessEnabled,
    getRestrictionMessage,
    getRestrictionLevel 
  } = useSystemControls();

  const isEnabled = () => {
    switch (functionality) {
      case 'withdrawals':
        return isWithdrawalsEnabled();
      case 'messaging':
        return isMessagingEnabled();
      case 'profileUpdates':
        return isProfileUpdatesEnabled();
      case 'trading':
        return isTradingEnabled();
      case 'deposits':
        return isDepositsEnabled();
      case 'reporting':
        return isReportingEnabled();
      case 'accountCreation':
        return isAccountCreationEnabled();
      case 'supportTickets':
        return isSupportTicketsEnabled();
      case 'dataExport':
        return isDataExportEnabled();
      case 'notifications':
        return isNotificationsEnabled();
      case 'apiAccess':
        return isApiAccessEnabled();
      default:
        return true;
    }
  };

  const getFunctionalityLabel = () => {
    switch (functionality) {
      case 'withdrawals':
        return 'WITHDRAWAL FUNCTIONALITY';
      case 'messaging':
        return 'MESSAGING SYSTEM';
      case 'profileUpdates':
        return 'PROFILE UPDATES';
      case 'trading':
        return 'TRADING SYSTEM';
      case 'deposits':
        return 'DEPOSIT SYSTEM';
      case 'reporting':
        return 'REPORTING SYSTEM';
      case 'accountCreation':
        return 'ACCOUNT CREATION';
      case 'supportTickets':
        return 'SUPPORT TICKETS';
      case 'dataExport':
        return 'DATA EXPORT';
      case 'notifications':
        return 'NOTIFICATIONS';
      case 'apiAccess':
        return 'API ACCESS';
      default:
        return 'FUNCTIONALITY';
    }
  };

  const getFunctionalityIcon = () => {
    switch (functionality) {
      case 'withdrawals':
        return <Lock size={20} className="text-red-600" />;
      case 'messaging':
        return <Shield size={20} className="text-amber-600" />;
      case 'profileUpdates':
        return <AlertTriangle size={20} className="text-purple-600" />;
      case 'trading':
        return <Lock size={20} className="text-blue-600" />;
      case 'deposits':
        return <Lock size={20} className="text-green-600" />;
      case 'reporting':
        return <Lock size={20} className="text-indigo-600" />;
      case 'accountCreation':
        return <Lock size={20} className="text-orange-600" />;
      case 'supportTickets':
        return <Lock size={20} className="text-pink-600" />;
      case 'dataExport':
        return <Lock size={20} className="text-teal-600" />;
      case 'notifications':
        return <Lock size={20} className="text-cyan-600" />;
      case 'apiAccess':
        return <Lock size={20} className="text-violet-600" />;
      default:
        return <Lock size={20} className="text-gray-600" />;
    }
  };

  if (isEnabled()) {
    return <>{children}</>;
  }

  if (!showFallback) {
    return null;
  }

  const restrictionLevel = getRestrictionLevel();
  const message = fallbackMessage || getRestrictionMessage();

  return (
    <div className={`rounded-lg border-l-4 p-6 ${
      restrictionLevel === 'full' ? 'bg-red-50 border-red-500 border border-red-200' :
      restrictionLevel === 'partial' ? 'bg-amber-50 border-amber-500 border border-amber-200' :
      'bg-blue-50 border-blue-500 border border-blue-200'
    }`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
          {getFunctionalityIcon()}
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-bold uppercase tracking-wide mb-2 ${
            restrictionLevel === 'full' ? 'text-red-800' :
            restrictionLevel === 'partial' ? 'text-amber-800' :
            'text-blue-800'
          }`}>
            {getFunctionalityLabel()} RESTRICTED
          </h3>
          <p className={`text-sm leading-relaxed uppercase tracking-wide font-medium ${
            restrictionLevel === 'full' ? 'text-red-700' :
            restrictionLevel === 'partial' ? 'text-amber-700' :
            'text-blue-700'
          }`}>
            {message}
          </p>
          <div className="mt-3 flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
              restrictionLevel === 'full' ? 'bg-red-100 text-red-800' :
              restrictionLevel === 'partial' ? 'bg-amber-100 text-amber-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {restrictionLevel.toUpperCase()} RESTRICTION
            </span>
            <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800 uppercase tracking-wide">
              GOVERNOR CONTROL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunctionalityGuard;