import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConversationList from '../../components/messaging/ConversationList';
import MessageThread from '../../components/messaging/MessageThread';
import { MessageService } from '../../services/messageService';
import { useAuth } from '../../contexts/AuthContext';
import { useInvestors } from '../../hooks/useFirestore';
import { MessageSquare, Send, Users, Shield, Building, AlertTriangle, DollarSign, User, RefreshCw } from 'lucide-react';
import FunctionalityGuard from '../../components/common/FunctionalityGuard';

const MessagesPage = () => {
  const { user, setGlobalLoading } = useAuth();
  const { investors } = useInvestors();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('general');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messagingError, setMessagingError] = useState<string | null>(null);

  // Department options for Admin
  const departments = [
    { id: 'general', label: 'GENERAL ASSISTANCE', icon: <User size={16} />, color: 'text-gray-700' },
    { id: 'finance', label: 'FINANCE SUPPORT', icon: <DollarSign size={16} />, color: 'text-green-700' },
    { id: 'account', label: 'ACCOUNT MANAGEMENT', icon: <Building size={16} />, color: 'text-blue-700' },
    { id: 'compliance', label: 'COMPLIANCE REVIEW', icon: <Shield size={16} />, color: 'text-purple-700' },
    { id: 'technical', label: 'TECHNICAL SUPPORT', icon: <Users size={16} />, color: 'text-indigo-700' },
    { id: 'urgent', label: 'URGENT MATTERS', icon: <AlertTriangle size={16} />, color: 'text-red-700' }
  ];

  // Get all possible recipients (all investors)
  const getAllRecipients = () => {
    try {
    const recipients: any[] = [];

    // Add single Management Team option
    recipients.push({
      id: 'management_team',
      name: 'Management Team',
      type: 'governor',
      email: 'sam@interactivebrokers.us',
      role: 'governor',
      title: 'Management Team'
    });

    // Add all investors
    investors.forEach(investor => {
      recipients.push({
        id: investor.id,
        name: investor.name,
        type: 'investor',
        email: investor.email || '',
        country: investor.country,
        accountStatus: investor.accountStatus || 'Active',
        currentBalance: investor.currentBalance
      });
    });

    return recipients;
    } catch (error) {
      console.error('Error getting recipients:', error);
      setMessagingError('Failed to load message recipients');
      return [];
    }
  };

  // Auto-create or find conversation for investor users - REMOVED INVESTOR-SPECIFIC LOGIC
  useEffect(() => {
    // No auto-creation for investors as they don't log into this dashboard
  }, [user]);

  const handleNewConversation = async () => {
    // This function is now primarily for admin to initiate new conversations
    setShowNewMessageForm(true);
    setSelectedRecipient(null);
    setNewMessageContent('');
    setSelectedDepartment('general');
  };

  const handleSendNewMessage = async () => {
    if (!newMessageContent.trim() || !user) return;
    
    // For admin users, require recipient selection
    if (user.role === 'admin' && !selectedRecipient) {
      setMessagingError('Please select a recipient for your message');
      return;
    }

    setMessagingError(null);
    setIsLoading(true);
    
    try {
      if (user.role === 'admin' && selectedRecipient) {
        const selectedDept = departments.find(d => d.id === selectedDepartment);
        const departmentLabel = selectedDept?.label || 'GENERAL ASSISTANCE';
        
        console.log('🔄 Admin sending message to:', selectedRecipient.id === 'management_team' ? 'Management Team' : selectedRecipient.name, 'Department:', departmentLabel);
        
        let targetUserId = selectedRecipient.id;
        let targetUserName = selectedRecipient.name;
        let targetUserRole = selectedRecipient.role; // Get role from selected recipient
        
        // Route Management Team to Sam Hivanek
        if (selectedRecipient.id === 'management_team') {
          targetUserId = '2cSQTHfSSPUXAVaSKGl8zdO9hiC3'; // Sam's Firebase UID
          targetUserName = 'Sam Hivanek';
          targetUserRole = 'governor';
        }
        
        // Create conversation with the target user
        const actualConversationId = await MessageService.getOrCreateConversation(
          user.id,
          `Admin - ${departmentLabel}`,
          'admin',
          targetUserId
        );
        
        // Send the message
        await MessageService.sendMessage(
          user.id,
          `Admin - ${departmentLabel}`,
          'admin',
          newMessageContent.trim(),
          actualConversationId,
          undefined,
          'medium',
          departmentLabel
        );
        
        console.log('✅ Admin message sent with department context to:', targetUserName);
        
        setSelectedConversationId(actualConversationId);
      } else {
        // This else block should ideally not be reached if only admin/governor can log in
        // If it were, it would be for an investor to message admin/governor
        console.error('Attempted to send message from non-admin user on admin message page.');
        alert('Unauthorized message attempt.');
      }
      
      setNewMessageContent('');
      setSelectedRecipient(null);
      setShowNewMessageForm(false);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setMessagingError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Messages">      
      <FunctionalityGuard 
        functionality="messaging"
        fallbackMessage="Messaging system has been temporarily disabled by the Governor for security reasons."
      >
      {messagingError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle size={20} className="text-red-600" />
              <div>
                <h3 className="text-red-800 font-semibold">Messaging Error</h3>
                <p className="text-red-700 text-sm">{messagingError}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setMessagingError(null);
                window.location.reload();
              }}
              className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
            >
              <RefreshCw size={14} className="mr-1 inline" />
              Reload
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[calc(100vh-120px)] flex">
        {/* Conversation List */}
        <ConversationList
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onNewConversation={handleNewConversation}
        />
        
        {/* Message Thread */}
        {selectedConversationId ? (
          <MessageThread
            conversationId={selectedConversationId}
            recipientName={user?.role === 'admin' ? 'Investor' : 'Admin'} // Changed 'Affiliate' to 'Investor'
          />
        ) : showNewMessageForm ? (
          <div className="flex-1 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">
                NEW ADMIN MESSAGE
              </h3>
            </div>
            
            <div className="flex-1 p-6">
              <div className="space-y-6">
                {/* Department Selection - Only for Admin */}
                {user?.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                      SELECT DEPARTMENT
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {departments.map((dept) => (
                        <button
                          key={dept.id}
                          onClick={() => setSelectedDepartment(dept.id)}
                          className={`p-3 border border-gray-300 text-left transition-all ${
                            selectedDepartment === dept.id
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {dept.icon}
                            <span className="font-bold text-xs uppercase tracking-wide">{dept.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recipient Selection - Only for Admin */}
                {user?.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                      SELECT RECIPIENT
                    </label>
                    <div className="max-h-48 overflow-y-auto border border-gray-300">
                      {getAllRecipients().map((recipient) => (
                        <button
                          key={recipient.id}
                          onClick={() => setSelectedRecipient(recipient)}
                          className={`w-full text-left p-4 border-b border-gray-200 transition-colors ${
                            selectedRecipient?.id === recipient.id
                              ? 'bg-gray-900 text-white'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-sm uppercase tracking-wide">{recipient.name}</p>
                              {recipient.type === 'governor' ? (
                                <p className="text-xs uppercase tracking-wide opacity-75">
                                  {recipient.title || 'MANAGEMENT TEAM'}
                                </p>
                              ) : (
                                <>
                                  <p className="text-xs uppercase tracking-wide opacity-75">
                                    INVESTOR - {recipient.country}
                                  </p>
                                  {recipient.accountStatus && (
                                    <p className="text-xs uppercase tracking-wide opacity-60">
                                      STATUS: {recipient.accountStatus}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="text-right">
                              {recipient.type === 'governor' ? (
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              ) : (
                                <>
                                  <p className="font-bold text-sm">${recipient.currentBalance?.toLocaleString() || '0'}</p>
                                  <p className="text-xs opacity-75">BALANCE</p>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                    Message Content
                  </label>
                  <textarea
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 font-medium"
                    rows={8}
                    placeholder="Type your message here..."
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleSendNewMessage}
                    disabled={!newMessageContent.trim() || isLoading || (user?.role === 'admin' && !selectedRecipient) || !!messagingError}
                    className="px-6 py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors rounded-lg uppercase tracking-wide"
                  >
                    <Send size={16} className="mr-2 inline" />
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                ADMIN COMMUNICATION CENTER
              </h3>
              <p className="text-gray-600 mb-6 uppercase tracking-wide text-sm">
                COMMUNICATE WITH MANAGEMENT TEAM AND INVESTORS
              </p>
              <button
                onClick={() => setShowNewMessageForm(true)}
                className="px-6 py-3 bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors uppercase tracking-wide border border-gray-700"
              >
                <Send size={18} className="mr-2 inline" />
                START NEW COMMUNICATION
              </button>
            </div>
          </div>
        )}
      </div>
      </FunctionalityGuard>
    </DashboardLayout>
  );
};

export default MessagesPage;
