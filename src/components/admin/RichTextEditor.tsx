'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
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
  Link as LinkIcon,
  Unlink,
  Minus,
} from 'lucide-react';
import { useEffect, useCallback } from 'react';

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
 * Clean Word / Google Docs HTML using DOM parsing.
 * Converts Word list paragraphs to proper <ul>/<li>, keeps headings,
 * bold, italic, underline, and paragraph structure intact.
 */
function cleanWordHtml(html: string): string {
  // Phase 1 — pre-clean with regex (remove XML junk before DOM parsing)
  let pre = html;
  pre = pre.replace(/<\?xml[^>]*>/gi, '');
  pre = pre.replace(/<!\[if[^>]*>[\s\S]*?<!\[endif\]>/gi, '');
  pre = pre.replace(/<o:p[^>]*>[\s\S]*?<\/o:p>/gi, '');
  pre = pre.replace(/<w:[^>]*>[\s\S]*?<\/w:[^>]*>/gi, '');
  pre = pre.replace(/<m:[^>]*>[\s\S]*?<\/m:[^>]*>/gi, '');
  pre = pre.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  pre = pre.replace(/<\/?meta[^>]*>/gi, '');
  pre = pre.replace(/<\/?link[^>]*\/?>/gi, '');

  // Phase 2 — DOM-based cleaning
  const doc = new DOMParser().parseFromString(pre, 'text/html');

  // Helper: check if an element is a Word list item
  function isWordListItem(el: HTMLElement): boolean {
    const style = el.getAttribute('style') || '';
    const cls = el.getAttribute('class') || '';
    return (
      style.includes('mso-list') ||
      cls.includes('MsoListParagraph') ||
      cls.includes('MsoList') ||
      // Google Docs lists
      cls.includes('lst-') ||
      // Word sometimes uses Symbol font for bullets
      el.innerHTML.includes('Symbol') && el.innerHTML.includes('·')
    );
  }

  // Helper: detect heading level from Word styles
  function getWordHeadingLevel(el: HTMLElement): number | null {
    const cls = el.getAttribute('class') || '';
    const style = el.getAttribute('style') || '';
    // Word heading classes: MsoTitle, Heading1, etc.
    const headingMatch = cls.match(/Heading(\d)/i) || cls.match(/MsoHeading(\d)/i);
    if (headingMatch) return Math.min(parseInt(headingMatch[1]), 3);
    // Word outline level
    const outlineMatch = style.match(/mso-outline-level\s*:\s*(\d)/i);
    if (outlineMatch) return Math.min(parseInt(outlineMatch[1]), 3);
    // Check for MsoTitle
    if (cls.includes('MsoTitle')) return 1;
    if (cls.includes('MsoSubtitle')) return 2;
    return null;
  }

  // Helper: extract clean text/HTML from an element, preserving inline formatting
  function getCleanInner(el: HTMLElement): string {
    // Clone to avoid mutating original
    const clone = el.cloneNode(true) as HTMLElement;

    // Remove Word bullet symbols (like ·, o, §, etc.)
    // Word inserts them in spans with Symbol/Wingdings font
    clone.querySelectorAll('span').forEach((span) => {
      const sf = span.style.fontFamily || '';
      if (/symbol|wingdings|courier/i.test(sf)) {
        span.remove();
        return;
      }
    });

    // Process all spans: convert style-based formatting to semantic tags
    clone.querySelectorAll('span').forEach((span) => {
      const style = span.getAttribute('style') || '';
      let inner = span.innerHTML;
      if (/font-weight\s*:\s*(bold|[7-9]00)/i.test(style)) {
        inner = `<strong>${inner}</strong>`;
      }
      if (/font-style\s*:\s*italic/i.test(style)) {
        inner = `<em>${inner}</em>`;
      }
      if (/text-decoration\s*:[^;"]*underline/i.test(style)) {
        inner = `<u>${inner}</u>`;
      }
      span.outerHTML = inner;
    });

    // Convert <b> to <strong>, <i> to <em>
    clone.querySelectorAll('b').forEach((b) => {
      b.outerHTML = `<strong>${b.innerHTML}</strong>`;
    });
    clone.querySelectorAll('i').forEach((i) => {
      i.outerHTML = `<em>${i.innerHTML}</em>`;
    });

    return clone.innerHTML.trim();
  }

  // Walk top-level body children and build clean HTML
  const output: string[] = [];
  let currentList: string[] | null = null;
  let currentListType: 'ul' | 'ol' = 'ul';

  function flushList() {
    if (currentList && currentList.length > 0) {
      output.push(`<${currentListType}>${currentList.map((li) => `<li>${li}</li>`).join('')}</${currentListType}>`);
      currentList = null;
    }
  }

  const body = doc.body;
  const children = Array.from(body.children) as HTMLElement[];

  // If no block children, body might just have inline content
  if (children.length === 0) {
    const text = body.innerHTML.trim();
    if (text) return text;
    return html;
  }

  for (const el of children) {
    const tag = el.tagName.toLowerCase();

    // Already semantic list — keep as-is (clean attributes)
    if (tag === 'ul' || tag === 'ol') {
      flushList();
      const items = Array.from(el.querySelectorAll('li')).map((li) => getCleanInner(li as HTMLElement));
      output.push(`<${tag}>${items.map((li) => `<li>${li}</li>`).join('')}</${tag}>`);
      continue;
    }

    // Already a heading tag
    if (/^h[1-6]$/.test(tag)) {
      flushList();
      const level = Math.min(parseInt(tag[1]), 3);
      output.push(`<h${level}>${getCleanInner(el)}</h${level}>`);
      continue;
    }

    // Word paragraph — could be heading, list item, or regular paragraph
    if (tag === 'p' || tag === 'div') {
      const inner = getCleanInner(el);

      // Skip truly empty paragraphs
      if (!inner || /^(\s|&nbsp;)*$/.test(inner)) {
        continue;
      }

      // Check if it's a Word heading
      const headingLevel = getWordHeadingLevel(el);
      if (headingLevel) {
        flushList();
        output.push(`<h${headingLevel}>${inner}</h${headingLevel}>`);
        continue;
      }

      // Check if it's a Word list item
      if (isWordListItem(el)) {
        // Detect ordered vs unordered
        const style = el.getAttribute('style') || '';
        const isOrdered = /mso-list\s*:[^;]*level\d[^;]*lfo/i.test(style) && /\d+\./i.test(inner.substring(0, 10));
        const listType: 'ul' | 'ol' = isOrdered ? 'ol' : 'ul';

        if (currentList === null || currentListType !== listType) {
          flushList();
          currentList = [];
          currentListType = listType;
        }
        // Remove leading bullet characters (·, •, -, >) and numbers (1., 2.)
        const cleaned = inner.replace(/^[\s·•\-–—>§]+/, '').replace(/^\d+[.)]\s*/, '').trim();
        currentList.push(cleaned);
        continue;
      }

      // Regular paragraph
      flushList();
      output.push(`<p>${inner}</p>`);
      continue;
    }

    // Keep blockquote, table, hr, etc.
    if (tag === 'blockquote' || tag === 'table' || tag === 'hr') {
      flushList();
      output.push(el.outerHTML);
      continue;
    }
  }

  flushList();

  let result = output.join('');

  // Final cleanup: remove leftover font tags and empty attributes
  result = result.replace(/<\/?font[^>]*>/gi, '');
  result = result.replace(/\s+(class|style|lang|dir|id|align|valign|data-[a-z-]+)="[^"]*"/gi, '');

  return result;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
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
    </div>
  );
}
