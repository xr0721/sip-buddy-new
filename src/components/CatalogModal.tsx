import React, { useState } from 'react';
import { X, Search, BookOpen, Sparkles } from 'lucide-react';
import { DRINK_REFERENCES, DrinkReference } from '../data/drinkReferences.js';
import { DrinkIcon } from './DrinkIcon.js';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDrinkForInspiration?: (drinkName: string) => void;
}

export const CatalogModal: React.FC<CatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectDrinkForInspiration,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'cocktail' | 'wine' | 'beer' | 'zero-proof'>('all');

  if (!isOpen) return null;

  const filtered = DRINK_REFERENCES.filter(drink => {
    if (categoryFilter !== 'all' && drink.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const inName = drink.name.toLowerCase().includes(term);
      const inDesc = drink.flavorDescription.toLowerCase().includes(term);
      const inIngredients = drink.typicalIngredients.some(i => i.toLowerCase().includes(term));
      const inTags = drink.flavorTags.some(t => t.toLowerCase().includes(term));
      return inName || inDesc || inIngredients || inTags;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-[#FFFDF9] rounded-3xl border border-[#E8DEC9] shadow-2xl flex flex-col overflow-hidden text-[#360E17]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EFE5D5] flex items-center justify-between bg-[#FAF6EE]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#C2410C]" />
            <div>
              <h3 className="font-serif-title font-bold text-lg text-[#360E17]">
                Reference Drink Catalog ({DRINK_REFERENCES.length} drinks)
              </h3>
              <p className="text-[11px] text-[#8C6961]">
                Curated bar staples, wines, beers & craft zero-proof choices.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8C6961] hover:text-[#360E17] hover:bg-[#EFE5D5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 border-b border-[#F0E6D5] bg-[#FAF5EB] space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C6961] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search drinks, flavors, ingredients (e.g. coffee, ginger, mint)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white border border-[#E2D2BC] text-[#360E17] placeholder-[#9E837B] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['all', 'cocktail', 'wine', 'beer', 'zero-proof'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  categoryFilter === cat
                    ? 'bg-[#360E17] text-[#FAF6EE] font-semibold'
                    : 'bg-white border border-[#E2D2BC] text-[#633F36] hover:bg-[#F3ECE1]'
                }`}
              >
                {cat === 'all' ? 'All drinks (24)' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Drink List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 divide-y divide-[#F0E6D5]">
          {filtered.map(drink => (
            <div key={drink.id} className="pt-3 first:pt-0 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FAF5EB] border border-[#EBDDC8] flex items-center justify-center shrink-0 text-[#C2410C] mt-1">
                <DrinkIcon name={drink.name} category={drink.category} className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-serif-title font-bold text-base text-[#360E17]">
                    {drink.name}
                  </h4>
                  {drink.creatorFavorite && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E]">
                      <Sparkles className="w-2.5 h-2.5" /> Creator Pick
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      drink.alcoholCategory === 'alcohol-free'
                        ? 'bg-[#DCFCE7] text-[#166534]'
                        : drink.alcoholCategory === 'lower-alcohol option'
                        ? 'bg-[#FEF3C7] text-[#92400E]'
                        : 'bg-[#F5EDE1] text-[#6B4136]'
                    }`}
                  >
                    {drink.alcoholCategory}
                  </span>
                </div>
                <p className="text-xs text-[#522E26] mt-1 leading-snug">
                  {drink.flavorDescription}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {drink.typicalIngredients.map((ing, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F8F2E6] text-[#633F36]">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs text-[#8C6961]">
              No drinks match "{searchTerm}". Try a different search term or category.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#EFE5D5] bg-[#FAF6EE] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold bg-[#360E17] text-white hover:bg-[#4A1521]"
          >
            Close Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
