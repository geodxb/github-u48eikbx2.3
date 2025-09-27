import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { FirestoreService } from '../../services/firestoreService';
import { useWithdrawalRequests, useInvestors } from '../../hooks/useFirestore';
import WithdrawalFlagModal from '../../components/admin/WithdrawalFlagModal';
import { useWithdrawalFlags } from '../../hooks/useWithdrawalFlags';
import ProofOfTransferGenerator from '../../components/admin/ProofOfTransferGenerator';
import { useAuth } from '../../contexts/AuthContext';
import WithdrawalProgressBar from '../../components/common/WithdrawalProgressBar';
import { CircleCheck as CheckCircle, Circle as XCircle, ListFilter as Filter, Search, Calendar, DollarSign, User, Clock, TriangleAlert as AlertTriangle, X, FileText, Plus, Flag, Wallet, Send } from 'lucide-react';
import FunctionalityGuard from '../../components/common/FunctionalityGuard';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const WithdrawalsPage = () => {
  const { user, setGlobalLoading } = useAuth();
  const { withdrawalRequests, loading, error, refetch } = useWithdrawalRequests();
  const { investors } = useInvestors();
  
  // State management
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedProgressRequest, setSelectedProgressRequest] = useState<any>(null);
  const [showW8BenModal, setShowW8BenModal] = useState(false);
  const [selectedW8BenRequest, setSelectedW8BenRequest] = useState<any>(null);
  const [w8benAction, setW8benAction] = useState<'approve' | 'reject'>('approve');
  const [w8benReason, setW8benReason] = useState('');
  const [showProofOfTransfer, setShowProofOfTransfer] = useState(false);
  const [selectedTransferProof, setSelectedTransferProof] = useState<any>(null);
  const [showPriorityRequestModal, setShowPriorityRequestModal] = useState(false);
  const [selectedPriorityWithdrawal, setSelectedPriorityWithdrawal] = useState<any>(null);

  const filteredRequests = withdrawalRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'pending' && request.status === 'Pending') ||
      (filterStatus === 'approved' && request.status === 'Approved') ||
      (filterStatus === 'rejected' && request.status === 'Rejected');
    
    const matchesSearch = request.investorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.amount.toString().includes(searchTerm);
    
    return matchesStatus && matchesSearch;
  });

  // Get investor details for bank information
  const getInvestorDetails = (investorId: string) => {
    return investors.find(inv => inv.id === investorId);
  };

  const getInvestorDetailsByName = (investorName: string) => {
    return investors.find(inv => 
      inv.name.toLowerCase() === investorName.toLowerCase()
    );
  };

  const openProgressModal = (request: any) => {
    setSelectedProgressRequest(request);
    setShowProgressModal(true);
  };

  const handleW8BenAction = async () => {
    if (!selectedW8BenRequest) return;

    try {
      if (w8benAction === 'approve') {
        // Approve W-8 BEN form logic here
        console.log('Approving W-8 BEN form for:', selectedW8BenRequest.id);
      } else {
        // Reject W-8 BEN form logic here
        console.log('Rejecting W-8 BEN form for:', selectedW8BenRequest.id, 'Reason:', w8benReason);
      }
      
      setShowW8BenModal(false);
      setSelectedW8BenRequest(null);
      setW8benReason('');
    } catch (error) {
      console.error('Error processing W-8 BEN action:', error);
    }
  };

  // Calculate statistics
  const pendingCount = withdrawalRequests.filter(req => req.status === 'Pending').length;
  const approvedCount = withdrawalRequests.filter(req => req.status === 'Approved').length;
  const rejectedCount = withdrawalRequests.filter(req => req.status === 'Rejected').length;
  const totalPendingAmount = withdrawalRequests
    .filter(req => req.status === 'Pending')
    .reduce((sum, req) => sum + req.amount, 0);

  const columns = [
    {
      key: 'investorName',
      header: 'Investor',
      align: 'center' as 'center',
      render: (value: string, row: any) => {
        const investor = getInvestorDetails(row.investorId);
        return (
          <div className="space-y-1 text-center">
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">ID: {row.investorId.slice(-8)}</p>
            {investor && (
              <p className="text-xs text-gray-500">{investor.country}</p>
            )}
          </div>
        );
      }
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'center' as 'center',
      render: (value: number) => (
        <div className="text-center">
          <p className="font-medium text-gray-900">${value?.toLocaleString() || '0'}</p>
          <p className="text-xs text-gray-500">USD</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      align: 'center' as 'center',
      render: (value: string) => {
        const date = new Date(value);
        return (
          <div className="space-y-1 text-center">
            <p className="text-sm text-gray-900">{date.toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
          </div>
        );
      }
    },
    {
      key: 'bankDetails',
      header: 'Destination',
      align: 'center' as 'center',
      render: (_: any, row: any) => {
        // Check if this is a crypto withdrawal using the correct field
        if (row.type === 'crypto' || row.destinationDetails?.address) {
          return (
            <div className="text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <Wallet size={14} className="text-purple-600" />
                  <p className="text-sm font-bold text-gray-900">
                    {row.destinationDetails?.coinType || row.cryptoCoinType || 'CRYPTO'}
                  </p>
                </div>
                <p className="text-xs text-gray-600">
                  {row.destinationDetails?.network || row.cryptoNetworkType || 'BLOCKCHAIN'}
                </p>
                {(row.destinationDetails?.address || row.cryptoWalletAddress) && (
                  <p className="text-xs text-gray-500 font-mono">
                    {(row.destinationDetails?.address || row.cryptoWalletAddress).slice(0, 8)}...{(row.destinationDetails?.address || row.cryptoWalletAddress).slice(-6)}
                  </p>
                )}
                {row.transactionHash && (
                  <p className="text-xs text-green-600 font-mono">
                    Hash: {row.transactionHash.slice(0, 8)}...
                  </p>
                )}
              </div>
            </div>
          );
        }
        
        // Default to bank details for bank withdrawals
        const investor = getInvestorDetails(row.investorId);
        
        // Get bank details from destinationDetails first, then fallback to investor data
        let bankInfo = row.destinationDetails;
        if (!bankInfo || !bankInfo.bankName) {
          if (investor?.bankAccounts && investor.bankAccounts.length > 0) {
            // Use primary bank account or first available
            bankInfo = investor.bankAccounts.find((acc: any) => acc.isPrimary) || investor.bankAccounts[0];
          } else if (investor?.bankDetails && investor.bankDetails.bankName) {
            // Fallback to legacy bankDetails
            bankInfo = investor.bankDetails;
          }
        }
        
        return (
          <div className="text-center">
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-900">
                {bankInfo?.bankName || 'Bank Transfer'}
              </p>
              <p className="text-xs text-gray-600">
                {bankInfo?.currency ? 
                  `${bankInfo.currency}` : 
                  'USD'
                }
              </p>
              {bankInfo?.accountNumber && (
                <p className="text-xs text-gray-500">
                  ***{bankInfo.accountNumber.slice(-4)}
                </p>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'priority',
      header: 'Priority',
      align: 'center' as 'center',
      render: (_: any, row: any) => {
        // Get withdrawal flags for priority indicator
        const WithdrawalFlagIndicator = ({ withdrawalId }: { withdrawalId: string }) => {
          const { flags } = useWithdrawalFlags(withdrawalId);
          const approvedFlag = flags.find(flag => flag.status === 'approved' && flag.isActive);
          
          if (!approvedFlag) return (
            <span className="text-xs text-gray-500 uppercase tracking-wide">STANDARD</span>
          );
          
          const getPriorityColor = (priority: string) => {
            switch (priority) {
              case 'urgent': return 'text-red-600';
              case 'high': return 'text-orange-600';
              case 'medium': return 'text-yellow-600';
              default: return 'text-gray-600';
            }
          };
          
          return (
            <div className="flex items-center justify-center space-x-1">
              <Flag size={12} className={getPriorityColor(approvedFlag.priority)} />
              <span className={`text-xs font-bold uppercase tracking-wide ${getPriorityColor(approvedFlag.priority)}`}>
                {approvedFlag.priority}
              </span>
            </div>
          );
        };
        
        return <WithdrawalFlagIndicator withdrawalId={row.id} />;
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string, row: any) => {
        let statusClass = 'bg-gray-100 text-gray-800 border border-gray-200';
        
        if (value === 'Pending') {
          statusClass = 'bg-yellow-50 text-yellow-800 border border-yellow-200';
        } else if (value === 'Approved') {
          statusClass = 'bg-green-50 text-green-800 border border-green-200';
        } else if (value === 'Credited') {
          statusClass = 'bg-blue-50 text-blue-800 border border-blue-200';
        } else if (value === 'Rejected') {
          statusClass = 'bg-red-50 text-red-800 border border-red-200';
        } else if (value === 'Refunded') {
          statusClass = 'bg-purple-50 text-purple-800 border border-purple-200';
        }
        
        return (
          <div className="space-y-1">
            <span className={`px-2 py-1 text-xs rounded ${statusClass}`}>
              {value}
            </span>
            {row.processedAt && (
              <p className="text-xs text-gray-500">
                {new Date(row.processedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center' as 'center',
      render: (_: any, row: any) => {
        return (
          <div className="space-y-2">
            {/* Progress tracking button for all requests */}
            <Button
              size="sm"
              variant="primary"
              onClick={() => openProgressModal(row)}
              className="w-full mb-2"
            >
              <Clock size={14} className="mr-1" />
              Track Progress
            </Button>
            
            {/* Proof of transfer button for credited withdrawals */}
            {row.status === 'Credited' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const investor = getInvestorDetails(row.investorId);
                  if (investor) {
                    const withdrawalData = {
                      id: row.id,
                      amount: -row.amount,
                      date: row.date,
                      type: 'Withdrawal',
                      status: row.status,
                      description: `Withdrawal request #${row.id.slice(-8)}`
                    };
                    setSelectedTransferProof({ withdrawal: withdrawalData, investor, withdrawalRequest: row });
                    setShowProofOfTransfer(true);
                  }
                }}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                <FileText size={14} className="mr-1" />
                Transfer Proof
              </Button>
            )}
            
            {/* Status text for processed requests */}
            {row.status !== 'Pending' && row.status !== 'Approved' && row.status !== 'Credited' && (
              <div className="text-center">
                <span className="text-gray-500 text-xs">
                  {row.status === 'Rejected' ? 'Rejected' : 
                   row.status}
                </span>
                {row.reason && (
                  <p className="text-xs text-gray-400 max-w-32 truncate mt-1">
                    {row.reason}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <DashboardLayout title="Withdrawal Requests">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry Loading
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Withdrawal Management">
      <FunctionalityGuard 
        functionality="withdrawals"
        fallbackMessage="Withdrawal management has been temporarily disabled by the Governor for security reasons."
      >
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">WITHDRAWAL MANAGEMENT</h2>
              <p className="text-gray-600 uppercase tracking-wide text-sm">Monitor withdrawals and submit priority requests for Governor review</p>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 mb-1">{pendingCount}</div>
              <div className="text-sm text-gray-600">Pending Governor Review</div>
            </div>
          </Card>
          
          <Card className="bg-white border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 mb-1">${totalPendingAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Pending</div>
            </div>
          </Card>
          
          <Card className="bg-white border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 mb-1">{approvedCount}</div>
              <div className="text-sm text-gray-600">Governor Approved</div>
            </div>
          </Card>
          
          <Card className="bg-white border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 mb-1">{rejectedCount}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </Card>
        </div>
        
        {/* Filters and Controls */}
        <Card className="mb-6 bg-white border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700">Filter:</span>
              </div>
              <div className="flex space-x-1">
                {[
                  { key: 'all', label: 'All', count: withdrawalRequests.length },
                  { key: 'pending', label: 'Pending', count: pendingCount },
                  { key: 'approved', label: 'Approved', count: approvedCount },
                  { key: 'rejected', label: 'Rejected', count: rejectedCount }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterStatus(filter.key as FilterStatus)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      filterStatus === filter.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by investor or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
          </div>
        </Card>
        
        {/* Withdrawal Requests Table */}
        <Card title={`Withdrawal Requests (${filteredRequests.length})`} className="bg-white border border-gray-200">
          <Table 
            columns={columns} 
            data={filteredRequests}
            isLoading={loading}
            emptyMessage="No withdrawal requests found"
          />
          
          {!loading && filteredRequests.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Showing Results</p>
                  <p className="font-medium text-gray-900">{filteredRequests.length} of {withdrawalRequests.length} requests</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Amount (Filtered)</p>
                  <p className="font-medium text-gray-900">
                    ${filteredRequests.reduce((sum, req) => sum + req.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Pending Governor Review</p>
                  <p className="font-medium text-gray-900">
                    {filteredRequests.filter(req => req.status === 'Pending').length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Progress Tracking Modal */}
        {showProgressModal && selectedProgressRequest && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => setShowProgressModal(false)}>
            <div className="flex min-h-screen items-start justify-center p-4 py-8">
              <div 
                className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900 uppercase tracking-wide">
                    WITHDRAWAL PROGRESS TRACKING
                  </h3>
                  <button
                    onClick={() => setShowProgressModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                  <WithdrawalProgressBar
                    withdrawalId={selectedProgressRequest.id}
                    submissionDate={selectedProgressRequest.date}
                    currentStatus={selectedProgressRequest.status}
                    approvalDate={selectedProgressRequest.processedAt && selectedProgressRequest.status === 'Approved' ? selectedProgressRequest.processedAt : null}
                    creditDate={selectedProgressRequest.status === 'Credited' ? selectedProgressRequest.processedAt : null}
                    rejectionDate={selectedProgressRequest.status === 'Rejected' ? selectedProgressRequest.processedAt : null}
                    amount={selectedProgressRequest.amount}
                    investorName={selectedProgressRequest.investorName}
                    rejectionReason={selectedProgressRequest.reason}
                    withdrawalRequest={selectedProgressRequest}
                    investor={getInvestorDetails(selectedProgressRequest.investorId)}
                    priorityFlags={[]} // TODO: Load actual priority flags
                    onPriorityRequest={selectedProgressRequest.status === 'Pending' || selectedProgressRequest.status === 'Approved' ? () => {
                      setShowProgressModal(false);
                      setSelectedPriorityWithdrawal(selectedProgressRequest);
                      setShowPriorityRequestModal(true);
                    } : undefined}
                    showPriorityButton={true}
                    investor={getInvestorDetails(selectedProgressRequest.investorId)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* W-8 BEN Action Modal */}
        {showW8BenModal && selectedW8BenRequest && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => setShowW8BenModal(false)}>
            <div className="flex min-h-screen items-center justify-center p-4">
              <div 
                className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {w8benAction === 'approve' ? 'Approve' : 'Reject'} W-8 BEN Form
                  </h3>
                  <button
                    onClick={() => setShowW8BenModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Request Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Investor</p>
                          <p className="font-medium">{selectedW8BenRequest.investorName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Amount</p>
                          <p className="font-medium">${selectedW8BenRequest.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">W-8 BEN Status</p>
                          <p className="font-medium">{selectedW8BenRequest.w8benStatus}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Submitted</p>
                          <p className="font-medium">
                            {selectedW8BenRequest.w8benSubmittedAt?.toDate().toLocaleDateString() || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {w8benAction === 'reject' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rejection Reason
                        </label>
                        <textarea
                          value={w8benReason}
                          onChange={(e) => setW8benReason(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          placeholder="Explain why the W-8 BEN form is being rejected..."
                        />
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowW8BenModal(false);
                          setSelectedW8BenRequest(null);
                          setW8benReason('');
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant={w8benAction === 'approve' ? 'primary' : 'danger'}
                        onClick={handleW8BenAction}
                        className="flex-1"
                      >
                        {w8benAction === 'approve' ? 'Approve Form' : 'Reject Form'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proof of Transfer Modal */}
        {showProofOfTransfer && selectedTransferProof && (
          <Modal
            isOpen={showProofOfTransfer}
            onClose={() => {
              setShowProofOfTransfer(false);
              setSelectedTransferProof(null);
            }}
            title="PROOF OF WIRE TRANSFER"
            size="xl"
          >
            <ProofOfTransferGenerator
              investor={selectedTransferProof.investor}
              withdrawal={selectedTransferProof.withdrawal}
              withdrawalRequest={selectedTransferProof.withdrawalRequest}
            />
          </Modal>
        )}

        {/* Priority Request Modal */}
        {showPriorityRequestModal && selectedPriorityWithdrawal && (
          <WithdrawalFlagModal
            isOpen={showPriorityRequestModal}
            onClose={() => {
              setShowPriorityRequestModal(false);
              setSelectedPriorityWithdrawal(null);
            }}
            withdrawalId={selectedPriorityWithdrawal.id}
            withdrawalAmount={selectedPriorityWithdrawal.amount}
            investorName={selectedPriorityWithdrawal.investorName}
            onSuccess={() => {
              setShowPriorityRequestModal(false);
              setSelectedPriorityWithdrawal(null);
              refetch(); // Refresh withdrawal requests to show updated priority requests
            }}
          />
        )}
      </FunctionalityGuard>
    </DashboardLayout>
  );
};

export default WithdrawalsPage;