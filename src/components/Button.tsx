import React from 'react';
import { Loader2, Check } from 'lucide-react';

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
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
}: ButtonProps) {
  const isInteractive = !disabled && !isLoading && !isSuccess;

  return (
    <button
      type={type}
      onClick={isInteractive ? onClick : undefined}
      disabled={disabled || isLoading || isSuccess}
      aria-label={ariaLabel}
      className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2
        ${isInteractive ? 'active:scale-[0.97] cursor-pointer hover:opacity-90' : 'cursor-not-allowed opacity-60'}
        ${className.includes('bg-') ? className : `bg-brand text-white ${className}`}
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
