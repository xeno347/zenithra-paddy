import React, { createContext, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

type DialogContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(DialogContext);
  if (!ctx || !ctx.open) return null;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') ctx.onOpenChange(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ctx]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={() => ctx.onOpenChange(false)}
    >
      <div
        className={cn(
          'w-full rounded-xl border border-gray-200 bg-white p-6 shadow-xl',
          className
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('mb-3 space-y-1', className)}>{children}</div>;
}

export function DialogTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <h3 className={cn('text-lg font-semibold text-gray-900', className)}>{children}</h3>;
}
