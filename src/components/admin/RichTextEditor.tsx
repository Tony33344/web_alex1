'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { Node as TiptapNode, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { createClient } from '@/lib/supabase/client';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Youtube from '@tiptap/extension-youtube';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  RemoveFormatting,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Minus,
  Youtube as YoutubeIcon,
  Film,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useEffect, useCallback, useRef, useState } from 'react';

// Custom TipTap node: <video controls src="..." />
const Video = TiptapNode.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
    };
  },
  parseHTML() {
    return [{ tag: 'video[src]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, { controls: 'true', class: 'rounded-lg w-full' })];
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${
        disabled
          ? 'text-muted-foreground/30 cursor-not-allowed'
          : active
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

/**
 * Recursively convert a DOM node to clean semantic HTML string.
 * Preserves bold, italic, underline, links. Strips all Word/MSO attributes.
 */
function nodeToHtml(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const style = el.getAttribute('style') || '';
  const cls = el.getAttribute('class') || '';

  // Strip Symbol/Wingdings font spans (Word bullet markers)
  if (tag === 'span' && /symbol|wingdings|webdings/i.test(style)) {
    return '';
  }

  // Get children content recursively
  const inner = Array.from(el.childNodes).map(nodeToHtml).join('');

  // Map inline semantic tags through
  if (tag === 'strong' || tag === 'b') return `<strong>${inner}</strong>`;
  if (tag === 'em' || tag === 'i') return `<em>${inner}</em>`;
  if (tag === 'u') return `<u>${inner}</u>`;
  if (tag === 'a') {
    const href = el.getAttribute('href') || '';
    return href ? `<a href="${href}">${inner}</a>` : inner;
  }
  if (tag === 'br') return '<br>';

  // Span: check for inline formatting styles, wrap accordingly
  if (tag === 'span') {
    let result = inner;
    if (/font-weight\s*:\s*(bold|[7-9]00)/i.test(style)) result = `<strong>${result}</strong>`;
    if (/font-style\s*:\s*italic/i.test(style)) result = `<em>${result}</em>`;
    if (/text-decoration\s*:[^;"]*underline/i.test(style)) result = `<u>${result}</u>`;
    return result;
  }

  // Already-semantic headings
  if (/^h[1-6]$/.test(tag)) {
    const level = Math.min(parseInt(tag[1]), 3);
    const align = /text-align\s*:\s*(center|right|justify)/i.exec(style)?.[1];
    return align ? `<h${level} style="text-align:${align}">${inner}</h${level}>` : `<h${level}>${inner}</h${level}>`;
  }

  // Semantic lists — recurse into li items
  if (tag === 'ul') return `<ul>${inner}</ul>`;
  if (tag === 'ol') return `<ol>${inner}</ol>`;
  if (tag === 'li') return `<li>${inner}</li>`;

  if (tag === 'blockquote') return `<blockquote>${inner}</blockquote>`;
  if (tag === 'hr') return '<hr>';

  // Block containers — return inner (handled by parent walker)
  if (tag === 'p' || tag === 'div') return inner;

  // Everything else: just return inner content
  return inner;
}

/**
 * Clean Word / Google Docs HTML on paste.
 * Uses two-pass approach: pre-regex to strip XML junk, then
 * block-level DOM walk to reconstruct semantic structure.
 */
function cleanWordHtml(html: string): string {
  // Pass 1: strip Word XML noise with regex before DOM parsing
  let pre = html;
  pre = pre.replace(/<\?xml[^>]*>/gi, '');
  pre = pre.replace(/<!\[if[^>]*>[\s\S]*?<!\[endif\]>/gi, '');
  pre = pre.replace(/<o:p[^>]*>[\s\S]*?<\/o:p>/gi, '');
  pre = pre.replace(/<w:[^>]*?>[\s\S]*?<\/w:[^>]*?>/gi, '');
  pre = pre.replace(/<m:[^>]*?>[\s\S]*?<\/m:[^>]*?>/gi, '');
  pre = pre.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  pre = pre.replace(/<\/?meta[^>]*?>/gi, '');
  pre = pre.replace(/<\/?link[^>]*?\/?>/gi, '');

  // Pass 2: parse DOM
  const doc = new DOMParser().parseFromString(pre, 'text/html');
  const body = doc.body;

  // Helpers
  function isWordListItem(el: HTMLElement): boolean {
    const s = el.getAttribute('style') || '';
    const c = el.getAttribute('class') || '';
    return (
      s.includes('mso-list') ||
      c.includes('MsoListParagraph') ||
      c.includes('MsoList') ||
      c.includes('lst-kix') ||
      c.startsWith('lst-')
    );
  }

  function getHeadingLevel(el: HTMLElement): number | null {
    const c = el.getAttribute('class') || '';
    const s = el.getAttribute('style') || '';
    const m = c.match(/(?:Mso)?Heading\s*(\d)/i);
    if (m) return Math.min(parseInt(m[1]), 3);
    const o = s.match(/mso-outline-level\s*:\s*(\d)/i);
    if (o) return Math.min(parseInt(o[1]), 3);
    if (c.includes('MsoTitle')) return 1;
    if (c.includes('MsoSubtitle')) return 2;
    return null;
  }

  // Walk top-level block elements
  const output: string[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' = 'ul';

  function flushList() {
    if (listItems.length > 0) {
      output.push(`<${listType}>${listItems.map((li) => `<li>${li}</li>`).join('')}</${listType}>`);
      listItems = [];
    }
  }

  const topChildren = Array.from(body.children) as HTMLElement[];

  // No block children — just return inner HTML cleaned up
  if (topChildren.length === 0) {
    return nodeToHtml(body);
  }

  for (const el of topChildren) {
    const tag = el.tagName.toLowerCase();

    // Native semantic lists
    if (tag === 'ul' || tag === 'ol') {
      flushList();
      const items = Array.from(el.querySelectorAll('li')).map((li) =>
        Array.from(li.childNodes).map(nodeToHtml).join('')
      );
      output.push(`<${tag}>${items.map((t) => `<li>${t}</li>`).join('')}</${tag}>`);
      continue;
    }

    // Native heading
    if (/^h[1-6]$/.test(tag)) {
      flushList();
      const level = Math.min(parseInt(tag[1]), 3);
      const inner = Array.from(el.childNodes).map(nodeToHtml).join('');
      const elStyle = el.getAttribute('style') || '';
      const align = /text-align\s*:\s*(center|right|justify)/i.exec(elStyle)?.[1];
      output.push(align ? `<h${level} style="text-align:${align}">${inner}</h${level}>` : `<h${level}>${inner}</h${level}>`);
      continue;
    }

    // Paragraph or div
    if (tag === 'p' || tag === 'div') {
      const inner = Array.from(el.childNodes).map(nodeToHtml).join('').trim();

      // Skip empty
      if (!inner || /^(&nbsp;\s*)+$/.test(inner)) continue;

      // Word heading paragraph
      const level = getHeadingLevel(el);
      if (level) {
        flushList();
        const elStyle = el.getAttribute('style') || '';
        const align = /text-align\s*:\s*(center|right|justify)/i.exec(elStyle)?.[1];
        output.push(align ? `<h${level} style="text-align:${align}">${inner}</h${level}>` : `<h${level}>${inner}</h${level}>`);
        continue;
      }

      // Word list item paragraph
      if (isWordListItem(el)) {
        const s = el.getAttribute('style') || '';
        // Detect ordered: mso-list style references a decimal list type
        const isOrdered = /list-style-type\s*:\s*decimal/i.test(s);
        const newListType: 'ul' | 'ol' = isOrdered ? 'ol' : 'ul';
        if (listItems.length > 0 && newListType !== listType) flushList();
        listType = newListType;
        // Strip leading bullet/number chars that Word injects as text
        const cleaned = inner
          .replace(/^[\s\u00b7\u2022\u2013\u2014·•\-–—>§o]+/, '')
          .replace(/^\d+[.)]\s*/, '')
          .trim();
        listItems.push(cleaned);
        continue;
      }

      // Regular paragraph — preserve text-align
      flushList();
      const elStyle = el.getAttribute('style') || '';
      const align = /text-align\s*:\s*(center|right|justify)/i.exec(elStyle)?.[1];
      output.push(align ? `<p style="text-align:${align}">${inner}</p>` : `<p>${inner}</p>`);
      continue;
    }

    if (tag === 'blockquote' || tag === 'hr' || tag === 'table') {
      flushList();
      output.push(tag === 'hr' ? '<hr>' : `<${tag}>${Array.from(el.childNodes).map(nodeToHtml).join('')}</${tag}>`);
      continue;
    }
  }

  flushList();
  return output.join('');
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      TextStyle,
      Color,
      Youtube.configure({
        controls: true,
        nocookie: true,
        width: 640,
        height: 360,
        HTMLAttributes: { class: 'rounded-lg w-full aspect-video' },
      }),
      Video,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none dark:prose-invert [&_u]:underline',
      },
      transformPastedHTML(html) {
        return cleanWordHtml(html);
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const addYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Paste YouTube URL');
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  }, [editor]);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoError, setVideoError] = useState('');

  const handleVideoUpload = useCallback(async (file: File) => {
    if (!editor) return;
    if (!file.type.startsWith('video/')) {
      setVideoError('Only video files are allowed');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setVideoError('Video must be under 100MB');
      return;
    }
    setUploadingVideo(true);
    setVideoError('');
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'mp4';
      const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false, contentType: file.type });
      if (upErr) {
        setVideoError(upErr.message);
      } else {
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
        editor.chain().focus().insertContent({ type: 'video', attrs: { src: publicUrl } }).run();
      }
    } catch {
      setVideoError('Upload failed');
    }
    setUploadingVideo(false);
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-md border border-input bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          onClick={setLink}
          active={editor.isActive('link')}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
          title="Remove Link"
        >
          <Unlink className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addYoutube} title="Embed YouTube video">
          <YoutubeIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => videoInputRef.current?.click()}
          title="Upload video from your device"
          disabled={uploadingVideo}
        >
          {uploadingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            if (editor.isActive('video') || editor.isActive('youtube')) {
              editor.chain().focus().deleteSelection().run();
            }
          }}
          disabled={!(editor.isActive('video') || editor.isActive('youtube'))}
          title="Remove selected video"
        >
          <Trash2 className="h-4 w-4" />
        </ToolbarButton>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleVideoUpload(f);
            if (videoInputRef.current) videoInputRef.current.value = '';
          }}
        />

        <Separator />

        <label
          className="flex h-8 items-center gap-1 rounded px-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          title="Text color"
        >
          <span className="inline-block h-4 w-4 rounded border" style={{ backgroundColor: (editor.getAttributes('textStyle').color as string) || '#000000' }} />
          <input
            type="color"
            value={(editor.getAttributes('textStyle').color as string) || '#000000'}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="sr-only"
          />
        </label>
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetColor().run()}
          disabled={!editor.getAttributes('textStyle').color}
          title="Reset color"
        >
          <span className="text-xs font-semibold">A</span>
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear Formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
      {videoError && <p className="px-4 py-2 text-xs text-destructive">{videoError}</p>}
    </div>
  );
}
