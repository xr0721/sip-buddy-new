import React from 'react';
import { Sparkles, Coffee, Citrus, RefreshCw, Cherry, Candy, Flame } from 'lucide-react';

interface FlavorChipsProps {
  selectedChips: string[];
  onToggleChip: (chip: string) => void;
}

export const FLAVOR_OPTIONS = [
  { label: 'Fruity', icon: Cherry, description: 'Berries, stone fruit, juicy' },
  { label: 'Refreshing', icon: RefreshCw, description: 'Crisp, cooling, bubbly' },
  { label: 'Coffee', icon: Coffee, description: 'Rich roasted espresso or dark malt' },
  { label: 'Sweet', icon: Candy, description: 'Approachable, dessert-like or honey' },
  { label: 'Citrusy', icon: Citrus, description: 'Lemon, lime, or grapefruit punch' },
  { label: 'Bitter', icon: Flame, description: 'Gentian, aperitivo, or botanical bite' },
  { label: 'Surprise me', icon: Sparkles, description: 'Dealer’s choice with open palate' },
];

export const FlavorChips: React.FC<FlavorChipsProps> = ({ selectedChips, onToggleChip }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wider uppercase text-[#734A42]">
          Flavor vibe <span className="text-[11px] font-normal lowercase text-[#8C6961]">(tap all that sound good)</span>
        </label>
        {selectedChips.length > 0 && (
          <span className="text-[11px] font-medium text-[#C2410C]">
            {selectedChips.length} selected
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {FLAVOR_OPTIONS.map(({ label, icon: Icon }) => {
          const isSelected = selectedChips.includes(label);
          const isSurprise = label === 'Surprise me';

          return (
            <button
              key={label}
              type="button"
              onClick={() => onToggleChip(label)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all cursor-pointer select-none active:scale-95 border ${
                isSelected
                  ? isSurprise
                    ? 'bg-gradient-to-r from-[#D97706] to-[#E05D38] text-white border-transparent shadow-sm'
                    : 'bg-[#360E17] text-[#FAF6EE] border-[#360E17] shadow-sm'
                  : 'bg-[#FFFDF9] text-[#553229] border-[#E8DEC9] hover:bg-[#F5EDE1] hover:border-[#D9C8B0]'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isSelected
                    ? isSurprise
                      ? 'text-yellow-200'
                      : 'text-[#F59E0B]'
                    : 'text-[#9C7A70]'
                }`}
              />
              <span>{label}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
