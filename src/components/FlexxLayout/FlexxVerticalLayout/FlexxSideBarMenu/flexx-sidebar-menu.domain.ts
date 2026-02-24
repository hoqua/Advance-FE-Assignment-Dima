import {Session} from '@/domain/Session';

enum FLEXX_MENU_ITEM_IDS {
  HOME = 'home',
  ACCOUNTS = 'accounts',
  TRANSACTIONS = 'transactions',
}

interface FlexxMenuItem {
  id: string;
  icon: string;
  title: string;
  href?: string;
  subMenu?: FlexxMenuItem[];
  persistentSubMenu?: FlexxMenuItem[];
  disabled?: boolean | ((session?: Session) => boolean);
}

export {FLEXX_MENU_ITEM_IDS};
export type {FlexxMenuItem};
