import { useTranslations } from 'next-intl';
import { BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';

export default function BlogPage() {
  const t = useTranslations();

  const placeholderPosts = [
    { id: '1', title: 'The Power of Morning Rituals for Holistic Health', excerpt: 'Discover how simple morning practices can transform your entire day and improve your overall wellbeing.', category: 'wellness', readTime: 5, date: 'Jan 15, 2026', featured: true },
    { id: '2', title: 'Introduction to Sunyoga: Harnessing Solar Energy', excerpt: 'Learn about the ancient practice of Sunyoga and how it can revitalize your body and spirit.', category: 'health', readTime: 7, date: 'Jan 10, 2026', featured: false },
    { id: '3', title: 'Nutrition for the Mind: Foods That Boost Meditation', excerpt: 'What you eat impacts your ability to meditate. Here are the best foods for a calm, focused mind.', category: 'nutrition', readTime: 4, date: 'Jan 5, 2026', featured: false },
    { id: '4', title: 'Coach Training: What to Expect in Your First Month', excerpt: 'A comprehensive guide for new coach training participants on what lies ahead.', category: 'training', readTime: 6, date: 'Dec 28, 2025', featured: false },
    { id: '5', title: 'Acupresura for Stress Relief: A Beginners Guide', excerpt: 'Simple acupresura techniques you can practice at home to reduce stress and anxiety.', category: 'health', readTime: 5, date: 'Dec 20, 2025', featured: false },
    { id: '6', title: 'Building a Daily Yoga Practice at Home', excerpt: 'Tips and sequences for establishing a sustainable home yoga practice.', category: 'wellness', readTime: 8, date: 'Dec 15, 2025', featured: false },
  ];

  return (
    <>
      <PageHeader title={t('navigation.blog')} subtitle="Insights, stories, and wellness tips from our teachers" />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Featured Post */}
        {placeholderPosts.filter(p => p.featured).map((post) => (
          <Card key={post.id} className="mb-12 overflow-hidden lg:flex">
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 lg:aspect-auto lg:w-1/2" />
            <div className="flex flex-col justify-center p-8 lg:w-1/2">
              <Badge variant="secondary" className="w-fit mb-3">Featured</Badge>
              <h2 className="text-2xl font-bold">{post.title}</h2>
              <p className="mt-3 text-muted-foreground">{post.excerpt}</p>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.readTime} min read</span>
                <span>{post.date}</span>
              </div>
              <Button className="mt-6 w-fit">{t('common.readMore')}</Button>
            </div>
          </Card>
        ))}

        {/* Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {placeholderPosts.filter(p => !p.featured).map((post) => (
            <Card key={post.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-muted" />
              <CardHeader>
                <Badge variant="outline" className="w-fit text-xs capitalize">{post.category}</Badge>
                <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{post.readTime} min read</span>
                  <span>{post.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
