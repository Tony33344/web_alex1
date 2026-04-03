'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableContentProps {
  content: string;
  collapsedHeight?: number;
}

export function ExpandableContent({ content, collapsedHeight = 200 }: ExpandableContentProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setNeedsTruncation(contentRef.current.scrollHeight > collapsedHeight + 40);
    }
  }, [content, collapsedHeight]);

  if (!content) return null;

  return (
    <div>
      <div
        ref={contentRef}
        style={{
          maxHeight: !expanded && needsTruncation ? `${collapsedHeight}px` : undefined,
          overflow: !expanded && needsTruncation ? 'hidden' : undefined,
          maskImage: !expanded && needsTruncation ? 'linear-gradient(to bottom, black 60%, transparent 100%)' : undefined,
          WebkitMaskImage: !expanded && needsTruncation ? 'linear-gradient(to bottom, black 60%, transparent 100%)' : undefined,
        }}
        className="prose prose-lg max-w-none dark:prose-invert prose-headings:tracking-tight prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground transition-all duration-300"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {needsTruncation && (
        <Button
          variant="link"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 h-auto p-0 text-primary"
        >
          {expanded ? (
            <>Show less <ChevronUp className="ml-1 h-4 w-4" /></>
          ) : (
            <>Show more <ChevronDown className="ml-1 h-4 w-4" /></>
          )}
        </Button>
      )}
    </div>
  );
}
