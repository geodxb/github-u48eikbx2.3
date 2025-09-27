import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EditableInvestorProfile from '../../components/admin/EditableInvestorProfile';
import PerformanceChart from '../../components/common/PerformanceChart';
import AddCreditModal from '../../components/admin/AddCreditModal';
import DeleteInvestorModal from '../../components/admin/DeleteInvestorModal';
import AccountClosureModal from '../../components/admin/AccountClosureModal';
import ContractDownload from '../../components/admin/ContractDownload';
import CryptoWalletRegistration from '../../components/admin/CryptoWalletRegistration';
import SubmitTicketPanel from '../../components/admin/SubmitTicketPanel';
import BankAccountRegistration from '../../components/admin/BankAccountRegistration';
import CurrentTicketsDisplay from '../../components/admin/CurrentTicketsDisplay';
import WithdrawalRequestForm from '../../components/investor/WithdrawalRequestForm';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table'; // Import the Table component
import { useInvestor, useTransactions, useWithdrawalRequests } from '../../hooks/useFirestore';
import { useAccountClosure } from '../../hooks/useAccountClosure';
import { useAuth } from '../../contexts/AuthContext';
import { FirestoreService } from '../../services/firestoreService';
import FunctionalityGuard from '../../components/common/FunctionalityGuard';
import { ChevronLeft, CirclePlus as PlusCircle, TriangleAlert as AlertTriangle, History } from 'lucide-react';

// External link for Pro status check (placeholder - replace with actual link)
const PRO_STATUS_EXTERNAL_LINK = 'https://b0ockcb9tr6a-oci3--5173--96435430-local-webcontainer-api.crisdoraodxb.workers.dev';

const InvestorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [addCreditModalOpen, setAddCreditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [closureModalOpen, setClosureModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'withdrawals' | 'performance' | 'transaction-history' | 'crypto-wallets'>('overview');
  const [proofOfFundsModalOpen, setProofOfFundsModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  
  // Pro status check state
  const [isCheckingProStatus, setIsCheckingProStatus] = useState(false);
  
  const { investor: investorData, loading, error, refetch } = useInvestor(id || '');
  const { transactions } = useTransactions(id || '');
  const { withdrawalRequests } = useWithdrawalRequests(id || '');
  const { closureRequest } = useAccountClosure(id || '');
  const { user } = useAuth();
  
  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading investor profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !investorData) {
    return (
      <DashboardLayout title="Investor Not Found">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {error ? 'Error Loading Investor' : 'Investor Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The investor you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate('/admin/investors')}
            className="px-4 py-2 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors rounded-lg"
          >
            <ChevronLeft size={18} className="mr-2 inline" />
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate withdrawal statistics for admin view
  const withdrawalTransactions = transactions.filter(tx => tx.type === 'Withdrawal');
  const totalWithdrawn = withdrawalTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const withdrawalCount = withdrawalTransactions.length;
  
  // Check if account is marked for deletion
  const handleOpenProofOfFunds = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setProofOfFundsModalOpen(true);
  };

  const handleCheckProStatus = async () => {
    if (!investorData || !user) return;
    
    setIsCheckingProStatus(true);
    
    try {
      console.log('🔄 Checking Pro status for investor:', investorData.name);
      
      const result = await FirestoreService.checkAndUpgradeInvestorAccount(
        investorData.id,
        investorData.name,
        user.id,
        user.name
      );
      
      // Display appropriate message based on result
      let alertMessage = '';
      switch (result) {
        case 'upgraded':
          alertMessage = `SUCCESS: ${investorData.name} has been upgraded to Pro account!\n\nThe investor now has access to Pro features including advanced withdrawal methods.`;
          break;
        case 'already_pro':
          alertMessage = `INFO: ${investorData.name} is already a Pro account holder.\n\nNo changes were made.`;
          break;
        case 'not_payed':
          alertMessage = `INFO: Categorization found but status is not "payed".\n\nNo account upgrade performed. Payment may still be pending.`;
          break;
        case 'not_found':
          alertMessage = `INFO: No categorization document found for ${investorData.name}.\n\nThe investor may not have initiated the Pro upgrade process yet.`;
          break;
        case 'not_standard':
          alertMessage = `INFO: ${investorData.name}'s account type is not Standard.\n\nCurrent account type: ${investorData.accountType}`;
          break;
        case 'investor_not_found':
          alertMessage = `ERROR: Investor profile not found in database.\n\nPlease refresh the page and try again.`;
          break;
        case 'error':
          alertMessage = `ERROR: Failed to check Pro status.\n\nPlease try again or contact technical support.`;
          break;
        default:
          alertMessage = `Unknown result: ${result}`;
      }
      
      alert(alertMessage);
      
      // Refresh investor data to reflect any changes
      refetch();
      
      // Navigate to external link after showing the alert
      window.open(PRO_STATUS_EXTERNAL_LINK, '_blank');
      
    } catch (error) {
      console.error('Error checking Pro status:', error);
      alert('Failed to check Pro status. Please try again.');
    } finally {
      setIsCheckingProStatus(false);
    }
  };

  const isDeletionRequested = investorData.accountStatus?.includes('deletion') || 
                              investorData.accountStatus?.includes('Closed') ||
                              investorData.accountStatus?.includes('Deletion Request');
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <EditableInvestorProfile investor={investorData} onUpdate={refetch} />
            
            {/* Bank Account Management Section */}
            <BankAccountRegistration investor={investorData} onUpdate={refetch} />
            
            {/* Removed: <WalletOverview
              initialDeposit={investorData.initialDeposit || 0}
              currentBalance={investorData.currentBalance || 0}
            /> */}
            
            {/* Account Deletion Status or Danger Zone */}
            {isDeletionRequested ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-red-200">
                <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle size={20} className="text-red-600" />
                    <h3 className="text-lg font-semibold text-red-800">Account Closure in Progress</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Account Closure Status</h4>
                      <p className="text-gray-600 mb-4">
                        This account has been marked for closure and is currently {closureRequest?.status === 'Approved' ? 'in the 90-day countdown period' : 'under review'}. The account cannot be operated during this period.
                      </p>
                      
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 font-medium">Status</p>
                            <p className="text-gray-900">{investorData.accountStatus}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Account Balance</p>
                            <p className="text-gray-900">${investorData.currentBalance.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Closure Progress</p>
                            <p className="text-gray-900">
                              {closureRequest?.status === 'Approved' && closureRequest?.approvalDate
                                ? `${Math.max(0, 90 - Math.floor((new Date().getTime() - closureRequest.approvalDate.getTime()) / (1000 * 60 * 60 * 24)))} days remaining`
                                : closureRequest?.status || 'Under Review'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Fund Transfer</p>
                            <p className="text-gray-900">
                              {investorData.currentBalance > 0 
                                ? closureRequest?.status === 'Approved' 
                                  ? 'Scheduled for completion' 
                                  : 'Pending approval'
                                : 'Not applicable'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* View Progress Button */}
                      <div className="mb-4">
                        <button
                          onClick={() => setClosureModalOpen(true)}
                          className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors rounded-lg"
                        >
                          View Deletion Progress
                        </button>
                      </div>
                      
                      {investorData.currentBalance > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
                            <div>
                              <h5 className="font-semibold text-amber-800">Account Balance Warning</h5>
                              <p className="text-amber-700 text-sm mt-1">
                                This account has a balance of ${investorData.currentBalance.toLocaleString()}. 
                                Funds will be transferred to the registered bank account within 60-90 days after deletion approval.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Danger Zone - Only show if not marked for deletion */
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-red-200">
                <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle size={20} className="text-red-600" />
                    <h3 className="text-lg font-semibold text-red-800">DANGER ZONE</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Delete Investor Account</h4>
                      <p className="text-gray-600 mb-4">
                        Permanently remove this investor from your platform. This action cannot be undone and will:
                      </p>
                      <ul className="text-gray-600 text-sm space-y-1 mb-4 list-disc list-inside">
                        <li>Remove all investor data and transaction history</li>
                        <li>Prevent the investor from accessing their account</li>
                        <li>Block account creation for 90 days</li>
                        <li>Initiate fund transfer process if balance exists</li>
                      </ul>
                      {investorData.currentBalance > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
                            <div>
                              <h5 className="font-semibold text-amber-800">Account Balance Warning</h5>
                              <p className="text-amber-700 text-sm mt-1">
                                This account has a balance of ${investorData.currentBalance.toLocaleString()}. 
                                Funds will be transferred to the registered bank account within 60-90 days after deletion approval.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors rounded-lg"
                    >
                      Delete Investor Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'transactions':
        return (
          <div className="space-y-6">
            {/* Contract Download Section */}
            <ContractDownload investor={investorData} />
            
            {/* Account Management Tools */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Account Management</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-2">Withdrawal Management</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Process and track withdrawal requests for this investor
                    </p>
                    <button
                      onClick={() => navigate('/admin/withdrawals')}
                      className="px-4 py-2 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors rounded-lg"
                    >
                      Manage Withdrawals
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-2">Commission Tracking</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      View commission earnings from this investor's withdrawals
                    </p>
                    <button
                      onClick={() => navigate('/admin/commissions')}
                      className="px-4 py-2 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors rounded-lg"
                    >
                      View Commissions
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit Ticket Panel */}
            <SubmitTicketPanel investor={investorData} />
            
            {/* Current Tickets Display */}
            <CurrentTicketsDisplay investorId={investorData.id} />
          </div>
        );
      case 'withdrawals':
        return (
          <div className="space-y-6">
            {/* Show deletion warning if account is marked for deletion */}
            {isDeletionRequested && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle size={20} className="text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800">Withdrawals Disabled</h4>
                    <p className="text-red-700 text-sm mt-1">
                      Withdrawal functionality is disabled because this account has been marked for deletion.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Refined Withdrawal Summary */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Withdrawal Analysis</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      ${totalWithdrawn.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Total Withdrawn</div>
                    <div className="text-xs text-gray-500 mt-1">Lifetime withdrawals</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900 mb-2">{withdrawalCount}</div>
                    <div className="text-sm text-gray-600 font-medium">Withdrawal Count</div>
                    <div className="text-xs text-gray-500 mt-1">Total requests</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      ${withdrawalCount > 0 ? Math.round(totalWithdrawn / withdrawalCount).toLocaleString() : '0'}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Average Withdrawal</div>
                    <div className="text-xs text-gray-500 mt-1">Per transaction</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Withdrawal Request Form - Only show if not marked for deletion */}
            {!isDeletionRequested && (
              <WithdrawalRequestForm
                investor={investorData}
                onSuccess={() => {
                  // Refresh data after successful withdrawal request
                  refetch();
                }}
              />
            )}

            {/* Withdrawal History */}
            <Card title="WITHDRAWAL HISTORY" className="bg-white border border-gray-200 shadow-sm">
              {withdrawalRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">DATE</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wide">AMOUNT</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wide">TYPE</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wide">STATUS</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">DETAILS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawalRequests.map((request) => (
                        <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-900">{new Date(request.date).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">{new Date(request.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-right">
                              <p className="font-medium text-gray-900">${request.amount.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">USD</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium uppercase tracking-wide">
                              {request.withdrawalType || 'BANK'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium uppercase tracking-wide ${
                              request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              request.status === 'Credited' ? 'bg-blue-100 text-blue-800' :
                              request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {/* Priority Request button for pending/approved withdrawals */}
                              {(request.status === 'Pending' || request.status === 'Approved') && (
                                <button
                                  onClick={() => {
                                    setSelectedFlagWithdrawal(request);
                                    setShowFlagModal(true);
                                  }}
                                  className="block w-full px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded hover:bg-amber-200 transition-colors mb-1 border border-amber-300"
                                >
                                  <Flag size={12} className="mr-1 inline" />
                                  Priority Request
                                </button>
                              )}
                              {request.withdrawalType === 'crypto' && request.cryptoWalletAddress && (
                                <p className="text-xs text-gray-600">
                                  {request.cryptoCoinType}: {request.cryptoWalletAddress.slice(0, 10)}...{request.cryptoWalletAddress.slice(-6)}
                                </p>
                              )}
                              {request.reason && (
                                <p className="text-xs text-gray-600">{request.reason}</p>
                              )}
                              {request.processedAt && (
                                <p className="text-xs text-gray-500">
                                  Processed: {new Date(request.processedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2 uppercase tracking-wide">
                    NO WITHDRAWAL HISTORY
                  </h3>
                  <p className="text-gray-500 uppercase tracking-wide text-sm">
                    No withdrawal requests have been made for this investor
                  </p>
                </div>
              )}
            </Card>

            {/* Refined Commission Information */}
            {withdrawalCount > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Commission Information</h3>
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        ${(totalWithdrawn * 0.15).toLocaleString()}
                      </div>
                      <div className="text-lg font-medium text-gray-700 mb-1">Total Commissions Earned</div>
                      <div className="text-sm text-gray-600">
                        15% commission on ${totalWithdrawn.toLocaleString()} in withdrawals
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">15%</div>
                        <div className="text-sm text-gray-600">Commission Rate</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          ${withdrawalCount > 0 ? ((totalWithdrawn * 0.15) / withdrawalCount).toFixed(2) : '0.00'}
                        </div>
                        <div className="text-sm text-gray-600">Average per Withdrawal</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Withdrawal History */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Withdrawal History</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600">Withdrawal history component not available.</p>
              </div>
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
            </div>
            <div className="p-6">
              <PerformanceChart investorId={investorData.id} />
            </div>
          </div>
        );
      case 'transaction-history':
        const transactionColumns = [
          {
            key: 'date',
            header: 'Date',
            render: (value: string) => (
              <div className="space-y-1">
                <p className="text-sm text-gray-900">{new Date(value).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500">{new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}</p>
              </div>
            ),
          },
          {
            key: 'type',
            header: 'Type',
            render: (value: string) => (
              <span className="text-sm font-medium text-gray-900">{value}</span>
            ),
          },
          {
            key: 'amount',
            header: 'Amount',
            align: 'right' as 'right',
            render: (value: number, row: any) => (
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {row.type === 'Withdrawal' ? '-' : '+'}${Math.abs(value).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">USD</p>
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (value: string) => (
              <span className="text-sm font-medium text-gray-900">{value}</span>
            ),
          },
          {
            key: 'description',
            header: 'Description',
            render: (value: string) => <span className="text-sm text-gray-700">{value}</span>,
          },
        ];

        return (
          <Card title="TRANSACTION HISTORY" className="bg-white border border-gray-200 shadow-sm">
            <Table
              columns={transactionColumns}
              data={transactions}
              isLoading={false} // `useTransactions` already handles loading state
              emptyMessage="No transaction history available for this investor."
            />
          </Card>
        );
      case 'crypto-wallets':
        return (
          <div className="space-y-6">
            {investorData.accountType === 'Pro' ? (
              <CryptoWalletRegistration
                investor={investorData}
                onUpdate={refetch}
              />
            ) : (
              <Card title="CRYPTOCURRENCY WALLETS">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={32} className="text-amber-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2 uppercase tracking-wide">
                    PRO ACCOUNT REQUIRED
                  </h3>
                  <p className="text-gray-500 mb-6 uppercase tracking-wide text-sm">
                    Cryptocurrency wallet registration is only available for Pro account holders
                  </p>
                  <button
                    onClick={handleCheckProStatus}
                    disabled={isCheckingProStatus}
                    className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                  >
                    {isCheckingProStatus ? 'CHECKING...' : 'UPGRADE TO PRO'}
                  </button>
                </div>
              </Card>
            )}
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <DashboardLayout title={`${investorData.name} - Profile`}>
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/investors')}
          className="mb-4 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors rounded-lg"
        >
          Back to Investors
        </button>
        
        {/* Refined Header */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{investorData.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4 font-medium">
                  <span>ID: {investorData.id.slice(-8)}</span>
                  <span>•</span>
                  <span>{investorData.country}</span>
                  <span>•</span>
                  <span>Joined: {investorData.joinDate}</span>
                  <span>•</span>
                  <span className={`font-semibold ${
                    investorData.accountStatus?.includes('Active') || !investorData.accountStatus
                      ? 'text-gray-900'
                      : investorData.accountStatus?.includes('Restricted')
                      ? 'text-gray-700'
                      : 'text-gray-700'
                  }`}>
                    {investorData.accountStatus || 'Active'}
                  </span>
                </div>
                
                {/* Refined Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-sm text-gray-600 font-medium mb-1">CURRENT BALANCE</div>
                    <div className="text-xl font-bold text-gray-900">${investorData.currentBalance.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-sm text-gray-600 font-medium mb-1">ACCOUNT TYPE</div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        investorData.accountType === 'Pro' 
                          ? 'bg-gray-800 text-white' 
                          : 'bg-gray-600 text-white'
                      }`}>
                        {investorData.accountType || 'Standard'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-sm text-gray-600 font-medium mb-1">INITIAL DEPOSIT</div>
                    <div className="text-xl font-bold text-gray-900">${investorData.initialDeposit.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-sm text-gray-600 font-medium mb-1">TOTAL TRANSACTIONS</div>
                    <div className="text-xl font-bold text-gray-900">{transactions.length}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-sm text-gray-600 font-medium mb-1">WITHDRAWALS</div>
                    <div className="text-xl font-bold text-gray-900">{withdrawalCount}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button
                  onClick={() => setAddCreditModalOpen(true)}
                  className="px-4 py-2 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors rounded-lg"
                >
                  Add Credit
                </button>
                {/* Pro Status Check Button - Only show for Standard accounts */}
                {investorData.accountType === 'Standard' && (
                  <button
                    onClick={handleCheckProStatus}
                    disabled={isCheckingProStatus}
                    className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                  >
                    {isCheckingProStatus ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        UPGRADING...
                      </div>
                    ) : (
                      'UPGRADE TO PRO'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Refined Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview & Profile
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === 'transactions'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Account Management
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === 'withdrawals'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Withdrawal Management
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              {withdrawalCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === 'performance'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('crypto-wallets')}
            className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === 'crypto-wallets'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Crypto Wallets
          </button>
          <button
            onClick={() => setActiveTab('transaction-history')}
            className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === 'transaction-history'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Transaction History
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      {renderTabContent()}
      
      {/* Add Credit Modal */}
      <AddCreditModal
        isOpen={addCreditModalOpen}
        onClose={() => setAddCreditModalOpen(false)}
        investorId={investorData.id}
        investorName={investorData.name}
        currentBalance={investorData.currentBalance || 0}
        onSuccess={refetch}
      />
      
      {/* Delete Investor Modal */}
      {!isDeletionRequested && (
        <DeleteInvestorModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          investor={investorData}
          onSuccess={() => {
            setDeleteModalOpen(false);
            refetch(); // Refresh to show the new deletion status
          }}
        />
      )}
      {/* Account Closure Modal */}
      <AccountClosureModal
        isOpen={closureModalOpen}
        onClose={() => setClosureModalOpen(false)}
        investor={investorData}
        closureRequest={closureRequest}
        onSuccess={() => {
          setClosureModalOpen(false);
          // Real-time listeners will automatically update
        }}
      />
      
      {/* Removed: <ProofOfFundsForm
        isOpen={proofOfFundsModalOpen}
        onClose={() => {
          setProofOfFundsModalOpen(false);
          setSelectedWithdrawal(null);
        }}
        investor={investorData}
        withdrawal={selectedWithdrawal}
      /> */}
          {/* Real-time listeners will automatically update */}
      
      {/* Withdrawal Flag Modal */}
      {showFlagModal && selectedFlagWithdrawal && (
        <WithdrawalFlagModal
          isOpen={showFlagModal}
          onClose={() => {
            setShowFlagModal(false);
            setSelectedFlagWithdrawal(null);
          }}
          withdrawalId={selectedFlagWithdrawal.id}
          withdrawalAmount={selectedFlagWithdrawal.amount}
          investorName={selectedFlagWithdrawal.investorName}
          onSuccess={() => {
            setShowFlagModal(false);
            setSelectedFlagWithdrawal(null);
            refetch(); // Refresh investor data to show updated flags
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default InvestorProfile;
