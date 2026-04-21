interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: 'w-5 h-5 border',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-2',
};

export default function Loader({ size = 'md', className = '', label }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status" aria-label={label || 'Loading'}>
      <div className={`${sizeMap[size]} rounded-full border-black/10 border-t-brand animate-spin`} />
      {label && (
        <p className="text-xs uppercase tracking-widest text-textLight animate-pulse">{label}</p>
      )}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader size="lg" />
    </div>
  );
}

export function InlineLoader({ text = 'Loading' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-textLight">
      <div className="w-4 h-4 border border-black/10 border-t-brand rounded-full animate-spin" />
      <span>{text}...</span>
    </div>
  );
}
