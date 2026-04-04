import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'outline';
type ButtonSize = 'default' | 'sm';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm',
        variant === 'outline'
          ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          : 'bg-[#1e293b] text-white hover:bg-[#0f172a]',
        className
      )}
      {...props}
    />
  );
}
