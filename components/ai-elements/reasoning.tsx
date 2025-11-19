'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown, Loader2 } from 'lucide-react';

interface ReasoningContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isStreaming: boolean;
}

const ReasoningContext = React.createContext<ReasoningContextValue | undefined>(undefined);

function useReasoning() {
  const context = React.useContext(ReasoningContext);
  if (!context) {
    throw new Error('useReasoning must be used within a Reasoning provider');
  }
  return context;
}

interface ReasoningProps extends React.HTMLAttributes<HTMLDivElement> {
  isStreaming?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Reasoning = React.forwardRef<HTMLDivElement, ReasoningProps>(
  ({ className, isStreaming = false, defaultOpen = false, onOpenChange, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen || isStreaming);

    React.useEffect(() => {
      if (isStreaming) {
        setIsOpen(true);
        onOpenChange?.(true);
      }
    }, [isStreaming, onOpenChange]);

    const handleOpenChange = React.useCallback((newOpen: boolean) => {
      setIsOpen(newOpen);
      onOpenChange?.(newOpen);
    }, [onOpenChange]);

    return (
      <ReasoningContext.Provider value={{ isOpen, setIsOpen: handleOpenChange, isStreaming }}>
        <div
          ref={ref}
          className={cn('border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50/50', className)}
          {...props}
        >
          {children}
        </div>
      </ReasoningContext.Provider>
    );
  }
);
Reasoning.displayName = 'Reasoning';

interface ReasoningTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  title?: string;
}

const ReasoningTrigger = React.forwardRef<HTMLButtonElement, ReasoningTriggerProps>(
  ({ className, title = 'Reasoning', children, ...props }, ref) => {
    const { isOpen, setIsOpen, isStreaming } = useReasoning();

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100/50 transition-colors',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-zinc-300" />
          )}
          <span>{title}</span>
        </div>
        {children}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-zinc-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
    );
  }
);
ReasoningTrigger.displayName = 'ReasoningTrigger';

const ReasoningContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = useReasoning();

    return (
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div
              ref={ref}
              className={cn('px-4 pb-4 pt-0 text-sm text-zinc-600 font-mono leading-relaxed whitespace-pre-wrap', className)}
              {...props}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
ReasoningContent.displayName = 'ReasoningContent';

export { Reasoning, ReasoningTrigger, ReasoningContent };
