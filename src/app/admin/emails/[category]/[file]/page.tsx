'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, EyeOff, Code, Bold, Italic, List, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EmailTemplateViewer() {
  const params = useParams();
  const category = params.category as string;
  const file = params.file as string;
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState<'wysiwyg' | 'html'>('wysiwyg');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

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

  function execCommand(command: string, value?: string) {
    document.execCommand(command, false, value);
  }

  async function handleSave() {
    setSaving(true);
    const contentToSave = editMode === 'wysiwyg' 
      ? editorRef.current?.innerHTML || content 
      : content;
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
            onClick={() => {
              if (editMode === 'wysiwyg') {
                setContent(editorRef.current?.innerHTML || content);
              } else if (editorRef.current) {
                editorRef.current.innerHTML = content;
              }
              setEditMode(editMode === 'wysiwyg' ? 'html' : 'wysiwyg');
            }}
          >
            <Code className="h-4 w-4 mr-2" />
            {editMode === 'wysiwyg' ? 'HTML Mode' : 'Visual Mode'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          {saveSuccess && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {editMode === 'wysiwyg' ? 'Edit Email' : 'Edit HTML'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editMode === 'wysiwyg' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1 border-b pb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => execCommand('bold')}
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => execCommand('italic')}
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => execCommand('insertUnorderedList')}
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = prompt('Enter URL:');
                      if (url) execCommand('createLink', url);
                    }}
                    title="Insert Link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  className="min-h-[500px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                  suppressHydrationWarning
                />
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[500px] p-4 font-mono text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              srcDoc={editMode === 'wysiwyg' ? editorRef.current?.innerHTML || content : content}
              className="w-full h-[600px] border-0"
              title="Email Preview"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
