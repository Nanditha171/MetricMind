'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  Layers,
  HelpCircle,
  BarChart2
} from 'lucide-react';
import { ChatResponse, sendChatMessage } from '../../lib/api';
import DynamicChart from '../DynamicChart';
import TransparencyPanel from '../TransparencyPanel';
import RootCauseAnalysis from './RootCauseAnalysis';
import MarkdownRenderer from '../ui/MarkdownRenderer';

interface AIAnalyticsAssistantProps {
  externalPrompt?: string;
  onClearPrompt?: () => void;
  onSelectQuery?: (query: string) => void;
  onUpdateTransparency?: (transparency: any) => void;
  isStandaloneView?: boolean;
}

export default function AIAnalyticsAssistant({
  externalPrompt,
  onClearPrompt,
  onSelectQuery,
  onUpdateTransparency,
  isStandaloneView = false
}: AIAnalyticsAssistantProps) {
  const [promptInput, setPromptInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeResponse, setActiveResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedTrace, setExpandedTrace] = useState(true);

  const exampleQuestions = [
    'Why did European margins drop?',
    'Show revenue by region',
    'What changed this quarter?',
    'Analyze shipping costs',
    'Compare Q3 vs Q4',
    'Show top products'
  ];

  React.useEffect(() => {
    if (externalPrompt) {
      setPromptInput(externalPrompt);
      handleAsk(externalPrompt);
      if (onClearPrompt) onClearPrompt();
    }
  }, [externalPrompt]);

  const handleAsk = async (queryText?: string) => {
    const query = queryText || promptInput;
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(query);
      setActiveResponse(response);
      if (onUpdateTransparency && response.transparency) {
        onUpdateTransparency(response.transparency);
      }
    } catch (err: any) {
      console.error('Chat query error:', err);
      setError(err.message || 'Failed to process natural language query with agent.');
    } finally {
      setLoading(false);
    }
  };

  const isRootCauseQuery =
    activeResponse?.query.toLowerCase().includes('why') ||
    activeResponse?.query.toLowerCase().includes('drop') ||
    activeResponse?.query.toLowerCase().includes('margin') ||
    activeResponse?.query.toLowerCase().includes('cause');

  return (
    <div className="bg-white border border-surface-border rounded-2xl p-5 md:p-6 shadow-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-surface-border gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">
                AI Analytics Assistant
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-semibold font-mono">
                Gemini + LangChain
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ask questions about your business data in natural language. Governed semantic interpretation.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 self-start sm:self-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Zero SQL Injection Risk</span>
        </div>
      </div>

      {/* Natural Language Question Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex flex-col sm:flex-row gap-2.5"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="e.g., 'Why did our European margins drop last quarter?'"
            className="w-full bg-slate-50 focus:bg-white text-slate-800 text-xs md:text-sm pl-4 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-inner"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !promptInput.trim()}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-xs md:text-sm px-6 py-3 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-brand-600/20 transition-all shrink-0"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Example Question Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
          Quick Prompts:
        </span>
        {exampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPromptInput(q);
              handleAsk(q);
            }}
            className="text-xs bg-slate-50 hover:bg-brand-50 text-slate-600 hover:text-brand-700 border border-slate-200 hover:border-brand-200 px-3 py-1.5 rounded-full transition-all flex items-center space-x-1.5 shadow-sm group"
          >
            <Sparkles className="w-3 h-3 text-slate-400 group-hover:text-brand-500 transition-colors" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton during Agent Orchestration */}
      {loading && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-50/50 to-indigo-50/30 border border-brand-100 space-y-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-brand-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                MetricMind Agent Orchestrating Governed Tools
              </div>
              <div className="text-[11px] text-slate-500">
                Resolving semantic intent, validating measures against catalog, querying PostgreSQL...
              </div>
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-4 bg-brand-200/50 rounded w-3/4"></div>
            <div className="h-4 bg-brand-200/40 rounded w-5/6"></div>
            <div className="h-4 bg-brand-200/30 rounded w-1/2"></div>
          </div>
        </div>
      )}

      {/* Structured Executive AI Insight Card */}
      {activeResponse && !loading && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 md:p-6 space-y-5">
          {/* Top Banner: Question & Status */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Question Analyzed:
              </span>
              <span className="text-xs font-bold text-slate-800 italic">
                "{activeResponse.query}"
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Governed Result</span>
            </div>
          </div>

          {/* AI Insight Header */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                AI Executive Insight
              </h3>
            </div>

            {/* Headline Conclusion */}
            {activeResponse.answer && (
              <div className="p-3 bg-white rounded-xl border border-brand-100 shadow-sm text-sm font-semibold text-brand-900">
                {activeResponse.answer}
              </div>
            )}
          </div>

          {/* Multi-Step Agent Reasoning Trace Collapsible */}
          {activeResponse.reasoning_steps && activeResponse.reasoning_steps.length > 0 && (
            <div className="border border-brand-200/80 bg-white rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setExpandedTrace(!expandedTrace)}
                className="w-full px-4 py-3 bg-brand-50/50 hover:bg-brand-50 flex items-center justify-between text-xs font-semibold text-brand-800 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>
                    Multi-Step Reasoning Trace ({activeResponse.reasoning_steps.length} Governed Steps)
                  </span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${expandedTrace ? 'rotate-90' : ''}`}
                />
              </button>

              {expandedTrace && (
                <div className="p-4 space-y-3 bg-slate-950 text-slate-200 border-t border-brand-100 font-mono text-xs dark-scroll max-h-64 overflow-y-auto">
                  {activeResponse.reasoning_steps.map((step, idx) => (
                    <div key={idx} className="pl-3 border-l-2 border-brand-500 space-y-1">
                      <div className="text-brand-400 font-bold">
                        Step {step.step}: {step.action}
                      </div>
                      {step.thought && (
                        <div className="text-slate-400 italic">Thought: {step.thought}</div>
                      )}
                      {step.generated_sql && (
                        <div className="text-emerald-400 bg-black/70 p-2 rounded text-[11px] whitespace-pre-wrap">
                          {step.generated_sql}
                        </div>
                      )}
                      {step.observation && (
                        <div className="text-amber-400 font-medium">
                          Observation: {step.observation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Markdown Content / Explanation with Rich Typography */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-xs md:text-sm text-slate-700 leading-relaxed">
            <MarkdownRenderer content={activeResponse.explanation} />
          </div>

          {/* Dynamic ECharts visualization returned by the backend */}
          {activeResponse.chart_config && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Supporting Governed Visualization
              </h4>
              <DynamicChart option={activeResponse.chart_config} height="360px" />
            </div>
          )}

          {/* Dynamic Root Cause Section if root-cause question */}
          {isRootCauseQuery && (
            <div className="pt-2">
              <RootCauseAnalysis
                region="Europe"
                prevQuarter="Q3 2025"
                currentQuarter="Q4 2025"
                prevMargin={48.12}
                currentMargin={26.49}
                materialCostChangePct={13.09}
                shippingCostChangePct={399.01}
                dominantContributor="Shipping Cost"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
