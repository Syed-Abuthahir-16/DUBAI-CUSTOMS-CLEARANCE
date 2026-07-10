import React from 'react';

// Custom class joiner
export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

// ─── 1. Button ───────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'gold';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  const base = "group inline-flex shrink-0 items-center justify-center rounded-lg border font-medium whitespace-nowrap transition-all outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 cursor-pointer";

  const variants = {
    primary:     "bg-[#0A0A0A] border-[#0A0A0A] text-white hover:bg-[#1f1f1f]",
    secondary:   "bg-[#0C2461] border-[#0C2461] text-white hover:bg-[#0a1e52]",
    outline:     "bg-white border-[#E5E7EB] text-[#0A0A0A] hover:border-[#0A0A0A] hover:bg-[#F7F7F7]",
    ghost:       "border-transparent text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#0A0A0A]",
    destructive: "bg-red-600 border-red-600 text-white hover:bg-red-700",
    gold:        "bg-white border-[#C9A84C] text-[#C9A84C] hover:bg-[#F0E2B6]/30 glow-gold",
  };

  const sizes = {
    sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
    md: "h-10 gap-2 px-5 text-sm",
    lg: "h-12 gap-3 px-6 text-base",
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
};

// ─── 2. Input ────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className, id, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] transition-all",
          className
        )}
        {...props}
      />
    </div>
  );
};

// ─── 3. Badge ────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'orange' | 'violet' | 'success' | 'warning' | 'error' | 'navy' | 'gold';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide";

  const variants = {
    default:  "bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280]",
    orange:   "bg-[#F0E2B6]/40 border-[#C9A84C]/40 text-[#92650A]",   // gold-tinted
    violet:   "bg-[#0C2461]/8 border-[#0C2461]/20 text-[#0C2461]",    // navy-tinted
    success:  "bg-green-50 border-green-200 text-green-700",
    warning:  "bg-amber-50 border-amber-200 text-amber-700",
    error:    "bg-red-50 border-red-200 text-red-700",
    navy:     "bg-[#0C2461] border-[#0C2461] text-white",
    gold:     "bg-[#C9A84C] border-[#C9A84C] text-white",
  };

  return (
    <span className={cn(base, variants[variant], className)}>
      {children}
    </span>
  );
};

// ─── 4. Card ─────────────────────────────────────────────────────────────────
interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, actions, children, className }) => {
  return (
    <div className={cn("bg-white border border-[#E5E7EB] rounded-xl overflow-hidden flex flex-col shadow-sm", className)}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-semibold text-[#0A0A0A] tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
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
