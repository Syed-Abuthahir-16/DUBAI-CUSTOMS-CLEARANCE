import React from 'react';

// Custom class joiner
export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

// 1. Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  const base = "group inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent font-medium whitespace-nowrap transition-all outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer font-sans";
  
  const variants = {
    primary: "bg-accent-orange text-white hover:bg-accent-orange/90 glow-orange",
    secondary: "bg-accent-violet text-white hover:bg-accent-violet/90 glow-violet",
    outline: "border-border-light bg-panel text-text-primary hover:bg-background",
    ghost: "text-text-secondary hover:bg-background hover:text-text-primary",
    destructive: "bg-red-500 text-white hover:bg-red-600"
  };

  const sizes = {
    sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
    md: "h-10 gap-2 px-5 text-sm",
    lg: "h-12 gap-3 px-6 text-base"
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

// 2. Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  className,
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full h-10 px-3 bg-panel border border-border-light rounded-lg text-sm text-text-primary placeholder:text-text-secondary focus:border-accent-violet focus:ring-1 focus:ring-accent-violet outline-none transition-all",
          className
        )}
        {...props}
      />
    </div>
  );
};

// 3. Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'orange' | 'violet' | 'success' | 'warning' | 'error';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className
}) => {
  const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold border";
  
  const variants = {
    default: "bg-background border-border-light text-text-secondary",
    orange: "bg-accent-orange/10 border-accent-orange/30 text-accent-orange",
    violet: "bg-accent-violet/10 border-accent-violet/30 text-accent-violet",
    success: "bg-green-500/10 border-green-500/30 text-green-600",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-600",
    error: "bg-red-500/10 border-red-500/30 text-red-600"
  };

  return (
    <span className={cn(base, variants[variant], className)}>
      {children}
    </span>
  );
};

// 4. Card Component
interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  children,
  className
}) => {
  return (
    <div className={cn("bg-panel border border-border-light rounded-xl overflow-hidden flex flex-col", className)}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-text-secondary font-mono mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};
