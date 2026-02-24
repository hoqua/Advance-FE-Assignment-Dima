import {Account, CreateAccountPayload} from '@/domain/Account';
import {Transaction, MoveMoneyPayload} from '@/domain/Transaction';
import {get, post, put, remove} from '@/flexxApi/FlexxApiClientService';

class FlexxApiService {
  private formatQueryParams(
    params?: Record<
      string,
      string | number | boolean | undefined | string[] | number[] | Date
    >,
  ): string {
    if (!params) return '';
    const queryParams = new URLSearchParams();
    for (const key in params) {
      const value = params[key];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, String(item)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    }
    return queryParams.toString();
  }

  async fetchAccounts(params: {search_term?: string}): Promise<Account[]> {
    const queryParams = this.formatQueryParams(params);
    return get<Account[]>({endpoint: `pages/accounts?${queryParams}`});
  }

  async fetchTransactions(params?: {
    account_id?: string;
    search_term?: string;
  }): Promise<Transaction[]> {
    const queryParams = this.formatQueryParams(params);
    return get<Transaction[]>({endpoint: `pages/transaction?${queryParams}`});
  }

  async fetchAccountTransactions(
    accountId: string,
    params?: {search_term?: string},
  ): Promise<Transaction[]> {
    const queryParams = this.formatQueryParams(params);
    return get<Transaction[]>({
      endpoint: `pages/accounts/${accountId}/transactions?${queryParams}`,
    });
  }

  async createAccount(payload: CreateAccountPayload): Promise<Account> {
    return post<Account>({endpoint: 'pages/accounts', body: payload});
  }

  async moveMoney(payload: MoveMoneyPayload): Promise<Transaction[]> {
    return post<Transaction[]>({endpoint: 'move-money', body: payload});
  }
}

let instance: FlexxApiService | null = null;

const flexxApiService = (): FlexxApiService => {
  if (!instance) {
    instance = new FlexxApiService();
  }

  return instance;
};

export default flexxApiService;

export {get, put, post, remove, FlexxApiService};
