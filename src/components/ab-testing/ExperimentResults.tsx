'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimpleChart } from '@/components/analytics/SimpleChart';
import { createClient } from '@/lib/supabase/client';
import type { ABVariant } from '@/domain/analytics/analytics';
import { format } from 'date-fns';

interface ExperimentResultsProps {
  experimentId: string;
}

export function ExperimentResults({ experimentId }: ExperimentResultsProps) {
  // Fetch variants with stats
  const { data: variants = [] } = useQuery({
    queryKey: ['ab-variants', experimentId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ab_variants')
        .select('*')
        .eq('experiment_id', experimentId)
        .order('is_control', { ascending: false });
      if (error) throw error;
      return (data || []) as ABVariant[];
    },
  });

  // Fetch experiment details
  const { data: experiment } = useQuery({
    queryKey: ['ab-experiment', experimentId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ab_experiments')
        .select('*')
        .eq('id', experimentId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Calculate totals
  const totalVisitors = variants.reduce((sum, v) => sum + v.visitors, 0);
  const totalConversions = variants.reduce((sum, v) => sum + v.conversions, 0);
  const overallConversionRate =
    totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;

  // Find control variant
  const controlVariant = variants.find(v => v.is_control);
  const controlRate =
    controlVariant && controlVariant.visitors > 0
      ? (controlVariant.conversions / controlVariant.visitors) * 100
      : 0;

  // Calculate improvement for each variant
  const variantsWithStats = variants.map(variant => {
    const rate =
      variant.visitors > 0 ? (variant.conversions / variant.visitors) * 100 : 0;
    const improvement =
      controlRate > 0 ? ((rate - controlRate) / controlRate) * 100 : 0;
    const isWinner =
      !variant.is_control && rate > controlRate && variant.visitors >= 100; // Minimum sample size

    return {
      ...variant,
      rate,
      improvement,
      isWinner,
    };
  });

  // Prepare chart data (visitors over time - simplified)
  const visitorChartData = variants.map((variant, index) => ({
    date: new Date().toISOString(),
    value: variant.visitors,
    label: variant.name,
  }));

  const conversionChartData = variants.map(variant => ({
    date: new Date().toISOString(),
    value: variant.conversions,
    label: variant.name,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisitors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Overall Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallConversionRate.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Variant Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Variant Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {variantsWithStats.map(variant => (
              <div key={variant.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{variant.name}</span>
                    {variant.is_control && (
                      <Badge variant="outline">Control</Badge>
                    )}
                    {variant.isWinner && (
                      <Badge className="bg-green-600">Winner</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {variant.visitors} visitors, {variant.conversions}{' '}
                    conversions
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Conversion Rate: {variant.rate.toFixed(2)}%</span>
                    {!variant.is_control && variant.improvement !== 0 && (
                      <span
                        className={
                          variant.improvement > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {variant.improvement > 0 ? '+' : ''}
                        {variant.improvement.toFixed(2)}% vs control
                      </span>
                    )}
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.min(variant.rate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SimpleChart title="Visitors by Variant" data={visitorChartData} />
        <SimpleChart
          title="Conversions by Variant"
          data={conversionChartData}
        />
      </div>

      {/* Statistical Significance Note */}
      {totalVisitors < 1000 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This experiment needs more data for
              statistical significance. We recommend at least 1,000 visitors per
              variant for reliable results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
