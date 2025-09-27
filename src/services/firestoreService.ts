import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Investor, Transaction, WithdrawalRequest, Commission, User, SystemSettings, AuditLog } from '../types/user';

export class FirestoreService {
  // System Settings Management
  static async getSystemSettings(): Promise<SystemSettings | null> {
    try {
      console.log('🔧 Fetching system settings...');
      const settingsDoc = await getDoc(doc(db, 'systemSettings', 'main'));
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        console.log('✅ System settings loaded:', data);
        return {
          ...data,
          updatedAt: data.updatedAt?.toDate() || new Date(),
          // Ensure systemControls exists with defaults
          systemControls: data.systemControls || {
            withdrawalsEnabled: true,
            messagingEnabled: true,
            profileUpdatesEnabled: true,
            loginEnabled: true,
            restrictedMode: false,
            allowedPages: [],
            restrictionReason: '',
            restrictionLevel: 'none'
          }
        } as SystemSettings;
      }
      
      console.log('⚠️ No system settings found');
      return null;
    } catch (error) {
      console.error('❌ Error fetching system settings:', error);
      throw error;
    }
  }

  static async initializeSystemSettings(governorId: string, governorName: string): Promise<void> {
    try {
      console.log('🔧 Initializing default system settings...');
      
      const defaultSettings: Omit<SystemSettings, 'updatedAt'> = {
        maintenanceMode: false,
        maintenanceMessage: 'System is currently under maintenance. Please try again later.',
        systemControls: {
          withdrawalsEnabled: true,
          messagingEnabled: true,
          profileUpdatesEnabled: true,
          loginEnabled: true,
          restrictedMode: false,
          allowedPages: [],
          restrictionReason: '',
          restrictionLevel: 'none'
        },
        minWithdrawal: 100,
        maxWithdrawal: 50000,
        commissionRate: 15,
        autoApprovalLimit: 1000,
        securityLevel: 'MEDIUM',
        requireW8Ben: true,
        updatedBy: governorName
      };

      await setDoc(doc(db, 'systemSettings', 'main'), {
        ...defaultSettings,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Default system settings initialized');
    } catch (error) {
      console.error('❌ Error initializing system settings:', error);
      throw error;
    }
  }

  static async updateSystemSetting(
    settingKey: string,
    value: any,
    governorId: string,
    governorName: string,
    oldValue?: any
  ): Promise<void> {
    try {
      console.log(`🔧 Updating system setting: ${settingKey} = ${value}`);
      
      const settingsRef = doc(db, 'systemSettings', 'main');
      await updateDoc(settingsRef, {
        [settingKey]: value,
        updatedAt: serverTimestamp(),
        updatedBy: governorName
      });

      // Log the change in audit trail
      await this.logAuditAction(
        governorId,
        governorName,
        'System Setting Update',
        'system',
        'System Settings',
        {
          settingName: settingKey,
          oldValue,
          newValue: value
        }
      );
      
      console.log(`✅ System setting updated: ${settingKey}`);
    } catch (error) {
      console.error(`❌ Error updating system setting ${settingKey}:`, error);
      throw error;
    }
  }

  // System Controls Management
  static async updateSystemControls(
    controls: SystemSettings['systemControls'],
    governorId: string,
    governorName: string
  ): Promise<void> {
    try {
      console.log('🔧 Updating system controls:', controls);
      
      const settingsRef = doc(db, 'systemSettings', 'main');
      await updateDoc(settingsRef, {
        systemControls: controls,
        updatedAt: serverTimestamp(),
        updatedBy: governorName
      });

      // Log the change in audit trail
      await this.logAuditAction(
        governorId,
        governorName,
        'System Control Update',
        'system',
        'System Controls',
        {
          controls,
          restrictionLevel: controls.restrictionLevel,
          restrictionReason: controls.restrictionReason
        }
      );
      
      console.log('✅ System controls updated successfully');
    } catch (error) {
      console.error('❌ Error updating system controls:', error);
      throw error;
    }
  }

  // Real-time listener for system settings
  static subscribeToSystemSettings(callback: (settings: SystemSettings | null) => void): () => void {
    console.log('🔄 Setting up real-time listener for system settings...');
    
    const settingsRef = doc(db, 'systemSettings', 'main');
    
    const unsubscribe = onSnapshot(
      settingsRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          console.log('🔄 System settings updated in real-time');
          
          const settings: SystemSettings = {
            ...data,
            updatedAt: data.updatedAt?.toDate() || new Date(),
            // Ensure systemControls exists with defaults
            systemControls: data.systemControls || {
              withdrawalsEnabled: true,
              messagingEnabled: true,
              profileUpdatesEnabled: true,
              loginEnabled: true,
              restrictedMode: false,
              allowedPages: [],
              restrictionReason: '',
              restrictionLevel: 'none'
            }
          } as SystemSettings;
          
          callback(settings);
        } else {
          console.log('⚠️ System settings document does not exist');
          callback(null);
        }
      },
      (error) => {
        console.error('❌ Real-time listener failed for system settings:', error);
        callback(null);
      }
    );

    return unsubscribe;
  }

  // Investors Management
  static async getInvestors(): Promise<Investor[]> {
    try {
      console.log('🔥 Firebase: Fetching all investors...');
      const investorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'investor')
      );
      
      const querySnapshot = await getDocs(investorsQuery);
      
      const investors = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          joinDate: data.joinDate || new Date().toISOString().split('T')[0],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }) as Investor[];
      
      console.log(`✅ Firebase: Retrieved ${investors.length} investors`);
      return investors;
    } catch (error) {
      console.error('❌ Firebase Error: Failed to fetch investors:', error);
      throw new Error(`Failed to load investors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getInvestorById(investorId: string): Promise<Investor | null> {
    try {
      console.log(`🔥 Firebase: Fetching investor ${investorId}...`);
      const investorDoc = await getDoc(doc(db, 'users', investorId));
      
      if (investorDoc.exists()) {
        const data = investorDoc.data();
        console.log(`✅ Firebase: Investor found: ${data.name}`);
        return {
          id: investorDoc.id,
          ...data,
          joinDate: data.joinDate || new Date().toISOString().split('T')[0],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Investor;
      }
      
      console.log(`⚠️ Firebase: Investor ${investorId} not found`);
      return null;
    } catch (error) {
      console.error(`❌ Firebase Error: Failed to fetch investor ${investorId}:`, error);
      throw new Error(`Failed to load investor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateInvestor(investorId: string, updates: Partial<Investor>): Promise<void> {
    try {
      console.log(`🔥 Firebase: Updating investor ${investorId}...`);
      const investorRef = doc(db, 'users', investorId);
      
      await updateDoc(investorRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Firebase: Investor ${investorId} updated successfully`);
    } catch (error) {
      console.error(`❌ Firebase Error: Failed to update investor ${investorId}:`, error);
      throw new Error(`Failed to update investor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateInvestorBalance(investorId: string, newBalance: number): Promise<void> {
    try {
      console.log(`💰 Firebase: Updating balance for investor ${investorId} to $${newBalance.toLocaleString()}`);
      await this.updateInvestor(investorId, { currentBalance: newBalance });
      console.log(`✅ Firebase: Balance updated successfully`);
    } catch (error) {
      console.error(`❌ Firebase Error: Failed to update balance:`, error);
      throw error;
    }
  }

  // Real-time listeners
  static subscribeToInvestors(callback: (investors: Investor[]) => void): () => void {
    console.log('🔄 Setting up real-time listener for investors...');
    
    const investorsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'investor')
    );
    
    const unsubscribe = onSnapshot(
      investorsQuery,
      (querySnapshot) => {
        console.log('🔄 Real-time update: Investors data changed');
        const investors = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            joinDate: data.joinDate || new Date().toISOString().split('T')[0],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          };
        }) as Investor[];
        
        callback(investors);
      },
      (error) => {
        console.error('❌ Real-time listener failed for investors:', error);
        callback([]);
      }
    );

    return unsubscribe;
  }

  static subscribeToInvestor(investorId: string, callback: (investor: Investor | null) => void): () => void {
    console.log(`🔄 Setting up real-time listener for investor: ${investorId}`);
    
    const investorRef = doc(db, 'users', investorId);
    
    const unsubscribe = onSnapshot(
      investorRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          console.log(`🔄 Real-time update: Investor ${data.name} data changed`);
          
          const investor: Investor = {
            id: docSnapshot.id,
            ...data,
            joinDate: data.joinDate || new Date().toISOString().split('T')[0],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as Investor;
          
          callback(investor);
        } else {
          console.log(`⚠️ Investor ${investorId} not found`);
          callback(null);
        }
      },
      (error) => {
        console.error(`❌ Real-time listener failed for investor ${investorId}:`, error);
        callback(null);
      }
    );

    return unsubscribe;
  }

  // Transactions Management
  static async getTransactions(investorId?: string): Promise<Transaction[]> {
    try {
      console.log(`🔥 Firebase: Fetching transactions${investorId ? ` for investor ${investorId}` : ' (all)'}...`);
      
      let transactionsQuery;
      if (investorId) {
        transactionsQuery = query(
          collection(db, 'transactions'),
          where('investorId', '==', investorId),
          orderBy('date', 'desc')
        );
      } else {
        transactionsQuery = query(
          collection(db, 'transactions'),
          orderBy('date', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(transactionsQuery);
      
      const transactions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        };
      }) as Transaction[];
      
      console.log(`✅ Firebase: Retrieved ${transactions.length} transactions`);
      return transactions;
    } catch (error) {
      console.error('❌ Firebase Error: Failed to fetch transactions:', error);
      throw new Error(`Failed to load transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> {
    try {
      console.log(`💰 Firebase: Adding ${transaction.type} transaction for ${transaction.investorId}: $${transaction.amount.toLocaleString()}`);
      
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transaction,
        createdAt: serverTimestamp()
      });
      
      console.log(`✅ Firebase: Transaction added with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Firebase Error: Failed to add transaction:', error);
      throw new Error(`Failed to add transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static subscribeToTransactions(investorId: string, callback: (transactions: Transaction[]) => void): () => void {
    console.log(`🔄 Setting up real-time listener for transactions: ${investorId}`);
    
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('investorId', '==', investorId),
      orderBy('date', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      transactionsQuery,
      (querySnapshot) => {
        console.log(`🔄 Real-time update: Transactions updated for investor ${investorId}`);
        const transactions = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          };
        }) as Transaction[];
        
        callback(transactions);
      },
      (error) => {
        console.error(`❌ Real-time listener failed for transactions:`, error);
        callback([]);
      }
    );

    return unsubscribe;
  }

  // Withdrawal Requests Management
  static async getWithdrawalRequests(investorId?: string): Promise<WithdrawalRequest[]> {
    try {
      console.log(`🔥 Firebase: Fetching withdrawal requests${investorId ? ` for investor ${investorId}` : ' (all)'}...`);
      
      let withdrawalsQuery;
      if (investorId) {
        withdrawalsQuery = query(
          collection(db, 'withdrawalRequests'),
          where('investorId', '==', investorId),
          orderBy('date', 'desc')
        );
      } else {
        withdrawalsQuery = query(
          collection(db, 'withdrawalRequests'),
          orderBy('date', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(withdrawalsQuery);
      
      const withdrawalRequests = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          processedAt: data.processedAt?.toDate() || null,
          approvalDate: data.approvalDate?.toDate() || null,
          w8benSubmittedAt: data.w8benSubmittedAt?.toDate() || null,
          w8benApprovedAt: data.w8benApprovedAt?.toDate() || null,
          hashGeneratedAt: data.hashGeneratedAt?.toDate() || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }) as WithdrawalRequest[];
      
      console.log(`✅ Firebase: Retrieved ${withdrawalRequests.length} withdrawal requests`);
      return withdrawalRequests;
    } catch (error) {
      console.error('❌ Firebase Error: Failed to fetch withdrawal requests:', error);
      throw new Error(`Failed to load withdrawal requests: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async addWithdrawalRequest(
    investorId: string,
    investorName: string,
    amount: number
  ): Promise<string> {
    try {
      console.log(`💸 Firebase: Adding withdrawal request for ${investorName}: $${amount.toLocaleString()}`);
      
      const withdrawalData = {
        investorId,
        investorName,
        amount,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        requestedBy: 'investor',
        type: 'bank',
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'withdrawalRequests'), withdrawalData);
      
      console.log(`✅ Firebase: Withdrawal request added with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Firebase Error: Failed to add withdrawal request:', error);
      throw new Error(`Failed to add withdrawal request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async addCryptoWithdrawalRequest(
    investorId: string,
    investorName: string,
    amount: number,
    cryptoWallet: any
  ): Promise<string> {
    try {
      console.log(`💸 Firebase: Adding crypto withdrawal request for ${investorName}: $${amount.toLocaleString()}`);
      
      const withdrawalData = {
        investorId,
        investorName,
        amount,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        requestedBy: 'investor',
        type: 'crypto',
        cryptoWalletId: cryptoWallet.id,
        cryptoWalletAddress: cryptoWallet.walletAddress,
        cryptoNetworkType: cryptoWallet.networkType,
        cryptoCoinType: cryptoWallet.coinType,
        destinationDetails: {
          id: cryptoWallet.id,
          address: cryptoWallet.walletAddress,
          coinType: cryptoWallet.coinType,
          network: cryptoWallet.networkType,
          label: `${cryptoWallet.coinType} Wallet`,
          qrCode: cryptoWallet.qrCodeData,
          isPrimary: cryptoWallet.isPrimary,
          createdAt: cryptoWallet.createdAt
        },
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'withdrawalRequests'), withdrawalData);
      
      console.log(`✅ Firebase: Crypto withdrawal request added with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Firebase Error: Failed to add crypto withdrawal request:', error);
      throw new Error(`Failed to add crypto withdrawal request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateWithdrawalRequest(
    requestId: string,
    status: string,
    processedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      console.log(`💸 Firebase: Updating withdrawal request ${requestId} to ${status}`);
      
      const updateData: any = {
        status,
        processedBy,
        processedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      if (status.toLowerCase() === 'approved') {
        updateData.approvalDate = serverTimestamp();
      }
      
      if (reason) {
        updateData.reason = reason;
      }
      
      await updateDoc(doc(db, 'withdrawalRequests', requestId), updateData);
      
      console.log(`✅ Firebase: Withdrawal request ${requestId} updated to ${status}`);
    } catch (error) {
      console.error(`❌ Firebase Error: Failed to update withdrawal request:`, error);
      throw new Error(`Failed to update withdrawal request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async generateCryptoTransactionHash(withdrawalId: string): Promise<string> {
    try {
      console.log(`🔗 Firebase: Generating crypto transaction hash for withdrawal ${withdrawalId}`);
      
      // Generate a realistic-looking transaction hash
      const hash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      
      await updateDoc(doc(db, 'withdrawalRequests', withdrawalId), {
        transactionHash: hash,
        hashGeneratedAt: serverTimestamp(),
        hashGeneratedBy: 'SYSTEM',
        hashStatus: 'generated',
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Firebase: Transaction hash generated: ${hash}`);
      return hash;
    } catch (error) {
      console.error('❌ Firebase Error: Failed to generate transaction hash:', error);
      throw error;
    }
  }

  // Commissions Management
  static async getCommissions(): Promise<Commission[]> {
    try {
      console.log('🔥 Firebase: Fetching commissions...');
      const commissionsQuery = query(
        collection(db, 'commissions'),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(commissionsQuery);
      
      const commissions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        };
      }) as Commission[];
      
      console.log(`✅ Firebase: Retrieved ${commissions.length} commission records`);
      return commissions;
    } catch (error) {
      console.error('❌ Firebase Error: Failed to fetch commissions:', error);
      throw new Error(`Failed to load commissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async addCommission(commission: Omit<Commission, 'id' | 'createdAt'>): Promise<string> {
    try {
      console.log(`💰 Firebase: Adding commission for ${commission.investorName}: $${commission.commissionAmount.toLocaleString()}`);
      
      const docRef = await addDoc(collection(db, 'commissions'), {
        ...commission,
        createdAt: serverTimestamp()
      });
      
      console.log(`✅ Firebase: Commission added with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Firebase Error: Failed to add commission:', error);
      throw new Error(`Failed to add commission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Credit Management
  static async addCreditToInvestor(
    investorId: string,
    amount: number,
    processedBy: string,
    creditType: 'Credit' | 'Earnings' = 'Credit',
    reason: string,
    startDate?: string,
    endDate?: string
  ): Promise<void> {
    try {
      console.log(`💰 Firebase: Adding ${creditType} of $${amount.toLocaleString()} to investor ${investorId}`);
      
      // Get current investor data
      const investor = await this.getInvestorById(investorId);
      if (!investor) {
        throw new Error('Investor not found');
      }
      
      // Update investor balance
      const newBalance = investor.currentBalance + amount;
      await this.updateInvestorBalance(investorId, newBalance);
      
      // Add transaction record with enhanced description
      let description = reason;
      if (creditType === 'Earnings' && startDate && endDate) {
        description = `${reason} (Period: ${startDate} to ${endDate})`;
      }
      
      await this.addTransaction({
        investorId,
        type: creditType,
        amount,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        description,
        processedBy
      });
      
      console.log(`✅ Firebase: ${creditType} added successfully - New balance: $${newBalance.toLocaleString()}`);
    } catch (error) {
      console.error(`❌ Firebase Error: Failed to add ${creditType}:`, error);
      throw new Error(`Failed to add ${creditType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Balance Adjustment with Audit Trail
  static async adjustInvestorBalance(
    investorId: string,
    adjustmentAmount: number,
    reason: string,
    governorId: string,
    governorName: string
  ): Promise<void> {
    try {
      console.log(`⚖️ Firebase: Governor balance adjustment for ${investorId}: ${adjustmentAmount >= 0 ? '+' : ''}$${adjustmentAmount.toLocaleString()}`);
      
      // Get current investor data
      const investor = await this.getInvestorById(investorId);
      if (!investor) {
        throw new Error('Investor not found');
      }
      
      const oldBalance = investor.currentBalance;
      const newBalance = oldBalance + adjustmentAmount;
      
      // Update investor balance
      await this.updateInvestorBalance(investorId, newBalance);
      
      // Add transaction record
      await this.addTransaction({
        investorId,
        type: adjustmentAmount >= 0 ? 'Credit' : 'Adjustment',
        amount: Math.abs(adjustmentAmount),
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        description: `Governor balance adjustment: ${reason}`,
        processedBy: governorId
      });
      
      // Log audit action
      await this.logAuditAction(
        governorId,
        governorName,
        'Balance Adjustment',
        investorId,
        investor.name,
        {
          oldBalance,
          newBalance,
          adjustmentAmount,
          reason
        }
      );
      
      console.log(`✅ Firebase: Balance adjustment completed - Old: $${oldBalance.toLocaleString()}, New: $${newBalance.toLocaleString()}`);
    } catch (error) {
      console.error('❌ Firebase Error: Failed to adjust balance:', error);
      throw error;
    }
  }

  // Role Management with Audit Trail
  static async changeUserRole(
    userId: string,
    newRole: 'admin' | 'governor' | 'investor',
    reason: string,
    governorId: string,
    governorName: string
  ): Promise<void> {
    try {
      console.log(`👤 Firebase: Governor changing user ${userId} role to ${newRole}`);
      
      // Get current user data
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const oldRole = userData.role;
      
      // Update user role
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      
      // Log audit action
      await this.logAuditAction(
        governorId,
        governorName,
        'Role Change',
        userId,
        userData.name || 'Unknown User',
        {
          oldRole,
          newRole,
          reason
        }
      );
      
      console.log(`✅ Firebase: User role changed from ${oldRole} to ${newRole}`);
    } catch (error) {
      console.error('❌ Firebase Error: Failed to change user role:', error);
      throw error;
    }
  }

  // Crypto Wallet Management
  static async addCryptoWallet(
    investorId: string,
    walletData: any,
    requestedBy: string,
    requestedByName: string
  ): Promise<string> {
    try {
      console.log(`🪙 Firebase: Adding crypto wallet for investor ${investorId}`);
      
      // Get current investor data
      const investor = await this.getInvestorById(investorId);
      if (!investor) {
        throw new Error('Investor not found');
      }
      
      // Create new wallet with pending status
      const newWallet = {
        id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...walletData,
        verificationStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add to investor's cryptoWallets array
      const updatedWallets = [...(investor.cryptoWallets || []), newWallet];
      
      await this.updateInvestor(investorId, {
        cryptoWallets: updatedWallets
      });
      
      // Create verification request
      await addDoc(collection(db, 'cryptoWalletVerificationRequests'), {
        investorId,
        investorName: investor.name,
        newWalletData: newWallet,
        requestType: 'add',
        requestedBy,
        requestedByName,
        requestedAt: serverTimestamp(),
        status: 'pending'
      });
      
      console.log(`✅ Firebase: Crypto wallet added and verification request created`);
      return newWallet.id;
    } catch (error) {
      console.error('❌ Firebase Error: Failed to add crypto wallet:', error);
      throw error;
    }
  }

  static async updateCryptoWallet(
    investorId: string,
    walletId: string,
    walletData: any,
    requestedBy: string,
    requestedByName: string
  ): Promise<void> {
    try {
      console.log(`🪙 Firebase: Updating crypto wallet ${walletId} for investor ${investorId}`);
      
      // Get current investor data
      const investor = await this.getInvestorById(investorId);
      if (!investor) {
        throw new Error('Investor not found');
      }
      
      // Update wallet in investor's cryptoWallets array with pending status
      const updatedWallets = (investor.cryptoWallets || []).map(wallet =>
        wallet.id === walletId 
          ? { ...wallet, ...walletData, verificationStatus: 'pending', updatedAt: new Date() }
          : wallet
      );
      
      await this.updateInvestor(investorId, {
        cryptoWallets: updatedWallets
      });
      
      // Create verification request
      const updatedWallet = updatedWallets.find(w => w.id === walletId);
      if (updatedWallet) {
        await addDoc(collection(db, 'cryptoWalletVerificationRequests'), {
          investorId,
          investorName: investor.name,
          walletId,
          newWalletData: updatedWallet,
          requestType: 'update',
          requestedBy,
          requestedByName,
          requestedAt: serverTimestamp(),
          status: 'pending'
        });
      }
      
      console.log(`✅ Firebase: Crypto wallet update request created`);
    } catch (error) {
      console.error('❌ Firebase Error: Failed to update crypto wallet:', error);
      throw error;
    }
  }

  static async deleteCryptoWallet(
    investorId: string,
    walletId: string,
    requestedBy: string,
    requestedByName: string
  ): Promise<void> {
    try {
      console.log(`🪙 Firebase: Requesting deletion of crypto wallet ${walletId} for investor ${investorId}`);
      
      // Get current investor data
      const investor = await this.getInvestorById(investorId);
      if (!investor) {
        throw new Error('Investor not found');
      }
      
      // Find the wallet to be deleted
      const walletToDelete = (investor.cryptoWallets || []).find(w => w.id === walletId);
      if (!walletToDelete) {
        throw new Error('Crypto wallet not found');
      }
      
      // Create verification request for deletion
      await addDoc(collection(db, 'cryptoWalletVerificationRequests'), {
        investorId,
        investorName: investor.name,
        walletId,
        newWalletData: walletToDelete, // Include current wallet data for reference
        requestType: 'delete',
        requestedBy,
        requestedByName,
        requestedAt: serverTimestamp(),
        status: 'pending'
      });
      
      console.log(`✅ Firebase: Crypto wallet deletion request created`);
    } catch (error) {
      console.error('❌ Firebase Error: Failed to request crypto wallet deletion:', error);
      throw error;
    }
  }

  // Pro Account Management
  static async checkAndUpgradeInvestorAccount(
    investorId: string,
    investorName: string,
    adminId: string,
    adminName: string
  ): Promise<'upgraded' | 'already_pro' | 'not_payed' | 'not_found' | 'not_standard' | 'investor_not_found' | 'error'> {
    try {
      console.log(`🔄 Checking Pro status for investor: ${investorName} (${investorId})`);
      
      // Get investor data
      const investor = await this.getInvestorById(investorId);
      if (!investor) {
        console.log('❌ Investor not found in database');
        return 'investor_not_found';
      }
      
      // Check if already Pro
      if (investor.accountType === 'Pro') {
        console.log('ℹ️ Investor is already a Pro account holder');
        return 'already_pro';
      }
      
      // Check if account type is Standard (required for upgrade)
      if (investor.accountType !== 'Standard') {
        console.log(`ℹ️ Account type is ${investor.accountType}, not Standard`);
        return 'not_standard';
      }
      
      // Check for categorization document
      const categorizationDoc = await getDoc(doc(db, 'client_categorizations', investorId));
      
      if (!categorizationDoc.exists()) {
        console.log('ℹ️ No categorization document found');
        return 'not_found';
      }
      
      const categorizationData = categorizationDoc.data();
      console.log('📄 Categorization data:', categorizationData);
      
      // Check if status is "payed"
      if (categorizationData.status !== 'payed') {
        console.log(`ℹ️ Categorization status is "${categorizationData.status}", not "payed"`);
        return 'not_payed';
      }
      
      // Upgrade to Pro account
      console.log('🔄 Upgrading investor to Pro account...');
      await this.updateInvestor(investorId, {
        accountType: 'Pro',
        updatedAt: new Date()
      });
      
      // Add transaction record for the upgrade
      await this.addTransaction({
        investorId,
        type: 'Credit',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        description: `Account upgraded to Pro by ${adminName}`,
        processedBy: adminId
      });
      
      console.log('✅ Investor successfully upgraded to Pro account');
      return 'upgraded';
    } catch (error) {
      console.error('❌ Error checking/upgrading Pro status:', error);
      return 'error';
    }
  }

  // Commission Withdrawal Management
  static async addCommissionWithdrawalRequest(requestData: any): Promise<string> {
    try {
      console.log('💰 Firebase: Adding commission withdrawal request...');
      
      const docRef = await addDoc(collection(db, 'commissionWithdrawals'), {
        ...requestData,
        createdAt: serverTimestamp()
      });
      
      console.log(`✅ Firebase: Commission withdrawal request added: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Firebase Error: Failed to add commission withdrawal request:', error);
      throw error;
    }
  }

  // Account Creation Requests
  static async getAccountCreationRequests(): Promise<any[]> {
    try {
      console.log('🔥 Firebase: Fetching account creation requests...');
      const requestsQuery = query(
        collection(db, 'accountCreationRequests'),
        orderBy('requestedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(requestsQuery);
      
      const requests = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          requestedAt: data.requestedAt?.toDate() || new Date(),
          reviewedAt: data.reviewedAt?.toDate() || null,
          agreementAcceptedAt: data.agreementAcceptedAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });
      
      console.log(`✅ Firebase: Retrieved ${requests.length} account creation requests`);
      return requests;
    } catch (error) {
      console.error('❌ Firebase Error: Failed to fetch account creation requests:', error);
      throw error;
    }
  }

  static async addAccountCreationRequest(requestData: any): Promise<string> {
    try {
      console.log('🔥 Firebase: Adding account creation request...');
      
      const docRef = await addDoc(collection(db, 'accountCreationRequests'), {
        ...requestData,
        requestedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Firebase: Account creation request added: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Firebase Error: Failed to add account creation request:', error);
      throw error;
    }
  }

  static async updateAccountCreationRequest(requestId: string, updates: any): Promise<void> {
    try {
      console.log(`🔥 Firebase: Updating account creation request ${requestId}...`);
      
      await updateDoc(doc(db, 'accountCreationRequests', requestId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Firebase: Account creation request updated`);
    } catch (error) {
      console.error('❌ Firebase Error: Failed to update account creation request:', error);
      throw error;
    }
  }

  // Audit Logs
  static async getAuditLogs(limitCount: number = 50): Promise<AuditLog[]> {
    try {
      console.log(`🔍 Firebase: Fetching audit logs (limit: ${limitCount})...`);
      
      const auditQuery = query(
        collection(db, 'auditLogs'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(auditQuery);
      
      const logs = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        };
      }) as AuditLog[];
      
      console.log(`✅ Firebase: Retrieved ${logs.length} audit logs`);
      return logs;
    } catch (error) {
      console.error('❌ Firebase Error: Failed to fetch audit logs:', error);
      throw error;
    }
  }

  static async logAuditAction(
    governorId: string,
    governorName: string,
    action: string,
    targetId: string,
    targetName: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'auditLogs'), {
        governorId,
        governorName,
        action,
        targetId,
        targetName,
        details,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      
      console.log(`📝 Audit log created: ${action} on ${targetName}`);
    } catch (error) {
      console.error('❌ Error logging audit action:', error);
    }
  }

  // Generic document operations
  static async updateDocument(collection: string, documentId: string, updates: any): Promise<void> {
    try {
      console.log(`🔥 Firebase: Updating document ${documentId} in ${collection}...`);
      
      await updateDoc(doc(db, collection, documentId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Firebase: Document updated successfully`);
    } catch (error) {
      console.error(`❌ Firebase Error: Failed to update document:`, error);
      throw error;
    }
  }

  // Complete investor data wipe (Governor terminal command)
  static async completeInvestorWipe(
    investorId: string,
    investorName: string,
    governorId: string,
    governorName: string
  ): Promise<void> {
    try {
      console.log(`🔥 Firebase: GOVERNOR WIPE - Completely erasing investor ${investorName} (${investorId})...`);
      
      const batch = writeBatch(db);
      
      // Get all related data first
      const [transactionsQuery, withdrawalsQuery, messagesQuery] = [
        query(collection(db, 'transactions'), where('investorId', '==', investorId)),
        query(collection(db, 'withdrawalRequests'), where('investorId', '==', investorId)),
        query(collection(db, 'affiliateMessages'), where('senderId', '==', investorId))
      ];
      
      const [transactionsSnapshot, withdrawalsSnapshot, messagesSnapshot] = await Promise.all([
        getDocs(transactionsQuery),
        getDocs(withdrawalsQuery),
        getDocs(messagesQuery)
      ]);
      
      // Delete all transactions
      transactionsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete all withdrawal requests
      withdrawalsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete all messages
      messagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Update investor to wiped state
      const investorRef = doc(db, 'users', investorId);
      batch.update(investorRef, {
        name: '[WIPED BY GOVERNOR]',
        email: '[DELETED]',
        phone: '[DELETED]',
        country: '[DELETED]',
        location: '[DELETED]',
        currentBalance: 0,
        initialDeposit: 0,
        accountStatus: 'COMPLETELY WIPED BY GOVERNOR',
        isActive: false,
        accountFlags: {
          governorWiped: true,
          wipedAt: serverTimestamp(),
          wipedBy: governorName,
          wipedViaTerminal: true
        },
        bankDetails: {},
        bankAccounts: [],
        cryptoWallets: [],
        tradingData: {},
        verification: {},
        updatedAt: serverTimestamp()
      });
      
      // Log the wipe action
      const auditRef = doc(collection(db, 'auditLogs'));
      batch.set(auditRef, {
        governorId,
        governorName,
        action: 'COMPLETE DATA WIPE',
        targetId: investorId,
        targetName: `[WIPED] ${investorName}`,
        details: {
          wipedViaTerminal: true,
          wipedAt: serverTimestamp(),
          dataDestroyed: {
            transactions: transactionsSnapshot.size,
            withdrawals: withdrawalsSnapshot.size,
            messages: messagesSnapshot.size
          }
        },
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
      
      console.log(`✅ Firebase: GOVERNOR WIPE COMPLETED for investor ${investorName} (${investorId})`);
    } catch (error) {
      console.error(`❌ Firebase Error: Failed to complete investor wipe:`, error);
      throw error;
    }
  }
}