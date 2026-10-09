import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet' | 'destructive' | 'emergency';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
      md: 'text-xs sm:text-sm px-4 py-2.5 gap-2 min-h-[40px]',
      lg: 'text-sm sm:text-base px-5 py-3 gap-2.5 min-h-[48px]',
    };

    const variantStyles = {
      // Primary: Deep forest action button - calm, authoritative
      primary:
        'bg-forest-700 hover:bg-forest-600 active:bg-forest-800 text-white shadow-subtle border border-forest-600/50',
      // Secondary: Calm charcoal surface with clear border
      secondary:
        'bg-surface-elevated hover:bg-surface-800 active:bg-surface-850 text-slate-200 border border-surface-border hover:border-slate-600 shadow-subtle',
      // Quiet: Flat borderless button for low-priority actions
      quiet:
        'bg-transparent hover:bg-surface-elevated/70 text-slate-300 hover:text-white',
      // Destructive: For deletion or cancellation
      destructive:
        'bg-red-950/70 hover:bg-red-900 active:bg-red-950 text-red-200 border border-red-800/60 shadow-subtle',
      // Emergency: Reserved for immediate incident reporting and SOS calls
      emergency:
        'bg-red-700 hover:bg-red-600 active:bg-red-800 text-white border border-red-600 shadow-subtle font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
