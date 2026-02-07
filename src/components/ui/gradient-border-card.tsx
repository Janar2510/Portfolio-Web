import { cn } from '@/lib/utils';

interface GradientBorderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  innerClassName?: string;
}

export function GradientBorderCard({
  children,
  className,
  innerClassName,
  ...props
}: GradientBorderCardProps) {
  return (
    <div className={cn('gradient-border-card', className)} {...props}>
      <div className={cn('gradient-border-card__inner', innerClassName)}>
        {children}
      </div>
    </div>
  );
}
