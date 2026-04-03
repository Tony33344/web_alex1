'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableContentProps {
  content: string;
  maxLength?: number;
}

export function ExpandableContent({ content, maxLength = 500 }: ExpandableContentProps) {
  const [expanded, setExpanded] = useState(false);

  if (!content) return null;

  const shouldTruncate = content.length > maxLength;
  const displayContent = !expanded && shouldTruncate 
    ? content.slice(0, maxLength) + '...' 
    : content;

  return (
    <div>
      <div 
        className="prose prose-lg max-w-none dark:prose-invert prose-headings:tracking-tight prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground"
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />
      {shouldTruncate && (
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
