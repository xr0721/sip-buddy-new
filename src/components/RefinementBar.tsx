import React from 'react';
import { RotateCcw, Droplets, Sparkles, Shuffle, RefreshCw } from 'lucide-react';

interface RefinementBarProps {
  activeRefinements: string[];
  onApplyRefinement: (refinement: string) => void;
  onStartOver: () => void;
  isLoading: boolean;
}

export const RefinementBar: React.FC<RefinementBarProps> = ({
  activeRefinements,
  onApplyRefinement,
  onStartOver,
  isLoading,
}) => {
  const refinements = [
    { label: 'Less sweet', icon: Droplets, description: 'Shift towards dry or crisp profiles' },
    { label: 'More refreshing', icon: RefreshCw, description: 'Lighter, bubbly, thirst-quenching' },
    { label: 'Something different', icon: Shuffle, description: 'Swap for brand new candidates' },
  ];

  return (
    <div className="pt-6 pb-2 border-t border-[#E8DEC9] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#734A42]">
          Not quite hitting the spot?
        </span>
        <span className="text-[11px] text-[#8C6961]">Preserves your ingredients & alcohol rules</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {refinements.map(({ label, icon: Icon }) => {
          const isActive = activeRefinements.includes(label);
          return (
            <button
              key={label}
              type="button"
              disabled={isLoading}
              onClick={() => onApplyRefinement(label)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${
                isActive
                  ? 'bg-[#360E17] text-white border-[#360E17] shadow-xs'
                  : 'bg-[#FFFDF9] text-[#4E2B23] border-[#E2D2BC] hover:bg-[#F5EDE1] hover:border-[#D5C2AA]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F59E0B]' : 'text-[#C2410C]'}`} />
              <span>{label}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />}
            </button>
          );
        })}

        {/* Start Over Button */}
        <button
          type="button"
          onClick={onStartOver}
          className="min-h-[44px] ml-auto px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#8C6961] hover:text-[#360E17] hover:bg-[#EFE6D6] border border-transparent hover:border-[#E2D2BC] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          title="Reset conversation and start from scratch"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start over</span>
        </button>
      </div>
    </div>
  );
};
