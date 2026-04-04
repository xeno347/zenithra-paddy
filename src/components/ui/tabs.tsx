import React, { createContext, useContext, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type TabsContextValue = {
  value: string;
  setValue: (next: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({
  defaultValue,
  className,
  children,
}: {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [value, setValue] = useState(defaultValue);
  const ctx = useMemo(() => ({ value, setValue }), [value]);

  return <div className={cn(className)}><TabsContext.Provider value={ctx}>{children}</TabsContext.Provider></div>;
}

export function TabsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('inline-flex gap-1 rounded-lg bg-gray-100 p-1', className)}>{children}</div>;
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) return null;
  const active = ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx || ctx.value !== value) return null;

  return <div className={cn(className)}>{children}</div>;
}
