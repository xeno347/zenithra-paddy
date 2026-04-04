import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical';
};

export function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-gray-200',
        orientation === 'vertical' ? 'w-px self-stretch' : 'h-px w-full',
        className
      )}
      {...props}
    />
  );
}
