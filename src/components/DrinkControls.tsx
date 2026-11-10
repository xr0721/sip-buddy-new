import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, ShieldAlert, Sparkles } from 'lucide-react';
import { DrinkTypeFilter, AlcoholPreferenceFilter } from '../types.js';

interface DrinkControlsProps {
  drinkType: DrinkTypeFilter;
  onChangeDrinkType: (type: DrinkTypeFilter) => void;
  alcoholPreference: AlcoholPreferenceFilter;
  onChangeAlcoholPreference: (pref: AlcoholPreferenceFilter) => void;
  avoidIngredients: string;
  onChangeAvoidIngredients: (text: string) => void;
}

const DRINK_TYPES: DrinkTypeFilter[] = ['Any', 'Cocktail', 'Wine', 'Beer', 'Zero-proof'];
const ALCOHOL_PREFERENCES: AlcoholPreferenceFilter[] = ['Regular', 'Lower alcohol', 'No alcohol'];

export const DrinkControls: React.FC<DrinkControlsProps> = ({
  drinkType,
  onChangeDrinkType,
  alcoholPreference,
  onChangeAlcoholPreference,
  avoidIngredients,
  onChangeAvoidIngredients,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Indicator of non-default settings
  const hasCustomSettings =
    drinkType !== 'Any' ||
    alcoholPreference !== 'Regular' ||
    avoidIngredients.trim().length > 0;

  return (
    <div className="rounded-2xl border border-[#E8DEC9] bg-[#FFFDF9] overflow-hidden transition-all shadow-sm">
      {/* Header bar / accordion toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[44px] px-4 py-2.5 flex items-center justify-between text-left text-xs font-medium text-[#5B3931] hover:bg-[#F9F4EB] transition-colors"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#C2410C]" />
          <span className="font-semibold text-xs tracking-wide uppercase text-[#5B3931]">
            Bar Preferences & Exclusions
          </span>
          {hasCustomSettings && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E05D38] text-white">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[#8C6961] text-xs">
          <span>{isOpen ? 'Collapse' : 'Customize'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expandable options */}
      {isOpen && (
        <div className="p-4 pt-2 border-t border-[#F0E6D5] space-y-4 bg-[#FCFAF5]">
          {/* Drink Type Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#734A42] mb-1.5">
              Drink Type
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {DRINK_TYPES.map(type => {
                const isSelected = drinkType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChangeDrinkType(type)}
                    className={`min-h-[40px] px-2 py-1.5 rounded-xl text-xs font-medium text-center transition-all border ${
                      isSelected
                        ? 'bg-[#360E17] text-[#FAF6EE] border-[#360E17] font-semibold shadow-xs'
                        : 'bg-white text-[#5B3931] border-[#E8DEC9] hover:bg-[#F5EDE1]'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alcohol Preference */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#734A42] mb-1.5">
              Alcohol Level
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {ALCOHOL_PREFERENCES.map(pref => {
                const isSelected = alcoholPreference === pref;
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => onChangeAlcoholPreference(pref)}
                    className={`min-h-[40px] px-2.5 py-1.5 rounded-xl text-xs font-medium text-center transition-all border ${
                      isSelected
                        ? pref === 'No alcohol'
                          ? 'bg-[#15803D] text-white border-[#15803D] font-semibold shadow-xs'
                          : 'bg-[#360E17] text-[#FAF6EE] border-[#360E17] font-semibold shadow-xs'
                        : 'bg-white text-[#5B3931] border-[#E8DEC9] hover:bg-[#F5EDE1]'
                    }`}
                  >
                    {pref}
                  </button>
                );
              })}
            </div>
            {alcoholPreference === 'No alcohol' && (
              <p className="text-[11px] text-[#15803D] font-medium mt-1">
                ✓ Strictly recommends zero-proof mocktails and craft alcohol-free beverages.
              </p>
            )}
          </div>

          {/* Ingredients to Avoid */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#734A42]">
                Ingredients to Avoid
              </label>
              <span className="text-[10px] text-[#8C6961]">e.g. dairy, whiskey, mint, gin</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={avoidIngredients}
                onChange={e => onChangeAvoidIngredients(e.target.value)}
                placeholder="No dairy, no tonic, no tequila, no bourbon..."
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl text-xs bg-white border border-[#E8DEC9] text-[#360E17] placeholder-[#A89088] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 focus:border-[#C2410C] transition-all"
              />
              {avoidIngredients.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => onChangeAvoidIngredients('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8C6961] hover:text-[#360E17] px-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
