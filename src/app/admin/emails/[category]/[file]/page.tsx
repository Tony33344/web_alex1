'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EmailTemplateViewer() {
  const params = useParams();
  const category = params.category as string;
  const file = params.file as string;
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const res = await fetch(`/api/admin/emails/${category}/${file}`);
        if (res.ok) {
          const data = await res.json();
          setContent(data.content);
        }
      } catch (error) {
        console.error('Failed to load template:', error);
      }
      setLoading(false);
    }
    loadTemplate();
  }, [category, file]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/emails/${category}/${file}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="flex h-96 items-center justify-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/emails">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{file.replace('.html', '')}</h1>
            <p className="text-sm text-muted-foreground">emails/{category}/{file}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          {saveSuccess && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {previewMode ? (
            <iframe
              srcDoc={content}
              className="w-full h-[800px] border-0"
              title="Email Preview"
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[800px] p-4 font-mono text-sm border-0 resize-none focus:outline-none"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
