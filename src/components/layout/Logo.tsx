import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  locale?: string;
  className?: string;
  size?: number;
  logoUrl?: string;
}

export function Logo({ locale = 'en', className = '', size = 48, logoUrl }: LogoProps) {
  return (
    <Link href={`/${locale}`} className={`flex items-center gap-3 ${className}`}>
      <Image
        src={logoUrl || "/logo/logo.jpeg"}
        alt="Infinity Role Teachers"
        width={size}
        height={size}
        className="rounded-full object-cover"
        priority
      />
      <span className="whitespace-nowrap text-lg font-semibold tracking-tight text-foreground">
        Infinity Role Teachers
      </span>
    </Link>
  );
}
