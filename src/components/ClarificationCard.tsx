import React from 'react';
import { HelpCircle, ArrowRight, FastForward } from 'lucide-react';

interface ClarificationCardProps {
  question: string;
  options: string[];
  assumptionNotice?: string;
  onSelectOption: (option: string) => void;
  onSkip: () => void;
  isLoading: boolean;
}

export const ClarificationCard: React.FC<ClarificationCardProps> = ({
  question,
  options,
  assumptionNotice,
  onSelectOption,
  onSkip,
  isLoading,
}) => {
  return (
    <div className="rounded-3xl border-2 border-[#D97706]/40 bg-[#FFFDF9] p-5 sm:p-7 shadow-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C2410C]">
        <HelpCircle className="w-4 h-4" />
        <span>One Quick Sip Check</span>
      </div>

      <div>
        <h3 className="font-serif-title font-bold text-xl sm:text-2xl text-[#360E17] leading-snug">
          {question}
        </h3>
        {assumptionNotice && (
          <p className="text-xs sm:text-sm text-[#734A42] mt-1.5 italic">
            {assumptionNotice}
          </p>
        )}
      </div>

      {/* Tappable answer buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={isLoading}
            onClick={() => onSelectOption(opt)}
            className="min-h-[48px] px-4 py-3 rounded-2xl text-sm font-semibold text-left bg-[#FBF7F0] border border-[#E8DEC9] text-[#360E17] hover:bg-[#360E17] hover:text-[#FAF6EE] hover:border-[#360E17] transition-all cursor-pointer flex items-center justify-between group active:scale-98 disabled:opacity-50"
          >
            <span>{opt}</span>
            <ArrowRight className="w-4 h-4 text-[#C2410C] group-hover:text-[#F59E0B] transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>

      {/* Skip option */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          disabled={isLoading}
          onClick={onSkip}
          className="text-xs text-[#8C6961] hover:text-[#360E17] font-medium flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-[#F3ECE1] transition-colors"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip question and recommend immediately</span>
        </button>
      </div>
    </div>
  );
};
