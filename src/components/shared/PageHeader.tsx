interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export function PageHeader({ title, subtitle, backgroundImage }: PageHeaderProps) {
  const cleanSubtitle = subtitle ? stripHtml(subtitle) : '';
  
  return (
    <section
      className="relative flex min-h-[240px] items-center justify-center overflow-hidden bg-primary/5"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {backgroundImage && <div className="absolute inset-0 bg-primary/60" />}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className={`text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${backgroundImage ? 'text-white' : 'text-foreground'}`}>
          {title}
        </h1>
        {cleanSubtitle && (
          <p className={`mt-4 text-lg ${backgroundImage ? 'text-white/80' : 'text-muted-foreground'}`}>
            {cleanSubtitle}
          </p>
        )}
      </div>
    </section>
  );
}
