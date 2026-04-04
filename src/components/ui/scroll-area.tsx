import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ScrollAreaProps = HTMLAttributes<HTMLDivElement>;

export function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <div className={cn('overflow-auto', className)} {...props}>
      {children}
    </div>
  );
}
