import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CircleCheck as CheckCircle, Circle as XCircle, Send, Wallet, Building, TriangleAlert as AlertTriangle, DollarSign, Calendar, Shield, Hash, TrendingUp, FileText, Flag } from 'lucide-react';

interface WithdrawalProgressBarProps {
  withdrawalId: string;
  submissionDate: string;
  currentStatus: string;
  approvalDate?: Date | null;
  creditDate?: Date | null;
  rejectionDate?: Date | null;
  amount: number;
  investorName: string;
  rejectionReason?: string;
  withdrawalRequest?: any; // Full withdrawal request object
  investor?: any; // Add investor prop
  onPriorityRequest?: () => void;
  showPriorityButton?: boolean;
  priorityFlags?: any[]; // Add priority flags prop
}

const WithdrawalProgressBar = ({
  withdrawalId,
  submissionDate,
  currentStatus,
  approvalDate,
  creditDate,
  rejectionDate,
  amount,
  investorName,
  rejectionReason,
  withdrawalRequest,
  investor,
  onPriorityRequest,
  showPriorityButton = false,
  priorityFlags = []
}: WithdrawalProgressBarProps) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [businessDaysElapsed, setBusinessDaysElapsed] = useState(0);
  const [estimatedCompletion, setEstimatedCompletion] = useState<Date | null>(null);

  // Determine if this is a crypto withdrawal
  const isCryptoWithdrawal = withdrawalRequest?.type === 'crypto' || withdrawalRequest?.destinationDetails?.address;

  // Check priority request status
  const priorityRequest = priorityFlags.find(flag => flag.withdrawalId === withdrawalId);
  const hasPriorityRequest = !!priorityRequest;
  const isPriorityApproved = priorityRequest?.status === 'approved';
  const isPriorityRejected = priorityRequest?.status === 'rejected';
  const isPriorityPending = priorityRequest?.status === 'pending';

  // MT103 Generator Component for credited bank withdrawals
  const MT103GeneratorDisplay = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    if (!investor || isCryptoWithdrawal || currentStatus.toLowerCase() !== 'credited') {
      return null;
    }

    const generateMT103HTML = () => {
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const transferDate = new Date(submissionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const transferAmount = amount;
      const netAmount = transferAmount * 0.85;
      const transactionRef = `MT103${Date.now()}${withdrawalId.slice(-6)}`;

      // Get bank details
      const bankInfo = investor?.bankDetails || investor?.bankAccounts?.[0] || {};

      return `
        <div style="font-family: 'Courier New', monospace; line-height: 1.2; color: #000; max-width: 800px; margin: 0 auto; padding: 20px; background: white;">
          <!-- SWIFT MT103 Header -->
          <div style="border: 2px solid #000; padding: 15px; margin-bottom: 20px; background-color: #f8f9fa;">
            <div style="text-align: center; margin-bottom: 15px;">
              <img src="/Screenshot 2025-06-07 024813.png" alt="Interactive Brokers" style="height: 40px; width: auto; object-fit: contain; margin-bottom: 10px;" />
              <h1 style="font-size: 16px; font-weight: bold; margin: 0; color: #000;">SWIFT MT103 SINGLE CUSTOMER CREDIT TRANSFER</h1>
              <p style="font-size: 12px; margin: 5px 0 0 0; color: #666;">ADMIN AUTHORIZED WIRE TRANSFER</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 11px;">
              <div>
                <strong>Message Type:</strong> MT103<br/>
                <strong>Reference:</strong> ${transactionRef}<br/>
                <strong>Date/Time:</strong> ${new Date().toISOString().replace(/[:-]/g, '').slice(0, 15)}
              </div>
              <div>
                <strong>Priority:</strong> ADMIN PROCESSED<br/>
                <strong>MUR:</strong> ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}IBKRLLC${withdrawalId.slice(-4)}<br/>
                <strong>Receiver:</strong> ${bankInfo.swiftCode || 'BNKMXXMM'}
              </div>
            </div>
          </div>

          <!-- MT103 Fields -->
          <div style="border: 1px solid #000; margin-bottom: 20px;">
            <div style="background-color: #000; color: white; padding: 8px; font-weight: bold; font-size: 12px;">
              SWIFT MT103 MESSAGE FIELDS - ADMIN AUTHORIZED
            </div>
            
            <div style="padding: 15px; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.4;">
              <div style="margin-bottom: 15px;">
                <strong>:20: Transaction Reference Number</strong><br/>
                ${transactionRef}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>:23B: Bank Operation Code</strong><br/>
                CRED
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>:32A: Value Date/Currency/Amount</strong><br/>
                ${new Date(submissionDate).toISOString().slice(2, 10).replace(/-/g, '')}USD${transferAmount.toFixed(2).replace('.', ',')}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>:50K: Ordering Customer</strong><br/>
                INTERACTIVE BROKERS LLC<br/>
                ONE PICKWICK PLAZA<br/>
                GREENWICH, CT 06830<br/>
                UNITED STATES
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>:52A: Ordering Institution</strong><br/>
                IBKRLLC<br/>
                INTERACTIVE BROKERS LLC<br/>
                GREENWICH, CT, US
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>:57A: Account With Institution</strong><br/>
                ${bankInfo.swiftCode || 'BNKMXXMM'}<br/>
                ${bankInfo.bankName || 'BENEFICIARY BANK'}<br/>
                ${bankInfo.bankAddress || investor.country}<br/>
                ${investor.country.toUpperCase()}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>:59: Beneficiary Customer</strong><br/>
                /${bankInfo.accountNumber || 'ACCOUNT NUMBER'}<br/>
                ${investor.name.toUpperCase()}<br/>
                ${investor.country.toUpperCase()}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>:70: Remittance Information</strong><br/>
                ADMIN AUTHORIZED WITHDRAWAL<br/>
                CLIENT ID: ${investor.id}<br/>
                ORIGINAL AMOUNT: USD ${transferAmount.toLocaleString()}<br/>
                COMMISSION: USD ${(transferAmount * 0.15).toLocaleString()}<br/>
                NET TRANSFER: USD ${netAmount.toLocaleString()}<br/>
                AUTHORIZATION: ADMIN APPROVAL
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>:71A: Details of Charges</strong><br/>
                OUR
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>:72: Sender to Receiver Information</strong><br/>
                /ADM/ADMIN AUTHORIZED TRANSFER<br/>
                /ACC/TRADING ACCOUNT WITHDRAWAL<br/>
                /RFB/INTERACTIVE BROKERS CLIENT FUNDS<br/>
                /INV/${investor.name.toUpperCase()}<br/>
                /AUTH/ADMIN APPROVAL
              </div>
            </div>
          </div>

          <!-- Admin Authorization Section -->
          <div style="border: 1px solid #000; margin-bottom: 20px;">
            <div style="background-color: #000; color: white; padding: 8px; font-weight: bold; font-size: 12px;">
              ADMIN AUTHORIZATION & COMPLIANCE
            </div>
            
            <div style="padding: 15px; font-size: 11px;">
              <p style="margin: 0 0 10px 0;"><strong>Authorization Level:</strong> ADMIN CONTROL</p>
              <p style="margin: 0 0 10px 0;"><strong>Authorized By:</strong> ADMIN TEAM</p>
              <p style="margin: 0 0 10px 0;"><strong>Authorization Date:</strong> ${currentDate.toUpperCase()}</p>
              <p style="margin: 0 0 10px 0;"><strong>Authorization Time:</strong> ${currentTime}</p>
              <p style="margin: 0 0 10px 0;"><strong>Processing Reason:</strong> STANDARD WITHDRAWAL APPROVAL</p>
              <p style="margin: 0 0 10px 0;"><strong>Compliance Status:</strong> ADMIN APPROVED - STANDARD PROCEDURES</p>
              <p style="margin: 0;"><strong>Digital Signature:</strong> ADM-${new Date().getTime().toString(36).toUpperCase()}</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 2px solid #000; font-size: 10px; color: #666;">
            <img src="/Screenshot 2025-06-07 024813.png" alt="Interactive Brokers" style="height: 30px; width: auto; object-fit: contain; margin-bottom: 10px;" />
            <p style="margin: 0;">
              <strong>INTERACTIVE BROKERS LLC</strong><br/>
              One Pickwick Plaza, Greenwich, CT 06830, United States<br/>
              Regulated by SEC, FINRA, CFTC | Member SIPC<br/>
              <br/>
              This MT103 was generated under admin authorization on ${currentDate} at ${currentTime}<br/>
              Document ID: ADM-MT103-${withdrawalId.slice(-8)} | Authorization: ADMIN CONTROL
            </p>
          </div>
        </div>
      `;
    };

    const downloadMT103PDF = async () => {
      setIsGenerating(true);
      
      try {
        // Create temporary div with MT103 content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = generateMT103HTML();
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        tempDiv.style.width = '800px';
        tempDiv.style.backgroundColor = 'white';
        document.body.appendChild(tempDiv);

        // Generate canvas from HTML
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 800,
          height: tempDiv.scrollHeight
        });

        // Remove temporary div
        document.body.removeChild(tempDiv);

        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        // Add first page
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if needed
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // Download the PDF
        const fileName = `MT103_${investor.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);

      } catch (error) {
        console.error('Error generating MT103:', error);
        alert('Failed to generate MT103 document. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    };

    return (
      <div className="mt-6 bg-white border border-gray-300">
        <div className="px-6 py-4 border-b border-gray-300 bg-blue-50">
          <h5 className="text-lg font-bold text-blue-900 uppercase tracking-wide">
            MT103 WIRE TRANSFER DOCUMENT
          </h5>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {/* Transfer Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 border border-gray-300">
                <div className="flex items-center space-x-2 mb-3">
                  <Building size={16} className="text-gray-700" />
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">BENEFICIARY</span>
                </div>
                <p className="font-bold text-gray-900">{investor.name}</p>
                <p className="text-sm text-gray-700 font-medium">{investor.country}</p>
              </div>
              
              <div className="bg-gray-50 p-4 border border-gray-300">
                <div className="flex items-center space-x-2 mb-3">
                  <DollarSign size={16} className="text-gray-700" />
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">TRANSFER AMOUNT</span>
                </div>
                <p className="font-bold text-gray-900">${amount.toLocaleString()}</p>
                <p className="text-sm text-gray-700 font-medium">NET: ${(amount * 0.85).toLocaleString()}</p>
              </div>
              
              <div className="bg-gray-50 p-4 border border-gray-300">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar size={16} className="text-gray-700" />
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">VALUE DATE</span>
                </div>
                <p className="font-bold text-gray-900">
                  {new Date(submissionDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700 font-medium">SAME DAY VALUE</p>
              </div>
            </div>

            {/* Preview Toggle and Download */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors uppercase tracking-wide"
              >
                {showPreview ? 'HIDE PREVIEW' : 'SHOW PREVIEW'}
              </button>
              <button
                onClick={downloadMT103PDF}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide border border-blue-700"
              >
                <Download size={16} className="mr-2 inline" />
                {isGenerating ? 'GENERATING MT103...' : 'DOWNLOAD MT103 DOCUMENT'}
              </button>
            </div>

            {/* Document Preview */}
            {showPreview && (
              <div className="border border-gray-300">
                <div className="max-h-96 overflow-y-auto p-4 bg-white">
                  <div dangerouslySetInnerHTML={{ __html: generateMT103HTML() }} />
                </div>
              </div>
            )}

            {/* Document Information */}
            <div className="bg-blue-50 border border-blue-300 p-4">
              <div className="flex items-start space-x-3">
                <FileText size={20} className="text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-800 uppercase tracking-wide">MT103 DOCUMENT INFORMATION</h4>
                  <p className="text-blue-700 text-sm mt-1 uppercase tracking-wide">
                    This MT103 document serves as official proof of wire transfer completion. 
                    It includes all SWIFT message fields and bank details required for compliance and record keeping.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calculate business days between two dates (excluding weekends)
  const calculateBusinessDays = (startDate: Date, endDate: Date): number => {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  // Add business days to a date
  const addBusinessDays = (startDate: Date, businessDays: number): Date => {
    const result = new Date(startDate);
    let daysAdded = 0;
    
    while (daysAdded < businessDays) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
        daysAdded++;
      }
    }
    
    return result;
  };

  useEffect(() => {
    const now = new Date();
    const submissionDateTime = new Date(submissionDate);
    
    // Calculate business days elapsed since submission
    const businessDays = calculateBusinessDays(submissionDateTime, now);
    setBusinessDaysElapsed(businessDays);

    // Determine stage and progress based on status and withdrawal type
    if (isCryptoWithdrawal) {
      // Crypto withdrawal flow: pending -> approved -> sent -> credited
      switch (currentStatus.toLowerCase()) {
        case 'pending':
          setCurrentStage(1);
          setProgressPercentage(25);
          setEstimatedCompletion(addBusinessDays(submissionDateTime, 2)); // 2 business days for approval
          break;
        case 'approved':
          setCurrentStage(2);
          setProgressPercentage(50);
          setEstimatedCompletion(addBusinessDays(approvalDate || submissionDateTime, 1)); // 1 business day to send to blockchain
          break;
        case 'sent':
          setCurrentStage(3);
          setProgressPercentage(75);
          setEstimatedCompletion(addBusinessDays(new Date(), 1)); // 1 business day for blockchain confirmation
          break;
        case 'credited':
          setCurrentStage(4);
          setProgressPercentage(100);
          setEstimatedCompletion(creditDate || now);
          break;
        case 'rejected':
          setCurrentStage(5);
          setProgressPercentage(100);
          setEstimatedCompletion(rejectionDate || now);
          break;
        case 'refunded':
          setCurrentStage(6);
          setProgressPercentage(100);
          setEstimatedCompletion(now);
          break;
        default:
          setCurrentStage(1);
          setProgressPercentage(25);
      }
    } else {
      // Bank withdrawal flow: pending -> approved -> credited
      switch (currentStatus.toLowerCase()) {
        case 'pending':
          setCurrentStage(1);
          setProgressPercentage(33);
          setEstimatedCompletion(addBusinessDays(submissionDateTime, 3)); // 3 business days for approval
          break;
        case 'approved':
          setCurrentStage(2);
          setProgressPercentage(66);
          setEstimatedCompletion(addBusinessDays(approvalDate || submissionDateTime, 3)); // 3 business days for transfer
          break;
        case 'credited':
          setCurrentStage(3);
          setProgressPercentage(100);
          setEstimatedCompletion(creditDate || now);
          break;
        case 'rejected':
          setCurrentStage(4);
          setProgressPercentage(100);
          setEstimatedCompletion(rejectionDate || now);
          break;
        case 'refunded':
          setCurrentStage(5);
          setProgressPercentage(100);
          setEstimatedCompletion(now);
          break;
        default:
          setCurrentStage(1);
          setProgressPercentage(33);
      }
    }
  }, [currentStatus, submissionDate, approvalDate, creditDate, rejectionDate, isCryptoWithdrawal]);

  const getProgressBarColor = () => {
    if (currentStatus.toLowerCase() === 'rejected') return 'bg-red-500';
    if (currentStatus.toLowerCase() === 'refunded') return 'bg-purple-500';
    if (currentStatus.toLowerCase() === 'credited') return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getStatusIcon = () => {
    switch (currentStatus.toLowerCase()) {
      case 'pending':
        return <Clock size={20} className="text-yellow-600" />;
      case 'approved':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'sent':
        return <Send size={20} className="text-blue-600" />;
      case 'credited':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'rejected':
        return <XCircle size={20} className="text-red-600" />;
      case 'refunded':
        return <TrendingUp size={20} className="text-purple-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

  const getStatusMessage = () => {
    if (isCryptoWithdrawal) {
      switch (currentStatus.toLowerCase()) {
        case 'pending':
          return {
            title: 'Crypto Withdrawal Submitted',
            message: 'Your cryptocurrency withdrawal request is being reviewed by the Governor.',
            detail: `Estimated approval time: ${estimatedCompletion?.toLocaleDateString()} (${Math.max(0, 2 - businessDaysElapsed)} business days remaining)`
          };
        case 'approved':
          return {
            title: 'Crypto Withdrawal Approved',
            message: 'Your withdrawal has been approved and is being prepared for blockchain transfer.',
            detail: 'The transaction will be sent to the blockchain within 1 business day.'
          };
        case 'sent':
          return {
            title: 'Sent to Blockchain',
            message: 'Your crypto withdrawal has been sent to the blockchain network.',
            detail: withdrawalRequest?.transactionHash 
              ? `Transaction Hash: ${withdrawalRequest.transactionHash}`
              : 'Waiting for blockchain confirmation...'
          };
        case 'credited':
          return {
            title: 'Transfer Complete',
            message: 'Your cryptocurrency has been successfully transferred to your wallet.',
            detail: creditDate 
              ? `Completed on ${creditDate.toLocaleDateString()}`
              : 'Transfer confirmed on blockchain.'
          };
        case 'rejected':
          return {
            title: 'Withdrawal Rejected',
            message: 'Your crypto withdrawal request has been rejected.',
            detail: rejectionReason || 'Please contact support for more information.'
          };
        case 'refunded':
          return {
            title: 'Withdrawal Refunded',
            message: 'The withdrawal amount has been credited back to your account.',
            detail: 'Funds are now available in your account balance.'
          };
        default:
          return {
            title: 'Processing Crypto Withdrawal',
            message: 'Your withdrawal request is being processed.',
            detail: ''
          };
      }
    } else {
      // Bank withdrawal messages
      switch (currentStatus.toLowerCase()) {
        case 'pending':
          return {
            title: 'Bank Withdrawal Submitted',
            message: 'Your bank withdrawal request is being reviewed by the Governor.',
            detail: `Estimated approval time: ${estimatedCompletion?.toLocaleDateString()} (${Math.max(0, 3 - businessDaysElapsed)} business days remaining)`
          };
        case 'approved':
          return {
            title: 'Withdrawal Approved',
            message: 'Your withdrawal has been approved and is being processed for bank transfer.',
            detail: 'Bank transfer will be initiated within 1-3 business days.'
          };
        case 'credited':
          return {
            title: 'Transfer Complete',
            message: 'Your funds have been successfully transferred to your bank account.',
            detail: creditDate 
              ? `Completed on ${creditDate.toLocaleDateString()}`
              : 'Bank transfer completed.'
          };
        case 'rejected':
          return {
            title: 'Withdrawal Rejected',
            message: 'Your bank withdrawal request has been rejected.',
            detail: rejectionReason || 'Please contact support for more information.'
          };
        case 'refunded':
          return {
            title: 'Withdrawal Refunded',
            message: 'The withdrawal amount has been credited back to your account.',
            detail: 'Funds are now available in your account balance.'
          };
        default:
          return {
            title: 'Processing Bank Withdrawal',
            message: 'Your withdrawal request is being processed.',
            detail: ''
          };
      }
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              {getStatusIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">
                {isCryptoWithdrawal ? 'CRYPTO WITHDRAWAL PROGRESS' : 'BANK WITHDRAWAL PROGRESS'}
              </h3>
              <p className="text-sm text-gray-600 uppercase tracking-wide">
                REQUEST #{withdrawalId.slice(-8)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">${amount.toLocaleString()}</p>
            <p className="text-sm text-gray-600 uppercase tracking-wide">{investorName}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              {isCryptoWithdrawal ? 'CRYPTO TRANSFER PROGRESS' : 'BANK TRANSFER PROGRESS'}
            </span>
            <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              {Math.round(progressPercentage)}% COMPLETE
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-3 rounded-full transition-all duration-1000 ${getProgressBarColor()}`}
            />
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {getStatusIcon()}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                {statusInfo.title}
              </h4>
              <p className="text-gray-700 mb-2 uppercase tracking-wide text-sm">
                {statusInfo.message}
              </p>
              {statusInfo.detail && (
                <p className="text-gray-600 text-sm uppercase tracking-wide">
                  {statusInfo.detail}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Priority Request Section - Only show for pending/approved withdrawals */}
        {showPriorityButton && onPriorityRequest && (currentStatus.toLowerCase() === 'pending' || currentStatus.toLowerCase() === 'approved') && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Flag size={20} className="text-amber-600" />
              </div>
              <div className="flex-1">
                {!hasPriorityRequest ? (
                  // No priority request submitted yet
                  <>
                    <h4 className="text-lg font-semibold text-amber-900 mb-2 uppercase tracking-wide">
                      REQUEST PRIORITY PROCESSING
                    </h4>
                    <p className="text-amber-700 mb-4 uppercase tracking-wide text-sm">
                      Submit a priority request to the Governor for expedited processing of this withdrawal.
                    </p>
                    <button
                      onClick={onPriorityRequest}
                      className="px-4 py-2 bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors rounded-lg uppercase tracking-wide border border-amber-700"
                    >
                      <Flag size={16} className="mr-2 inline" />
                      SUBMIT PRIORITY REQUEST
                    </button>
                  </>
                ) : isPriorityPending ? (
                  // Priority request pending Governor review
                  <>
                    <h4 className="text-lg font-semibold text-amber-900 mb-2 uppercase tracking-wide">
                      PRIORITY REQUEST PENDING
                    </h4>
                    <p className="text-amber-700 mb-4 uppercase tracking-wide text-sm">
                      Your priority request has been submitted and is awaiting Governor review.
                    </p>
                    <div className="bg-white border border-amber-300 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock size={14} className="text-amber-600" />
                        <span className="text-sm font-bold text-amber-800 uppercase tracking-wide">PENDING GOVERNOR REVIEW</span>
                      </div>
                      <p className="text-amber-700 text-sm">
                        <strong>Request Type:</strong> {priorityRequest.flagType.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-amber-700 text-sm">
                        <strong>Priority Level:</strong> {priorityRequest.priority.toUpperCase()}
                      </p>
                      <p className="text-amber-700 text-sm">
                        <strong>Reason:</strong> {priorityRequest.comment}
                      </p>
                      <p className="text-amber-600 text-xs mt-2 uppercase tracking-wide">
                        Submitted: {priorityRequest.requestedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </>
                ) : isPriorityApproved ? (
                  // Priority request approved by Governor
                  <>
                    <h4 className="text-lg font-semibold text-green-900 mb-2 uppercase tracking-wide">
                      PRIORITY REQUEST APPROVED
                    </h4>
                    <p className="text-green-700 mb-4 uppercase tracking-wide text-sm">
                      The Governor has approved your priority request for expedited processing.
                    </p>
                    <div className="bg-white border border-green-300 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-sm font-bold text-green-800 uppercase tracking-wide">APPROVED BY GOVERNOR</span>
                      </div>
                      <p className="text-green-700 text-sm">
                        <strong>Approved By:</strong> {priorityRequest.reviewedByName || 'Governor'}
                      </p>
                      <p className="text-green-700 text-sm">
                        <strong>Approval Date:</strong> {priorityRequest.reviewedAt?.toLocaleDateString() || 'Recently'}
                      </p>
                      {priorityRequest.reviewComment && (
                        <p className="text-green-700 text-sm">
                          <strong>Governor Comment:</strong> {priorityRequest.reviewComment}
                        </p>
                      )}
                      <div className="mt-3 flex items-center space-x-2">
                        <Flag size={12} className="text-green-600" />
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold border border-green-200 uppercase tracking-wide">
                          HIGH PRIORITY PROCESSING
                        </span>
                      </div>
                    </div>
                  </>
                ) : isPriorityRejected ? (
                  // Priority request rejected by Governor
                  <>
                    <h4 className="text-lg font-semibold text-red-900 mb-2 uppercase tracking-wide">
                      PRIORITY REQUEST REJECTED
                    </h4>
                    <p className="text-red-700 mb-4 uppercase tracking-wide text-sm">
                      The Governor has rejected your priority request.
                    </p>
                    <div className="bg-white border border-red-300 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <XCircle size={14} className="text-red-600" />
                        <span className="text-sm font-bold text-red-800 uppercase tracking-wide">REJECTED BY GOVERNOR</span>
                      </div>
                      <p className="text-red-700 text-sm">
                        <strong>Rejected By:</strong> {priorityRequest.reviewedByName || 'Governor'}
                      </p>
                      <p className="text-red-700 text-sm">
                        <strong>Rejection Date:</strong> {priorityRequest.reviewedAt?.toLocaleDateString() || 'Recently'}
                      </p>
                      {priorityRequest.reviewComment && (
                        <p className="text-red-700 text-sm">
                          <strong>Governor Comment:</strong> {priorityRequest.reviewComment}
                        </p>
                       )}
                     </div>
                   </>
                 ) : null}
               </div>
             </div>
           </div>
         )}

        {/* MT103 Document Section - Only for credited bank withdrawals */}
        <MT103GeneratorDisplay />
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* MT103 Document Section - Only for credited bank withdrawals */}
        {!isCryptoWithdrawal && currentStatus.toLowerCase() === 'credited' && investor && (
          <MT103GeneratorDisplay 
            withdrawalRequest={withdrawalRequest}
            investor={investor}
          />
        )}

        {/* Timeline Stages */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">
            {isCryptoWithdrawal ? 'CRYPTO TRANSFER TIMELINE' : 'BANK TRANSFER TIMELINE'}
          </h4>
          <div className="space-y-4">
            {isCryptoWithdrawal ? (
              <>
                {/* Crypto Stage 1: Submitted */}
                <div className={`flex items-center space-x-4 p-4 rounded-lg ${
                  currentStage >= 1 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentStage >= 1 ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {currentStage >= 1 ? (
                      <FileText size={16} className="text-blue-600" />
                    ) : (
                      <span className="text-gray-500 font-bold text-sm">1</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 uppercase tracking-wide">
                      CRYPTO WITHDRAWAL SUBMITTED
                    </p>
                    <p className="text-gray-600 text-sm uppercase tracking-wide">
                      {currentStage >= 1 
                        ? `SUBMITTED ON ${new Date(submissionDate).toLocaleDateString()}`
                        : 'AWAITING SUBMISSION'
                      }
                    </p>
                  </div>
                  {currentStage >= 1 && (
                    <div className="text-right">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {new Date(submissionDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Crypto Stage 2: Governor Approved */}
                <div className={`flex items-center space-x-4 p-4 rounded-lg ${
                  currentStage >= 2 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentStage >= 2 ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {currentStage >= 2 ? (
                      <Shield size={16} className="text-green-600" />
                    ) : (
                      <span className="text-gray-500 font-bold text-sm">2</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 uppercase tracking-wide">
                      GOVERNOR APPROVED
                    </p>
                    <p className="text-gray-600 text-sm uppercase tracking-wide">
                      {currentStage >= 2 
                        ? 'CRYPTO WITHDRAWAL APPROVED FOR BLOCKCHAIN PROCESSING'
                        : 'PENDING GOVERNOR APPROVAL'
                      }
                    </p>
                  </div>
                  {currentStage >= 2 && approvalDate && (
                    <div className="text-right">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {approvalDate.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Crypto Stage 3: Sent to Blockchain */}
                <div className={`flex items-center space-x-4 p-4 rounded-lg ${
                  currentStage >= 3 ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentStage >= 3 ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    {currentStage >= 3 ? (
                      <Hash size={16} className="text-purple-600" />
                    ) : (
                      <span className="text-gray-500 font-bold text-sm">3</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 uppercase tracking-wide">
                      SENT TO BLOCKCHAIN
                    </p>
                    <p className="text-gray-600 text-sm uppercase tracking-wide">
                      {currentStage >= 3 
                        ? 'TRANSACTION HASH GENERATED AND SENT TO BLOCKCHAIN'
                        : 'AWAITING BLOCKCHAIN TRANSFER'
                      }
                    </p>
                    {withdrawalRequest?.transactionHash && (
                      <p className="text-xs text-purple-600 font-mono mt-1">
                        Hash: {withdrawalRequest.transactionHash.slice(0, 16)}...{withdrawalRequest.transactionHash.slice(-8)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Crypto Stage 4: Transfer Complete */}
                <div className={`flex items-center space-x-4 p-4 rounded-lg ${
                  currentStage >= 4 && currentStatus.toLowerCase() === 'credited' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentStage >= 4 && currentStatus.toLowerCase() === 'credited' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {currentStage >= 4 && currentStatus.toLowerCase() === 'credited' ? (
                      <Wallet size={16} className="text-green-600" />
                    ) : (
                      <span className="text-gray-500 font-bold text-sm">4</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 uppercase tracking-wide">
                      CRYPTO TRANSFER COMPLETE
                    </p>
                    <p className="text-gray-600 text-sm uppercase tracking-wide">
                      {currentStage >= 4 && currentStatus.toLowerCase() === 'credited'
                        ? 'CRYPTOCURRENCY SUCCESSFULLY TRANSFERRED TO YOUR WALLET'
                        : 'AWAITING BLOCKCHAIN CONFIRMATION'
                      }
                    </p>
                  </div>
                  {currentStage >= 4 && currentStatus.toLowerCase() === 'credited' && creditDate && (
                    <div className="text-right">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {creditDate.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Bank Stage 1: Submitted */}
                <div className={`flex items-center space-x-4 p-4 rounded-lg ${
                  currentStage >= 1 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentStage >= 1 ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {currentStage >= 1 ? (
                      <FileText size={16} className="text-blue-600" />
                    ) : (
                      <span className="text-gray-500 font-bold text-sm">1</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 uppercase tracking-wide">
                      BANK WITHDRAWAL SUBMITTED
                    </p>
                    <p className="text-gray-600 text-sm uppercase tracking-wide">
                      {currentStage >= 1 
                        ? `SUBMITTED ON ${new Date(submissionDate).toLocaleDateString()}`
                        : 'AWAITING SUBMISSION'
                      }
                    </p>
                  </div>
                  {currentStage >= 1 && (
                    <div className="text-right">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {new Date(submissionDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bank Stage 2: Governor Approved */}
                <div className={`flex items-center space-x-4 p-4 rounded-lg ${
                  currentStage >= 2 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentStage >= 2 ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {currentStage >= 2 ? (
                      <Shield size={16} className="text-green-600" />
                    ) : (
                      <span className="text-gray-500 font-bold text-sm">2</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 uppercase tracking-wide">
                      GOVERNOR APPROVED
                    </p>
                    <p className="text-gray-600 text-sm uppercase tracking-wide">
                      {currentStage >= 2 
                        ? 'BANK WITHDRAWAL APPROVED FOR PROCESSING'
                        : 'PENDING GOVERNOR APPROVAL'
                      }
                    </p>
                  </div>
                  {currentStage >= 2 && approvalDate && (
                    <div className="text-right">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {approvalDate.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bank Stage 3: Transfer Complete */}
                <div className={`flex items-center space-x-4 p-4 rounded-lg ${
                  currentStage >= 3 && currentStatus.toLowerCase() === 'credited' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentStage >= 3 && currentStatus.toLowerCase() === 'credited' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {currentStage >= 3 && currentStatus.toLowerCase() === 'credited' ? (
                      <Building size={16} className="text-green-600" />
                    ) : (
                      <span className="text-gray-500 font-bold text-sm">3</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 uppercase tracking-wide">
                      BANK TRANSFER COMPLETE
                    </p>
                    <p className="text-gray-600 text-sm uppercase tracking-wide">
                      {currentStage >= 3 && currentStatus.toLowerCase() === 'credited'
                        ? 'FUNDS SUCCESSFULLY TRANSFERRED TO YOUR BANK ACCOUNT'
                        : 'AWAITING BANK TRANSFER COMPLETION'
                      }
                    </p>
                  </div>
                  {currentStage >= 3 && currentStatus.toLowerCase() === 'credited' && creditDate && (
                    <div className="text-right">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {creditDate.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Rejection/Refund Stage */}
            {(currentStatus.toLowerCase() === 'rejected' || currentStatus.toLowerCase() === 'refunded') && (
              <div className={`flex items-center space-x-4 p-4 rounded-lg ${
                currentStatus.toLowerCase() === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-purple-50 border border-purple-200'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  currentStatus.toLowerCase() === 'rejected' ? 'bg-red-100' : 'bg-purple-100'
                }`}>
                  {currentStatus.toLowerCase() === 'rejected' ? (
                    <XCircle size={16} className="text-red-600" />
                  ) : (
                    <TrendingUp size={16} className="text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 uppercase tracking-wide">
                    {currentStatus.toLowerCase() === 'rejected' ? 'WITHDRAWAL REJECTED' : 'WITHDRAWAL REFUNDED'}
                  </p>
                  <p className="text-gray-600 text-sm uppercase tracking-wide">
                    {currentStatus.toLowerCase() === 'rejected' 
                      ? 'WITHDRAWAL REQUEST WAS REJECTED BY GOVERNOR'
                      : 'WITHDRAWAL AMOUNT REFUNDED TO ACCOUNT BALANCE'
                    }
                  </p>
                  {rejectionReason && (
                    <p className="text-gray-600 text-xs mt-1 uppercase tracking-wide">
                      REASON: {rejectionReason}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {(rejectionDate || new Date()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Withdrawal Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h5 className="font-medium text-gray-800 mb-3 uppercase tracking-wide">
              WITHDRAWAL DETAILS
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 uppercase tracking-wide">AMOUNT</span>
                <span className="font-bold text-gray-900">${amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 uppercase tracking-wide">METHOD</span>
                <span className="font-bold text-gray-900">
                  {isCryptoWithdrawal ? 'CRYPTOCURRENCY' : 'BANK TRANSFER'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 uppercase tracking-wide">STATUS</span>
                <span className="font-bold text-gray-900">{currentStatus.toUpperCase()}</span>
              </div>
              {isCryptoWithdrawal && withdrawalRequest?.destinationDetails?.coinType && (
                <div className="flex justify-between">
                  <span className="text-gray-600 uppercase tracking-wide">COIN TYPE</span>
                  <span className="font-bold text-gray-900 ml-2">{withdrawalRequest?.destinationDetails?.coinType}</span>
                </div>
              )}
              {isCryptoWithdrawal && withdrawalRequest?.destinationDetails?.network && (
                <div className="flex justify-between">
                  <span className="text-gray-600 uppercase tracking-wide">NETWORK</span>
                  <span className="font-bold text-gray-900 ml-2">{withdrawalRequest?.destinationDetails?.network}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h5 className="font-medium text-gray-800 mb-3 uppercase tracking-wide">
              PROCESSING INFORMATION
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 uppercase tracking-wide">BUSINESS DAYS ELAPSED</span>
                <span className="font-bold text-gray-900">{businessDaysElapsed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 uppercase tracking-wide">ESTIMATED COMPLETION</span>
                <span className="font-bold text-gray-900">
                  {estimatedCompletion?.toLocaleDateString() || 'TBD'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 uppercase tracking-wide">PROCESSING TIME</span>
                <span className="font-bold text-gray-900">
                  {isCryptoWithdrawal ? '1-2 BUSINESS DAYS' : '1-3 BUSINESS DAYS'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Destination Information */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h5 className="font-medium text-gray-800 mb-3 uppercase tracking-wide">
            DESTINATION INFORMATION
          </h5>
          {isCryptoWithdrawal ? (
            <div className="space-y-2 text-sm">
              {withdrawalRequest?.destinationDetails?.address && (
                <div>
                  <span className="text-gray-600 uppercase tracking-wide">WALLET ADDRESS:</span>
                  <p className="font-mono text-gray-900 break-all mt-1">
                    {withdrawalRequest?.destinationDetails?.address}
                  </p>
                </div>
              )}
              {withdrawalRequest?.destinationDetails?.network && (
                <div>
                  <span className="text-gray-600 uppercase tracking-wide">NETWORK:</span>
                  <span className="font-bold text-gray-900 ml-2">{withdrawalRequest?.destinationDetails?.network}</span>
                </div>
              )}
              {withdrawalRequest?.destinationDetails?.coinType && (
                <div>
                  <span className="text-gray-600 uppercase tracking-wide">COIN TYPE:</span>
                  <span className="font-bold text-gray-900 ml-2">{withdrawalRequest?.destinationDetails?.coinType}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600 uppercase tracking-wide">TRANSFER METHOD:</span>
                <span className="font-bold text-gray-900 ml-2">BANK WIRE TRANSFER</span>
              </div>
              <div>
                <span className="text-gray-600 uppercase tracking-wide">PROCESSING TIME:</span>
                <span className="font-bold text-gray-900 ml-2">1-3 BUSINESS DAYS</span>
              </div>
              <div>
                <span className="text-gray-600 uppercase tracking-wide">DESTINATION:</span>
                <span className="font-bold text-gray-900 ml-2">REGISTERED BANK ACCOUNT</span>
              </div>
            </div>
          )}
        </div>

        {/* MT103 Document Section - Only for credited bank withdrawals */}
        {!isCryptoWithdrawal && currentStatus.toLowerCase() === 'credited' && investor && (
          <MT103GeneratorDisplay 
            withdrawalRequest={withdrawalRequest}
            investor={investor}
          />
        )}
      </div>
    </div>
  );
};

export default WithdrawalProgressBar;