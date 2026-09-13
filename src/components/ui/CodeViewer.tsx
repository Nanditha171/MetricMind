'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  maxHeight?: string;
}

export default function CodeViewer({
  code,
  language = 'sql',
  title,
  maxHeight = '320px'
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0B0F19] overflow-hidden shadow-inner font-mono text-xs text-slate-300">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          {title && <span className="ml-2 text-slate-400 font-sans text-xs">{title}</span>}
          {!title && <span className="ml-2 text-slate-500 uppercase text-[10px] tracking-wider">{language}</span>}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 rounded-md transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div style={{ maxHeight }} className="overflow-x-auto overflow-y-auto p-4 dark-scroll leading-relaxed">
        <pre className="text-emerald-400 whitespace-pre">
          {code}
        </pre>
      </div>
    </div>
  );
}
