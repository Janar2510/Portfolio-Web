'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface SimpleChartProps {
  title: string;
  data: ChartDataPoint[];
  valueKey?: string;
  className?: string;
}

export function SimpleChart({ title, data, valueKey = 'value', className }: SimpleChartProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map((d) => d[valueKey as keyof ChartDataPoint] as number));
  const minValue = Math.min(...data.map((d) => d[valueKey as keyof ChartDataPoint] as number));
  const range = maxValue - minValue || 1;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <div className="flex h-full items-end gap-2">
            {data.map((point, index) => {
              const value = point[valueKey as keyof ChartDataPoint] as number;
              const height = ((value - minValue) / range) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${point.label || point.date}: ${value}`}
                  />
                  <span className="text-xs text-muted-foreground truncate w-full text-center">
                    {point.label || new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
