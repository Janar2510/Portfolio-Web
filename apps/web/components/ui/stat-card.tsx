import * as React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
}

export function StatCard({
  value,
  label,
  trend,
  className,
  ...props
}: StatCardProps) {
  return (
    <div className={cn('p-5', className)} {...props}>
      <div className="text-3xl font-bold text-foreground leading-none mb-1">
        {value}
      </div>
      <div className="text-sm text-muted-foreground mb-2">{label}</div>
      {trend && (
        <div
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium',
            trend.isPositive ? 'text-success-main' : 'text-error-main'
          )}
        >
          {trend.isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>
            {Math.abs(trend.value)}%{' '}
            {trend.label || (trend.isPositive ? 'increase' : 'decrease')}
          </span>
        </div>
      )}
    </div>
  );
}
