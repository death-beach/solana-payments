"use client";

// external
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// internal
import { supabase } from '../supabase';

type TransactionChanges = RealtimePostgresChangesPayload<{
  transaction_id: string;
  status: string;
  merchant_id: string;
  [key: string]: unknown;
}>;

type TransferChanges = RealtimePostgresChangesPayload<{
  transfer_id: string;
  status: string;
  merchant_id: string;
  [key: string]: unknown;
}>;

type MerchantChanges = RealtimePostgresChangesPayload<{
  merchant_id: string;
  kyc_status: string;
  [key: string]: unknown;
}>;

export const setupRealtimeSubscriptions = () => {
  const transactionSubscription = supabase
    .channel('transaction-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'transactions' },
      (payload: TransactionChanges) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        switch (eventType) {
          case 'INSERT':
            console.log('New transaction:', newRecord);
            break;
          case 'UPDATE':
            if (newRecord.status !== oldRecord?.status) {
              console.log('Transaction status changed:', {
                id: newRecord.transaction_id,
                oldStatus: oldRecord?.status,
                newStatus: newRecord.status,
              });
            }
            break;
        }
      },
    )
    .subscribe();

  const transferSubscription = supabase
    .channel('transfer-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'transfers' },
      (payload: TransferChanges) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        switch (eventType) {
          case 'INSERT':
            console.log('New transfer initiated:', newRecord);
            break;
          case 'UPDATE':
            if (newRecord.status !== oldRecord?.status) {
              console.log('Transfer status changed:', {
                id: newRecord.transfer_id,
                oldStatus: oldRecord?.status,
                newStatus: newRecord.status,
              });
            }
            break;
        }
      },
    )
    .subscribe();

  const merchantSubscription = supabase
    .channel('merchant-changes')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'merchants', filter: 'kyc_status=neq.previous:kyc_status' },
      (payload: MerchantChanges) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        switch (eventType) {
          case 'UPDATE':
            console.log('Merchant KYC status changed:', {
              id: newRecord.merchant_id,
              oldStatus: oldRecord.kyc_status,
              newStatus: newRecord.kyc_status,
            });
            break;
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(transactionSubscription);
    supabase.removeChannel(transferSubscription);
    supabase.removeChannel(merchantSubscription);
  };
};

export const subscribeToTransactions = (merchantId?: string) => {
  const filter = merchantId ? { filter: `merchant_id=eq.${merchantId}` } : {};
  return supabase
    .channel('transaction-updates')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'transactions', ...filter },
      (payload: TransactionChanges) => {
        const { eventType, new: newRecord } = payload;
        return { type: eventType, data: newRecord };
      },
    )
    .subscribe();
};

export const subscribeToTransfers = (merchantId?: string) => {
  const filter = merchantId ? { filter: `merchant_id=eq.${merchantId}` } : {};
  return supabase
    .channel('transfer-updates')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'transfers', ...filter },
      (payload: TransferChanges) => {
        const { eventType, new: newRecord } = payload;
        return { type: eventType, data: newRecord };
      },
    )
    .subscribe();
};

export const subscribeToMerchantKYC = (merchantId: string) => {
  return supabase
    .channel('kyc-updates')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'merchants', filter: `merchant_id=eq.${merchantId}` },
      (payload: MerchantChanges) => {
        const { eventType, new: newRecord } = payload;
        return { type: eventType, data: newRecord };
      },
    )
    .subscribe();
};