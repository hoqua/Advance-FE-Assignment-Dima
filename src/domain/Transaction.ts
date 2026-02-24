enum TransactionDirection {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

enum TransactionStatus {
  PENDING = 'pending',
}

interface Transaction {
  transaction_id: string;
  merchant: string;
  amount: number;
  direction: TransactionDirection;
  created_at: string;
  account_id: string;
  status: TransactionStatus | string;
  extra_data: Record<string, unknown>;
  user_created: boolean;
  account_name: string;
}

export {TransactionDirection, TransactionStatus};
export type {Transaction};
