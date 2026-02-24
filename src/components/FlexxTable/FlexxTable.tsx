'use client';
import type {Comparator} from 'lodash';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import {useDynamicColumns} from '@components/FlexxTable/hooks';
import {useWindowResize} from '@components/FlexxTable/hooks/useWindowResize';
import FlexxTableBody from '@components/FlexxTable/components/FlexxTableBody';
import FlexxTableHeader from '@components/FlexxTable/components/FlexxTableHeader';
import FlexxTableSearchBar from '@components/FlexxTable/components/FlexxTableSearchBar';
import FlexxTablePagination from '@components/FlexxTable/components/FlexxTablePagination';
import {
  getComparator,
  stableSort,
} from '@components/FlexxTable/utils/sorter.utils';
import {
  Paper,
  Table,
  TableBody,
  TableCellProps,
  TableContainer,
} from '@mui/material';
import {
  FlexxColumn,
  FlexxTableRow,
  SortOrder,
} from '@components/FlexxTable/domain/FlexxTable';
import {
  DEFAULT_ROWS_PER_PAGE_OPTIONS,
  SINGLE_PAGE_OPTION,
  TABLE_BOTTOM_PADDING,
  TABLE_CONTAINER_MIN_HEIGHT,
} from '@components/FlexxTable/constants';

export interface PaginationProps {
  hasNextPage?: boolean;
  setPage?: (page: number) => void;
  hasPreviousPage?: boolean;
  page?: number;
  isFetching?: boolean;
  totalPages?: number;
  totalItems?: number;
}

interface FlexxTableProps {
  isLoading?: boolean;
  isError?: boolean;
  labelRowsPerPage?: string;
  columns: Iterable<FlexxColumn>;
  rows: FlexxTableRow[];
  disablePagination?: boolean;
  rowsPerPageHidden?: boolean;
  align?: TableCellProps['align'];
  skeletonRows?: number;
  maxHeight?: number | string;
  minHeight?: number | string;
  minWidth?: number | string;
  emptyState?: string;
  dataTestId?: string;
  customRowsPerPage?: number;
  noWrap?: boolean;
  maxLinesWrap?: number;
  noHeaders?: boolean;
  cellPadding?: string;
  totalItems?: number;
  disableSort?: boolean;
  paginationProps?: PaginationProps;
  searchBar?: {
    searchTerm: string;
    onChangeSearchTerm: (searchTerm: string) => void;
    placeHolder?: string;
  };
  onSort?: (property: string, order: SortOrder) => void;
}

const FlexxTable: React.FC<FlexxTableProps> = ({
  columns,
  rows,
  labelRowsPerPage,
  isLoading,
  isError,
  disablePagination,
  rowsPerPageHidden,
  align,
  skeletonRows,
  maxHeight,
  minHeight,
  minWidth,
  emptyState,
  dataTestId,
  customRowsPerPage,
  noWrap = true,
  maxLinesWrap,
  noHeaders = false,
  cellPadding = '0.5rem',
  totalItems,
  disableSort = false,
  paginationProps,
  searchBar,
  onSort,
}) => {
  const {processedColumns} = useDynamicColumns(columns);
  const defaultSort = disableSort
    ? null
    : processedColumns.find(column => column.defaultSort);

  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(customRowsPerPage || 10);
  const [columnWidths, setColumnWidths] = useState<number[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    defaultSort?.defaultSort ?? 'desc',
  );
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const comparatorRef = useRef<Comparator<FlexxTableRow> | null>(null);

  const tableHeadRef = useRef<HTMLTableSectionElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const {height} = useWindowResize();
  const [tableContainerHeight, setTableContainerHeight] = useState<
    number | string
  >(maxHeight || TABLE_CONTAINER_MIN_HEIGHT);

  const tableMinHeight = useMemo(() => {
    if (minHeight) return minHeight;
    if (rows.length === 0) return TABLE_CONTAINER_MIN_HEIGHT;
    if (TABLE_CONTAINER_MIN_HEIGHT > Number(tableContainerHeight)) {
      return tableContainerHeight;
    }
    return TABLE_CONTAINER_MIN_HEIGHT;
  }, [rows, minHeight, tableContainerHeight]);

  const isPaginationHidden = useMemo(
    () => disablePagination || rows.length === 0,
    [disablePagination, rows],
  );

  useEffect(() => {
    if (maxHeight) {
      setTableContainerHeight(maxHeight);
      return;
    }

    if (!wrapperRef.current) return;

    const wrapperOffsetTop = wrapperRef.current.getBoundingClientRect().top;
    const offsetFromBottom = TABLE_BOTTOM_PADDING;
    const windowHeight = window.innerHeight;
    const fullPageHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight;

    const heightToUse =
      fullPageHeight > windowHeight ? fullPageHeight : windowHeight;
    const calculatedHeight = Math.round(
      heightToUse - wrapperOffsetTop - offsetFromBottom,
    );

    setTableContainerHeight(
      Math.max(calculatedHeight, TABLE_CONTAINER_MIN_HEIGHT),
    );
  }, [height, maxHeight, isPaginationHidden]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string,
    comparator?: Comparator<FlexxTableRow>,
  ) => {
    if (disableSort) {
      return;
    }
    const isAsc = orderBy === property && sortOrder === 'asc';
    const newSortOrder = isAsc ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    setOrderBy(property);

    if (onSort) {
      onSort(property, newSortOrder);
      return;
    }

    comparatorRef.current = comparator ?? null;
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
    tableHeadRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
    paginationProps?.setPage?.(newPage + 1);
  };

  const rowsPerPageOptions = rowsPerPageHidden
    ? SINGLE_PAGE_OPTION
    : DEFAULT_ROWS_PER_PAGE_OPTIONS;

  const sortedRows = useMemo(() => {
    return orderBy && !noHeaders && !disableSort && !onSort
      ? stableSort(
          rows,
          getComparator(sortOrder, orderBy, comparatorRef.current),
        )
      : rows;
  }, [rows, sortOrder, orderBy, noHeaders, disableSort]);

  const visibleRows = useMemo(() => {
    if (isPaginationHidden || paginationProps) return sortedRows;

    return sortedRows.slice(
      currentPage * rowsPerPage,
      currentPage * rowsPerPage + rowsPerPage,
    );
  }, [
    sortedRows,
    sortOrder,
    orderBy,
    currentPage,
    rowsPerPage,
    isPaginationHidden,
    noHeaders,
  ]);

  return (
    <Paper
      ref={wrapperRef}
      sx={{
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        boxShadow: 'none',
        backgroundColor: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      }}
      className='flexx-table-container'
      data-testid={`${dataTestId}.Paper`}
    >
      {searchBar && (
        <FlexxTableSearchBar
          searchTerm={searchBar.searchTerm}
          onChangeSearchTerm={searchBar.onChangeSearchTerm}
          placeholder={searchBar.placeHolder}
        />
      )}
      <TableContainer
        sx={{
          maxHeight: tableContainerHeight,
          minHeight: tableMinHeight,
          position: 'relative',
          overflowX: 'auto',
        }}
        data-testid={`${dataTestId}.TableContainer`}
      >
        <Table
          stickyHeader={!noHeaders}
          className='flexx-table'
          data-testid={`${dataTestId}.Table`}
          sx={{minWidth}}
        >
          {!noHeaders && (
            <FlexxTableHeader
              columns={processedColumns}
              tableHeadRef={
                tableHeadRef as React.RefObject<HTMLTableSectionElement>
              }
              align={align}
              setColumnWidths={setColumnWidths}
              sortOrder={sortOrder}
              orderBy={orderBy}
              disableSort={disableSort}
              onRequestSort={handleRequestSort}
              dataTestId={dataTestId}
            />
          )}
          <TableBody data-testid={`${dataTestId}.TableBody`}>
            <FlexxTableBody
              rows={visibleRows}
              columns={processedColumns}
              align={align}
              columnWidths={noHeaders ? [] : columnWidths}
              isError={isError}
              isLoading={isLoading}
              processedColumns={processedColumns}
              skeletonRows={skeletonRows ?? customRowsPerPage}
              emptyState={emptyState}
              dataTestId={dataTestId}
              noWrap={noWrap}
              maxLinesWrap={maxLinesWrap}
              cellPadding={cellPadding}
            />
          </TableBody>
        </Table>
        <FlexxTablePagination
          dataTestId={dataTestId}
          totalItems={paginationProps?.totalItems}
          disablePagination={isPaginationHidden}
          isLoading={isLoading}
          labelRowsPerPage={labelRowsPerPage}
          rowsCount={totalItems ?? rows.length}
          rowsPerPage={rowsPerPage}
          currentPage={
            paginationProps?.page ? paginationProps?.page - 1 : currentPage
          }
          rowsPerPageOptions={customRowsPerPage ? [] : rowsPerPageOptions}
          handlePageChange={handlePageChange}
          handleRowsPerPageChange={handleRowsPerPageChange}
        />
      </TableContainer>
    </Paper>
  );
};

export {FlexxTable};
