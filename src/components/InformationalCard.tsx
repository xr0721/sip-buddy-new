import React, { useState } from 'react';
import { HelpCircle, MessageSquareQuote, Copy, Check, RotateCcw, Sparkles } from 'lucide-react';
import { InformationalData } from '../types.js';

interface InformationalCardProps {
  data: InformationalData;
  onStartOver: () => void;
  onAskForRecommendation?: () => void;
}

export const InformationalCard: React.FC<InformationalCardProps> = ({
  data,
  onStartOver,
  onAskForRecommendation,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!data.suggestedInquiry) return;
    try {
      await navigator.clipboard.writeText(data.suggestedInquiry);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  return (
    <article className="rounded-3xl border-2 border-[#D97706]/35 bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFEB] p-5 sm:p-7 shadow-md space-y-5 animate-in fade-in duration-200">
      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#360E17] text-[#FAF6EE] shadow-xs">
          <HelpCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>{data.title || 'Bar Menu & Availability'}</span>
        </div>
        <span className="text-[11px] font-semibold text-[#8A5B50] uppercase tracking-wider">
          Direct Answer
        </span>
      </div>

      {/* Direct Plain-Language Answer */}
      <div>
        <h3 className="font-serif-title font-bold text-xl sm:text-2xl text-[#360E17] leading-snug">
          {data.answer}
        </h3>
      </div>

      {/* Suggested In-Bar Inquiry Box */}
      {data.suggestedInquiry && (
        <div className="p-4 rounded-2xl bg-[#360E17] text-[#FAF6EE] shadow-sm space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>Ask the bartender:</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                copied
                  ? 'bg-[#15803D] text-white'
                  : 'bg-[#4A1521] text-[#FAF6EE] hover:bg-[#5C1A29] active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Copy question</span>
                </>
              )}
            </button>
          </div>
          <p className="font-serif-title text-base sm:text-lg text-white font-medium italic leading-relaxed pt-0.5">
            "{data.suggestedInquiry}"
          </p>
        </div>
      )}

      {/* Buddy note */}
      {data.buddyNote && (
        <div className="p-3.5 rounded-2xl bg-[#FFF9EE] border border-[#F1E0C4] text-xs sm:text-sm text-[#5B3931] leading-relaxed">
          <strong className="text-[#360E17] font-semibold block mb-0.5">
            Sip Buddy's Advice:
          </strong>
          {data.buddyNote}
        </div>
      )}

      {/* Actions */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8DEC9]">
        <button
          type="button"
          onClick={onStartOver}
          className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#8C6961] hover:text-[#360E17] hover:bg-[#EFE6D6] border border-transparent hover:border-[#E2D2BC] flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ask something else</span>
        </button>

        {onAskForRecommendation && (
          <button
            type="button"
            onClick={onAskForRecommendation}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#360E17] text-white hover:bg-[#4A1521] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Recommend a drink instead</span>
          </button>
        )}
      </div>
    </article>
  );
};
