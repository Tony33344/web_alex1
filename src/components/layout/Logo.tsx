import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  locale?: string;
  className?: string;
  size?: number;
  logoUrl?: string;
  textGap?: number;
  textSize?: number;
}

export function Logo({ locale = 'en', className = '', size = 70, logoUrl, textGap = 0, textSize = 14 }: LogoProps) {
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
      <span
        className="whitespace-nowrap font-semibold tracking-tight text-foreground"
        style={{
          fontSize: `${textSize}px`,
          marginTop: `${textGap}px`,
        }}
      >
        Infinity Role Teachers
      </span>
    </Link>
  );
}
