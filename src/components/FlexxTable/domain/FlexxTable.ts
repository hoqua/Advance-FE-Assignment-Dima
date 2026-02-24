/* eslint-disable @typescript-eslint/no-explicit-any */
import {JSX} from 'react';
import type {Comparator} from 'lodash';

type FlexxTableRowDataType =
  | string
  | number
  | JSX.Element
  | undefined
  | null
  | Array<string | number | JSX.Element | undefined | null>;

type FlexxTableData = Record<string, FlexxTableRowDataType>;

interface FlexxTableRow {
  data: FlexxTableData;
  onClick?: () => void;
  collapsible?: {
    open?: boolean;
    content?: (columnWidths: number[]) => JSX.Element;
  };
  metadata?: any;
  selected?: boolean;
}

type columnWidth = 100 | 200 | 300 | 400 | 500;

type ItemTheme = 'success' | 'warning' | 'default';

type Alignment = 'inherit' | 'left' | 'center' | 'right';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl';

type SortOrder = 'asc' | 'desc';

export type DateFormat = 'xs' | 'sm' | 'md' | 'lg';

interface FlexxColumn {
  field: string;
  align?: Alignment;
  headerName?: string | JSX.Element;
  priority?: number;
  hiddenOn?: Breakpoint;
  currency?: boolean;
  percentage?: boolean;
  defaultSort?: SortOrder;
  comparator?: Comparator<any>;
  showCents?: boolean;
  dateFormat?: DateFormat;
  emptyField?: boolean;
  disableSort?: boolean;
  style?: {
    color?: string;
    fontSize?: string | number;
    width?: columnWidth | number;
    rightSeparator?: boolean;
    leftSeparator?: boolean;
    bold?: boolean;
    padding?: string | number;
    margin?: string | number;
    alignContent?: string;
  };
  isSpacer?: boolean;
  decorator?: (value: string) => ItemTheme | undefined;
}

const cellColors: Record<ItemTheme, string> = {
  success: '#046E43',
  warning: '#1E1E2A',
  default: 'default',
};

export type {
  Alignment,
  SortOrder,
  FlexxColumn,
  FlexxTableRow,
  FlexxTableData,
  FlexxTableRowDataType,
};
export {cellColors};
