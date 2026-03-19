import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-bold text-primary">404</h1>
      <p className="mt-4 text-xl font-semibold text-foreground">Page Not Found</p>
      <p className="mt-2 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      <Link
        href="/en"
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
