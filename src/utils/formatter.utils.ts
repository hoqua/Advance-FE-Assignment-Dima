import debounce from 'lodash/debounce';
import {toast} from 'react-toastify';
import {format, parse} from 'date-fns';
import {toZonedTime} from 'date-fns-tz';

function formatUtcToLocal(utcIso: number | string | Date): Date | null {
  const toDate = (v: number | string | Date): Date =>
    v instanceof Date ? v : new Date(v);
  const date = toDate(utcIso);

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // user's local tz
  const zoned = toZonedTime(date, tz);
  return zoned;
}

const formatDate = (
  date: number | string | Date,
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
): string => {
  try {
    const formatPatterns: Record<typeof size, string> = {
      xs: 'MMM d',
      sm: 'MMM d, yyyy',
      md: 'MMM dd yyyy',
      lg: 'MMM dd yyyy',
      xl: 'MMM dd yyyy HH:mm',
    };

    const zonedDate = formatUtcToLocal(date);
    if (!zonedDate) return '';

    const currentYear = new Date().getFullYear();
    const isCurrentYear = zonedDate.getFullYear() === currentYear;
    if (isCurrentYear && size !== 'lg' && size !== 'xl') {
      return format(zonedDate, 'MMM d');
    }

    return format(zonedDate, formatPatterns[size]);
  } catch {
    return '';
  }
};

const parseFormattedDate = (dateStr: string): number | null => {
  const currentYear = new Date().getFullYear();

  const formatPatterns = [
    {pattern: 'MMM d yyyy', addYear: true}, // xs
    {pattern: 'MMM d, yyyy', addYear: false}, // sm
    {pattern: 'MMM dd yyyy', addYear: false}, // md
    {pattern: 'MMM dd yyyy HH:mm', addYear: false}, // lg
  ];

  for (const {pattern, addYear} of formatPatterns) {
    const dateToParse = addYear ? `${dateStr} ${currentYear}` : dateStr;
    const parsedDate = parse(dateToParse, pattern, new Date());
    if (!isNaN(parsedDate.getTime())) return parsedDate.getTime();
  }

  return null;
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

const formatCurrency = ({
  amount,
  currency = 'USD',
  showCents = true,
  currencyDisplay = 'symbol',
}: {
  amount?: number;
  currency?: string;
  showCents?: boolean;
  currencyDisplay?: 'symbol' | 'code' | 'name';
}) => {
  const shouldShowCents = showCents && amount && Number(amount) < 1_000_000;

  if (amount === undefined || amount === null || isNaN(amount)) {
    return '—';
  }

  if (currencyDisplay === 'code') {
    const currencyCode = currency.toUpperCase();
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: shouldShowCents ? 2 : 0,
    }).format(amount);
    return `${formattedAmount} ${currencyCode}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: shouldShowCents ? 2 : 0,
  }).format(amount);
};

const formatName = (name?: string) => {
  const trimmed = name?.trim();
  return trimmed
    ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
    : '';
};

const formatFullName = ({
  first,
  last,
  email,
}: {
  first?: string;
  last?: string;
  email?: string;
}) => {
  const parts = [formatName(first), formatName(last)].filter(Boolean).join(' ');
  return parts || email || '';
};

const formatNameFromEmail = (email?: string) => {
  const userName = email ? email.split('@')[0] : 'User';
  const first = userName.split('.')[0];
  const last = userName.split('.')[1];
  return formatFullName({first, last});
};

const formatBusinessNameFromEmail = (email?: string) => {
  const domain = email?.split?.('@')?.[1];
  const businessName = domain?.split?.('.')?.[0];
  return formatName(businessName);
};

const formatEmail = (email?: string) => {
  return email ? email.toLowerCase() : '';
};

const capitalizeFirstLetter = (str?: string | null) => {
  return str
    ? str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';
};

const formatAccountNumber = (str: string) => {
  const full = formatFullAccountNumber(str);
  let digitsSeen = 0;
  const maskUpTo = str.length - 4;

  return full
    .split('')
    .map(ch => {
      if (ch === ' ') return ' ';
      digitsSeen++;
      return digitsSeen <= maskUpTo ? '*' : ch;
    })
    .join('');
};

const formatFullAccountNumber = (str: string) => {
  const first4 = str.slice(0, 4);
  const second4 = str.slice(4, 8);
  const third4 = str.slice(8, 12);
  const last4 = str.slice(12);
  return `${first4} ${second4} ${third4} ${last4}`;
};

const formatAddress = ({
  address1,
  city,
  zip,
  state,
  country,
}: {
  address1?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
}) => {
  const parts = [
    address1 ? capitalizeFirstLetter(address1) : '',
    city ? capitalizeFirstLetter(city) : '',
    state ? capitalizeFirstLetter(state) : '',
    zip ? zip : '',
    country ? capitalizeFirstLetter(country) : '',
  ].filter(part => part !== '');

  return parts.join(', ');
};

const copyToClipboard = debounce((text: string) => {
  navigator.clipboard.writeText(text).catch(err => {
    toast.error(`Failed to copy text: ${err}`, {
      position: 'bottom-right',
    });
  });
}, 300);

const isNonZeroNumber = (value?: unknown): boolean => {
  return (
    value !== undefined &&
    value !== null &&
    !Number.isNaN(Number(value)) &&
    Number(value) !== 0
  );
};

const formatPaymentNumber = (paymentNumber?: string): string | undefined => {
  if (!paymentNumber) return undefined;
  return `•••• ${paymentNumber.slice(-4)}`;
};

export {
  formatDate,
  formatEmail,
  formatNumber,
  formatAddress,
  formatCurrency,
  formatFullName,
  isNonZeroNumber,
  copyToClipboard,
  parseFormattedDate,
  formatNameFromEmail,
  formatAccountNumber,
  formatPaymentNumber,
  capitalizeFirstLetter,
  formatFullAccountNumber,
  formatBusinessNameFromEmail,
};
