'use client';

import React from 'react';
import AIAnalyticsAssistant from '../dashboard/AIAnalyticsAssistant';
import QueryTransparency from '../dashboard/QueryTransparency';

interface AIAnalyticsViewProps {
  externalPrompt?: string;
  onClearPrompt?: () => void;
  latestTransparency?: any;
  onUpdateTransparency?: (t: any) => void;
}

export default function AIAnalyticsView({
  externalPrompt,
  onClearPrompt,
  latestTransparency,
  onUpdateTransparency
}: AIAnalyticsViewProps) {
  return (
    <div className="space-y-6">
      <AIAnalyticsAssistant
        externalPrompt={externalPrompt}
        onClearPrompt={onClearPrompt}
        onUpdateTransparency={onUpdateTransparency}
        isStandaloneView={true}
      />

      <QueryTransparency transparency={latestTransparency} defaultOpen={true} />
    </div>
  );
}
