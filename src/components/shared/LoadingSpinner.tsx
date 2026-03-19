import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullPage?: boolean;
  size?: number;
}

export function LoadingSpinner({ fullPage = false, size = 24 }: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" style={{ width: size, height: size }} />
      </div>
    );
  }

  return <Loader2 className="animate-spin text-primary" style={{ width: size, height: size }} />;
}
