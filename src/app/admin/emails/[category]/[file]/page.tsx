'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Eye, EyeOff, Code } from 'lucide-react';
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
  const [editMode, setEditMode] = useState<'simple' | 'html'>('simple');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Extractable fields
  const [fields, setFields] = useState({
    title: '',
    greeting: '',
    message: '',
  });

  useEffect(() => {
    async function loadTemplate() {
      try {
        const res = await fetch(`/api/admin/emails/${category}/${file}`);
        if (res.ok) {
          const data = await res.json();
          setContent(data.content);
          extractFields(data.content);
        }
      } catch (error) {
        console.error('Failed to load template:', error);
      }
      setLoading(false);
    }
    loadTemplate();
  }, [category, file]);

  function extractFields(html: string) {
    // Extract title from h1
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // Extract greeting from first paragraph with greeting class
    const greetingMatch = html.match(/<p class="greeting"[^>]*>(.*?)<\/p>/);
    const greeting = greetingMatch ? greetingMatch[1].replace(/{{\w+}}/g, '[Name]').trim() : '';
    
    // Extract main message
    const messageMatch = html.match(/<p class="message"[^>]*>([\s\S]*?)<\/p>/);
    const message = messageMatch ? messageMatch[1].trim() : '';
    
    setFields({ title, greeting, message });
  }

  function updateContent() {
    let updatedContent = content;
    
    // Update title
    if (fields.title) {
      updatedContent = updatedContent.replace(/(<h1[^>]*>)(.*?)(<\/h1>)/, `$1${fields.title}$3`);
    }
    
    // Update greeting
    if (fields.greeting) {
      updatedContent = updatedContent.replace(/(<p class="greeting"[^>]*>)(.*?)(<\/p>)/, `$1${fields.greeting}$3`);
    }
    
    // Update message
    if (fields.message) {
      updatedContent = updatedContent.replace(/(<p class="message"[^>]*>)([\s\S]*?)(<\/p>)/, `$1${fields.message}$3`);
    }
    
    setContent(updatedContent);
  }

  async function handleSave() {
    setSaving(true);
    const contentToSave = editMode === 'simple' ? content : content;
    try {
      const res = await fetch(`/api/admin/emails/${category}/${file}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToSave }),
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
          <Button
            variant="outline"
            onClick={() => {
              if (editMode === 'simple') updateContent();
              setEditMode(editMode === 'simple' ? 'html' : 'simple');
            }}
          >
            <Code className="h-4 w-4 mr-2" />
            {editMode === 'simple' ? 'HTML Mode' : 'Simple Mode'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          {saveSuccess && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {!previewMode && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editMode === 'simple' ? 'Edit Content' : 'Edit HTML'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode === 'simple' ? (
                <>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={fields.title}
                      onChange={(e) => setFields({ ...fields, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="greeting">Greeting</Label>
                    <Textarea
                      id="greeting"
                      value={fields.greeting}
                      onChange={(e) => setFields({ ...fields, greeting: e.target.value })}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={fields.message}
                      onChange={(e) => setFields({ ...fields, message: e.target.value })}
                      className="mt-1"
                      rows={6}
                    />
                  </div>
                </>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-[500px] p-4 font-mono text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              srcDoc={editMode === 'simple' ? content : content}
              className="w-full h-[600px] border-0"
              title="Email Preview"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
