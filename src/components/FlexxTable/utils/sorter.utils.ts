/* eslint-disable @typescript-eslint/no-explicit-any */
import type {Comparator} from 'lodash';
import {isValid, parseISO, compareDesc} from 'date-fns';

import {FlexxTableRow, SortOrder} from '../domain/FlexxTable';

function descendingComparator(
  a: FlexxTableRow,
  b: FlexxTableRow,
  orderBy: string,
  comparator?: Comparator<FlexxTableRow> | null,
) {
  if (comparator) {
    return comparator(a?.metadata, b?.metadata) ? -1 : 1;
  }
  const aRaw = a.data[orderBy];
  const bRaw = b.data[orderBy];
  const aValue = aRaw?.toString() ?? '';
  const bValue = bRaw?.toString() ?? '';

  const aDate = parseISO(aValue);
  const bDate = parseISO(bValue);
  if (isValid(aDate) && isValid(bDate)) {
    return compareDesc(aDate, bDate);
  }

  const aNum = Number(aValue);
  const bNum = Number(bValue);
  if (isFinite(aNum) && isFinite(bNum)) {
    return bNum - aNum;
  }

  return bValue.toLowerCase().localeCompare(aValue.toLowerCase());
}

function getComparator(
  order: SortOrder,
  orderBy: string,
  comparator?: Comparator<any> | null,
): (a: any, b: any) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy, comparator)
    : (a, b) => -descendingComparator(a, b, orderBy, comparator);
}

function stableSort(
  array: FlexxTableRow[],
  comparator: (a: FlexxTableRow, b: FlexxTableRow) => number,
) {
  const stabilizedThis = array.map(
    (el, index) => [el, index] as [FlexxTableRow, number],
  );
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

export {stableSort, getComparator, descendingComparator};
