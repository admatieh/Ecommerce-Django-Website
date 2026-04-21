import React from 'react';
import { Loader2, Check } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand/90',
  secondary: 'bg-textMain text-white hover:bg-black/80',
  outline: 'bg-transparent border border-black/10 text-textMain hover:bg-black/[0.03]',
  ghost: 'bg-transparent text-textMain hover:bg-black/[0.03]',
};

export default function Button({
  children,
  className = '',
  onClick,
  isLoading,
  isSuccess,
  disabled,
  type = 'button',
  ariaLabel,
  variant = 'primary',
  size = 'md',
}: ButtonProps) {
  const isInteractive = !disabled && !isLoading && !isSuccess;

  // Check if className contains bg- to use custom styling
  const hasCustomBackground = className.includes('bg-');

  return (
    <button
      type={type}
      onClick={isInteractive ? onClick : undefined}
      disabled={disabled || isLoading || isSuccess}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      className={`
        relative rounded-full font-medium transition-all duration-300 ease-premium
        flex items-center justify-center gap-2 overflow-hidden
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2
        touch-manipulation select-none
        ${sizeStyles[size]}
        ${hasCustomBackground ? '' : variantStyles[variant]}
        ${isInteractive 
          ? 'active:scale-[0.97] cursor-pointer hover:-translate-y-0.5 active:translate-y-0' 
          : 'cursor-not-allowed opacity-60'
        }
        ${className}
      `}
    >
      <span
        className={`flex items-center justify-center gap-2 transition-all duration-300 ${
          isLoading || isSuccess ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        {children}
      </span>

      {/* Loading State */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
        aria-hidden={!isLoading}
      >
        <Loader2 className="animate-spin" size={18} />
      </div>

      {/* Success State */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
        aria-hidden={!isSuccess}
      >
        <Check size={18} className="text-white" strokeWidth={3} />
        <span className="ml-2 font-bold tracking-widest text-[11px] uppercase">Added</span>
      </div>
    </button>
  );
}
