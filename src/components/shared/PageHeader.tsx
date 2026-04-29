interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundColor?: string | null;
  gradientTo?: string | null;
  textColor?: string | null;
  width?: 'full' | 'contained' | null;
  height?: string | null;
  logoUrl?: string;
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export function PageHeader({ title, subtitle, backgroundImage, backgroundColor, gradientTo, textColor, width, height, logoUrl }: PageHeaderProps) {
  const cleanSubtitle = subtitle ? stripHtml(subtitle) : '';
  const minH = height || '240px';
  
  if (logoUrl) {
    console.log('PageHeader logoUrl:', logoUrl);
  }
  const style: React.CSSProperties | undefined = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: minH }
    : backgroundColor && gradientTo
      ? { backgroundImage: `linear-gradient(135deg, ${backgroundColor}, ${gradientTo})`, minHeight: minH }
      : backgroundColor
        ? { backgroundColor, minHeight: minH }
        : { minHeight: minH };

  const baseClass = width === 'contained'
    ? 'relative mx-auto my-6 flex max-w-7xl items-center justify-center overflow-hidden rounded-2xl bg-primary/5'
    : 'relative flex items-center justify-center overflow-hidden bg-primary/5';

  return (
    <section className={baseClass} style={style}>
      {backgroundImage && <div className="absolute inset-0 bg-primary/60" />}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center">
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Infinity Role Teachers"
            className="mx-auto mb-6 h-16 w-auto object-contain"
          />
        )}
        <h1 className={`text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${backgroundImage ? 'text-white' : 'text-foreground'}`}>
          {title}
        </h1>
        {cleanSubtitle && (
          <p className="mt-4 text-lg" style={{ color: textColor || (backgroundImage ? 'rgba(255,255,255,0.8)' : undefined) }}>
            {cleanSubtitle}
          </p>
        )}
      </div>
    </section>
  );
}
