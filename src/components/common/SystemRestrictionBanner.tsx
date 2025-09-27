import { motion } from 'framer-motion';
import { useSystemControls } from '../../hooks/useSystemControls';
import { 
  AlertTriangle, 
  Shield, 
  Lock, 
  MessageSquareOff, 
  CreditCardOff, 
  UserX,
  Settings,
  Info
} from 'lucide-react';

interface SystemRestrictionBannerProps {
  currentPage?: string;
}

const SystemRestrictionBanner = ({ currentPage }: SystemRestrictionBannerProps) => {
  const { 
    systemSettings, 
    isWithdrawalsEnabled, 
    isMessagingEnabled, 
    isProfileUpdatesEnabled,
    getRestrictionMessage,
    getRestrictionLevel 
  } = useSystemControls();

  if (!systemSettings?.systemControls?.restrictedMode) {
    return null;
  }

  const restrictionLevel = getRestrictionLevel();
  const restrictionMessage = getRestrictionMessage();

  const getRestrictionIcon = () => {
    switch (restrictionLevel) {
      case 'full':
        return <Lock size={20} className="text-red-600" />;
      case 'partial':
        return <Shield size={20} className="text-amber-600" />;
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getRestrictionStyles = () => {
    switch (restrictionLevel) {
      case 'full':
        return 'bg-red-50 border-red-500 border border-red-200';
      case 'partial':
        return 'bg-amber-50 border-amber-500 border border-amber-200';
      default:
        return 'bg-blue-50 border-blue-500 border border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (restrictionLevel) {
      case 'full':
        return 'text-red-800';
      case 'partial':
        return 'text-amber-800';
      default:
        return 'text-blue-800';
    }
  };

  const getMessageColor = () => {
    switch (restrictionLevel) {
      case 'full':
        return 'text-red-700';
      case 'partial':
        return 'text-amber-700';
      default:
        return 'text-blue-700';
    }
  };

  const getDisabledFunctionalities = () => {
    const disabled = [];
    if (!isWithdrawalsEnabled()) disabled.push({ icon: <CreditCardOff size={14} />, text: 'WITHDRAWALS' });
    if (!isMessagingEnabled()) disabled.push({ icon: <MessageSquareOff size={14} />, text: 'MESSAGING' });
    if (!isProfileUpdatesEnabled()) disabled.push({ icon: <UserX size={14} />, text: 'PROFILE UPDATES' });
    return disabled;
  };

  const disabledFunctionalities = getDisabledFunctionalities();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -20, height: 0 }}
      transition={{ duration: 0.3 }}
      className={`border-l-4 p-4 mb-4 rounded-lg ${getRestrictionStyles()}`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
          {getRestrictionIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className={`text-lg font-bold uppercase tracking-wide ${getTextColor()}`}>
              SYSTEM RESTRICTIONS ACTIVE
            </h3>
            <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
              restrictionLevel === 'full' ? 'bg-red-100 text-red-800' :
              restrictionLevel === 'partial' ? 'bg-amber-100 text-amber-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {restrictionLevel.toUpperCase()} RESTRICTION
            </span>
            <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800 uppercase tracking-wide">
              <Settings size={10} className="mr-1 inline" />
              GOVERNOR CONTROL
            </span>
          </div>
          
          <p className={`text-sm leading-relaxed mb-3 uppercase tracking-wide font-medium ${getMessageColor()}`}>
            {restrictionMessage}
          </p>
          
          {disabledFunctionalities.length > 0 && (
            <div className="flex items-center space-x-4 text-xs">
              <span className={`font-medium uppercase tracking-wide ${getMessageColor()}`}>
                DISABLED FUNCTIONS:
              </span>
              <div className="flex items-center space-x-3">
                {disabledFunctionalities.map((func, index) => (
                  <div key={index} className={`flex items-center space-x-1 ${getMessageColor()}`}>
                    {func.icon}
                    <span className="uppercase tracking-wide font-medium">{func.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-xs mt-2">
            <span className={`uppercase tracking-wide ${getMessageColor()}`}>
              UPDATED: {systemSettings?.updatedAt?.toLocaleString()}
            </span>
            <span className={`uppercase tracking-wide ${getMessageColor()}`}>
              BY: {systemSettings?.updatedBy}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SystemRestrictionBanner;