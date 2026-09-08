import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle2, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { getBaseTemplates, applyContextToTemplate, TemplateOption, BusinessData } from '../../lib/templateEngine';

interface ReviewTemplateGeneratorProps {
  businessData: BusinessData;
  onContinueToGoogle: () => void;
  isRedirecting: boolean;
}

const CONTEXT_OPTIONS = [
  'Great service',
  'Friendly staff',
  'High quality',
  'Fast service',
  'Professional team',
  'Clean & comfortable',
  'Good value',
  'Overall experience'
];

export const ReviewTemplateGenerator: React.FC<ReviewTemplateGeneratorProps> = ({
  businessData,
  onContinueToGoogle,
  isRedirecting
}) => {
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState('');
  const [baseTemplates, setBaseTemplates] = useState<TemplateOption[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('short');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Generate templates only on mount and explicit refresh
  useEffect(() => {
    setBaseTemplates(getBaseTemplates(businessData));
  }, [businessData]);

  // Apply current context to the base templates
  const templates = baseTemplates.map(t => ({
    ...t,
    text: applyContextToTemplate(t.text, selectedContexts, customNote)
  }));

  const toggleContext = (ctx: string) => {
    setSelectedContexts(prev => 
      prev.includes(ctx) 
        ? prev.filter(c => c !== ctx)
        : [...prev, ctx]
    );
  };

  const handleRefresh = () => {
    setBaseTemplates(getBaseTemplates(businessData));
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setSelectedTemplateId(id);
      setHasCopied(true);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full text-left pt-2">
      <div className="text-center space-y-1 mb-4">
        <div className="inline-flex items-center justify-center p-2 bg-indigo-50 text-indigo-600 rounded-full mb-2">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Share your experience</h3>
        <p className="text-sm text-slate-500">
          Choose a review you like, make any changes, then copy it to Google.
        </p>
      </div>

      {/* Context Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          What did you like about your experience? <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CONTEXT_OPTIONS.map(ctx => (
            <button
              key={ctx}
              type="button"
              onClick={() => toggleContext(ctx)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedContexts.includes(ctx)
                  ? 'bg-indigo-100 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {ctx}
            </button>
          ))}
        </div>
        <textarea
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
          placeholder="Write something else..."
          className="w-full mt-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
          rows={2}
        />
      </div>

      {/* Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-slate-700">Review Templates</label>
          <button 
            type="button"
            onClick={handleRefresh}
            className="text-xs text-indigo-600 flex items-center gap-1 hover:text-indigo-700 cursor-pointer font-medium"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {templates.map(template => (
            <div 
              key={template.id}
              onClick={() => setSelectedTemplateId(template.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedTemplateId === template.id 
                  ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/10' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start gap-4 mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {template.type === 'short' ? 'Short & Sweet' : template.type === 'detailed' ? 'Detailed' : 'Local Guide'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(template.id, template.text);
                  }}
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                    copiedId === template.id 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {copiedId === template.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === template.id ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                "{template.text}"
              </p>
              <div className="mt-2 text-right">
                <span className="text-[10px] text-slate-400">{template.text.length} chars</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Actions */}
      <div className="pt-4 space-y-3">
        <Button
          onClick={() => {
            if (selectedTemplate && !hasCopied) {
              handleCopy(selectedTemplate.id, selectedTemplate.text);
            } else {
              onContinueToGoogle();
            }
          }}
          disabled={isRedirecting}
          variant={hasCopied ? 'primary' : 'outline'}
          className={`w-full justify-center ${!hasCopied ? 'bg-slate-900 text-white hover:bg-slate-800' : ''}`}
          size="lg"
        >
          {isRedirecting ? (
            'Connecting to Google...'
          ) : hasCopied ? (
            <>
              Continue to Google <ExternalLink className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" /> Copy & Continue to Google
            </>
          )}
        </Button>
        {hasCopied && (
          <p className="text-xs text-center text-emerald-600 font-medium flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Review text copied to clipboard!
          </p>
        )}
        <p className="text-[11px] text-slate-400 text-center leading-tight">
          You will be redirected directly to Google's official review page for {businessData.businessName}.
        </p>
      </div>
    </div>
  );
};
