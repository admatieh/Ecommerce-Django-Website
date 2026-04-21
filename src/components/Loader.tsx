interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-5 h-5 border',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-2',
};

export default function Loader({ size = 'md', className = '' }: LoaderProps) {
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <div className={`${sizeMap[size]} rounded-full border-black/10 border-t-textMain animate-spin`} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}