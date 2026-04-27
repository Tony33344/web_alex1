import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  locale?: string;
  className?: string;
  size?: number;
  logoUrl?: string;
}

export function Logo({ locale = 'en', className = '', size = 58, logoUrl }: LogoProps) {
  return (
    <Link href={`/${locale}`} className={`flex flex-col items-center gap-0 ${className}`}>
      <Image
        src={logoUrl || "/logo/logo.jpeg"}
        alt="Infinity Role Teachers"
        width={size}
        height={size}
        className="rounded-full object-cover"
        priority
      />
      <span className="whitespace-nowrap text-base font-semibold tracking-tight text-foreground -mb-3">
        Infinity Role Teachers
      </span>
    </Link>
  );
}
