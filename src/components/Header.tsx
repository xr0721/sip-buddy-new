import React from 'react';
import { Wine, Info, BookOpen, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenHowItWorks: () => void;
  onOpenCatalog: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHowItWorks, onOpenCatalog, onReset }) => {
  return (
    <header className="border-b border-[#E8DEC9] bg-[#FAF6EE]/90 backdrop-blur sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Logo / Brand */}
        <button
          onClick={onReset}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
          title="Return to Sip Buddy home"
        >
          <div className="w-9 h-9 rounded-xl bg-[#360E17] text-[#FAF6EE] flex items-center justify-center shadow-sm group-hover:bg-[#4A1521] transition-colors">
            <Wine className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-title font-bold text-xl tracking-tight text-[#360E17]">
                Sip Buddy
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F3C68F]/40 text-[#854D0E]">
                Bar Guide
              </span>
            </div>
            <p className="text-[11px] text-[#785C56] -mt-0.5 font-medium">Your drink-menu confidant</p>
          </div>
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenCatalog}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-[#E2D2BC] bg-[#F7F1E5] text-[#5A3831] hover:bg-[#EFE6D6] hover:text-[#360E17] transition-all"
            title="Browse our 24 drink reference collection"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#C2410C]" />
            <span className="hidden xs:inline">Reference Book</span>
            <span className="xs:hidden">Guide</span>
          </button>

          <button
            onClick={onOpenHowItWorks}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-[#E2D2BC] bg-[#F7F1E5] text-[#5A3831] hover:bg-[#EFE6D6] hover:text-[#360E17] transition-all"
            title="See the AI and deterministic retrieval pipeline"
          >
            <Info className="w-3.5 h-3.5 text-[#D97706]" />
            <span className="hidden sm:inline">How it works</span>
          </button>
        </div>
      </div>
    </header>
  );
};
