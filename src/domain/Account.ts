enum AccountStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  INVALID = 'invalid',
}

interface Account {
  account_id: string;
  name: string;
  routing_number: string;
  account_number: string;
  bank_name: string;
  bank_icon: string;
  status: AccountStatus;
  balance: number;
}

type CreateAccountPayload = Omit<Account, 'account_id'>;

export {AccountStatus};
export type {Account, CreateAccountPayload};
