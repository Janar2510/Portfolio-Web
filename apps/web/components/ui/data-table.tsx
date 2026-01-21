import * as React from 'react';
import { cn } from '@/lib/utils';

interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
}

const DataTableContainer = React.forwardRef<HTMLDivElement, DataTableProps>(
  ({ className, compact, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'overflow-x-auto border border-border rounded-lg',
        className
      )}
      {...props}
    />
  )
);
DataTableContainer.displayName = 'DataTableContainer';

const DataTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { compact?: boolean }
>(({ className, compact, ...props }, ref) => (
  <table
    ref={ref}
    className={cn(
      'w-full border-collapse text-sm',
      compact && 'table-compact',
      className
    )}
    {...props}
  />
));
DataTable.displayName = 'DataTable';

const DataTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-muted/50', className)}
    {...props}
  />
));
DataTableHeader.displayName = 'DataTableHeader';

const DataTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
DataTableBody.displayName = 'DataTableBody';

const DataTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('bg-muted/50 font-medium', className)}
    {...props}
  />
));
DataTableFooter.displayName = 'DataTableFooter';

const DataTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className
    )}
    {...props}
  />
));
DataTableRow.displayName = 'DataTableRow';

const DataTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 whitespace-nowrap',
      className
    )}
    {...props}
  />
));
DataTableHead.displayName = 'DataTableHead';

const DataTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
));
DataTableCell.displayName = 'DataTableCell';

const DataTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
));
DataTableCaption.displayName = 'DataTableCaption';

export {
  DataTable,
  DataTableContainer,
  DataTableHeader,
  DataTableBody,
  DataTableFooter,
  DataTableHead,
  DataTableRow,
  DataTableCell,
  DataTableCaption,
};
