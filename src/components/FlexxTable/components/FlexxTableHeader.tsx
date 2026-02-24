import type {Comparator} from 'lodash';
import React, {FC, useEffect, useRef} from 'react';

import FlexxIcon from '@components/FlexxIcon/FlexxIcon';
import {SMALL_CAPTION_FONT_SIZE} from '@/constants/font-sizes';
import {
  FlexxColumn,
  FlexxTableRow,
  SortOrder,
} from '@components/FlexxTable/domain/FlexxTable';
import {
  TableCell,
  TableCellProps,
  TableHead,
  TableRow,
  TableSortLabel,
  useTheme,
} from '@mui/material';

interface FlexxTableHeaderProps {
  columns: FlexxColumn[];
  tableHeadRef: React.RefObject<HTMLTableSectionElement>;
  align?: TableCellProps['align'];
  sortOrder?: SortOrder;
  orderBy: string | null;
  disableSort?: boolean;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: string,
    comparator?: Comparator<FlexxTableRow>,
  ) => void;
  setColumnWidths: (widths: number[]) => void;
  dataTestId?: string;
}

const FlexxTableHeader: FC<FlexxTableHeaderProps> = ({
  columns,
  tableHeadRef,
  align,
  sortOrder,
  orderBy,
  disableSort = false,
  onRequestSort,
  setColumnWidths,
  dataTestId,
}) => {
  const {palette} = useTheme();
  const cellRefs = useRef<(HTMLTableCellElement | null)[]>([]);

  const createSortHandler =
    (property: string, comparator?: Comparator<FlexxTableRow>) =>
    (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property, comparator);
    };

  const renderSortIcon = (column: FlexxColumn) => {
    const isActive = orderBy === column.field;
    const isDescending = isActive && sortOrder === 'desc';
    const rotationClass = isDescending ? 'rotate-180' : 'rotate-0';

    return (
      <FlexxIcon
        className={rotationClass}
        icon='fluent--arrow-sort-up-lines-16-regular'
      />
    );
  };

  const renderSortableHeader = (column: FlexxColumn) => {
    const isActive = orderBy === column.field;
    const sortDirection = isActive ? sortOrder : 'asc';

    return (
      <TableSortLabel
        active={isActive}
        direction={sortDirection}
        onClick={createSortHandler(column.field, column.comparator)}
        hideSortIcon={!isActive}
        sx={{gap: '0.5rem'}}
        IconComponent={() => renderSortIcon(column)}
      >
        <span>{column.headerName}</span>
      </TableSortLabel>
    );
  };

  const renderHeaderContent = (column: FlexxColumn) => {
    if (typeof column.headerName !== 'string') {
      return column.headerName;
    }

    if (disableSort || column.disableSort) {
      return <span>{column.headerName}</span>;
    }

    return renderSortableHeader(column);
  };

  useEffect(() => {
    if (cellRefs.current.length === columns.length) {
      const widths = cellRefs.current.map(cell => cell?.offsetWidth || 100);
      setColumnWidths(widths);
    }
  }, [cellRefs.current, columns]);

  return (
    <TableHead ref={tableHeadRef} data-testid={`${dataTestId}.TableHead`}>
      <TableRow>
        {columns.map((column, index) => (
          <TableCell
            ref={(el: HTMLTableCellElement | null) => {
              cellRefs.current[index] = el;
            }}
            key={column.field}
            width={column.style?.width}
            style={{
              color: column.style?.color ?? palette.secondary.main,
              fontSize: column.style?.fontSize ?? SMALL_CAPTION_FONT_SIZE,
              background: 'inherit',
              backdropFilter: 'blur(15px)',
              padding: column?.style?.padding ?? '0.4rem 1rem',
              paddingLeft: column.currency ? '24px' : undefined,
              alignContent: 'center',
              lineHeight: '1rem',
            }}
            align={column.align ?? align}
            data-testid={`${dataTestId}.${column.field}`}
          >
            {renderHeaderContent(column)}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default FlexxTableHeader;
