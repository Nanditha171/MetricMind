'use client';

import React from 'react';
import { CheckCircle2, ChevronRight, Calculator, FileSpreadsheet } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split into lines for structured enterprise executive formatting
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${renderedElements.length}`} className="space-y-2 my-2.5">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const formatInline = (text: string) => {
    // Replace **bold** with <strong>
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900 font-sans">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-brand-700 font-mono text-[11px]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    // Heading 3 or 4: ### or ####
    if (trimmed.startsWith('#### ')) {
      flushList();
      renderedElements.push(
        <h4
          key={`h4-${index}`}
          className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-4 mb-1.5 text-brand-800 flex items-center"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mr-2 inline-block"></span>
          {trimmed.replace('#### ', '')}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      renderedElements.push(
        <div
          key={`h3-${index}`}
          className="p-3 bg-brand-50/70 border-l-4 border-brand-600 rounded-r-xl my-3 text-slate-900 font-bold text-sm"
        >
          {trimmed.replace('### ', '')}
        </div>
      );
      return;
    }

    // Bullet points (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      const itemText = trimmed.replace(/^[-*]\s+/, '');
      listItems.push(
        <li key={`li-${index}`} className="flex items-start space-x-2 text-xs md:text-sm text-slate-700">
          <ChevronRight className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{formatInline(itemText)}</div>
        </li>
      );
      return;
    }

    // Numbered lists (1. , 2. )
    if (/^\d+\.\s+/.test(trimmed)) {
      inList = true;
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        listItems.push(
          <li key={`num-${index}`} className="flex items-start space-x-2 text-xs md:text-sm text-slate-700">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
              {numMatch[1]}
            </span>
            <div className="leading-relaxed pt-0.5">{formatInline(numMatch[2])}</div>
          </li>
        );
        return;
      }
    }

    flushList();

    // Standard paragraph
    renderedElements.push(
      <p key={`p-${index}`} className="text-xs md:text-sm text-slate-700 leading-relaxed my-1.5">
        {formatInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1">{renderedElements}</div>;
}
