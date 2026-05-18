import { useMemo } from "react";
import { renderMarkdown } from "../lib/markdown";

type Props = {
  content: string;
  className?: string;
};

export function MarkdownPreview({ content, className = "" }: Props) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  if (!content.trim()) {
    return (
      <p
        className={`text-base leading-relaxed text-slate-400 dark:text-slate-500 ${className}`.trim()}
      >
        Nothing to preview yet.
      </p>
    );
  }

  return (
    <div
      className={`markdown-preview text-base leading-relaxed text-slate-800 dark:text-slate-200 ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
