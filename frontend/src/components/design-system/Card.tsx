import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle' | 'urgent' | 'warning' | 'forest';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-surface-card border-surface-border text-slate-100',
    elevated: 'bg-surface-elevated border-surface-border text-slate-100 shadow-elevated',
    subtle: 'bg-surface-900/60 border-surface-border-subtle text-slate-100',
    urgent: 'bg-red-950/20 border-red-800/40 text-slate-100',
    warning: 'bg-amber-950/20 border-amber-800/40 text-slate-100',
    forest: 'bg-forest-950/30 border-forest-800/40 text-slate-100',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`rounded-2xl border transition-colors ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between gap-3 mb-4 ${className}`}>
    <div>
      <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`space-y-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div
    className={`mt-6 pt-4 border-t border-surface-border flex items-center justify-between gap-3 ${className}`}
    {...props}
  >
    {children}
  </div>
);
