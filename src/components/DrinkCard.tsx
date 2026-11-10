import React, { useState } from 'react';
import { Copy, Check, Sparkles, MessageSquareQuote, AlertCircle } from 'lucide-react';
import { DrinkCardData, AlcoholCategory } from '../types.js';
import { DrinkIcon } from './DrinkIcon.js';

interface DrinkCardProps {
  drink: DrinkCardData;
  isFeatured?: boolean;
}

export const DrinkCard: React.FC<DrinkCardProps> = ({ drink, isFeatured = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(drink.orderingSentence);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const renderAlcoholBadge = (category: AlcoholCategory) => {
    if (category === 'alcohol-free') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
          Alcohol-free (0% ABV)
        </span>
      );
    }
    if (category === 'lower-alcohol option') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
          Lower-alcohol option
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5EDE1] text-[#6B4136] border border-[#E4D5BF]">
        Contains alcohol
      </span>
    );
  };

  if (isFeatured) {
    return (
      <article className="relative rounded-3xl border-2 border-[#D97706]/40 bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC] to-[#F5EFEB] p-5 sm:p-7 shadow-md overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-[#F3C68F]/30 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#360E17] text-[#FAF6EE] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Your Best Match</span>
          </div>
          {renderAlcoholBadge(drink.alcoholCategory)}
        </div>

        {/* Title and Icon */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-[#360E17]/5 border border-[#360E17]/10 flex items-center justify-center shrink-0 text-[#C2410C]">
            <DrinkIcon name={drink.name} className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif-title font-bold text-2xl sm:text-3xl text-[#360E17] leading-tight">
              {drink.name}
            </h3>
            <p className="text-sm sm:text-base text-[#4A261F] font-medium mt-1 leading-snug">
              {drink.flavorSummary}
            </p>
          </div>
        </div>

        {/* Why it matches */}
        <div className="my-4 p-3.5 rounded-2xl bg-[#F7EFE1]/80 border border-[#EADCC8] text-xs sm:text-sm text-[#4E2B23]">
          <span className="font-bold text-[#360E17] mr-1.5">Why it matches your taste:</span>
          <span>{drink.matchReason}</span>
        </div>

        {/* Ingredients */}
        <div className="mb-5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#734A42] mb-1.5">
            Typical Main Ingredients
          </span>
          <div className="flex flex-wrap gap-1.5">
            {drink.typicalIngredients.map((ingredient, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FFFDF9] border border-[#E6D7C2] text-[#42221A] shadow-2xs"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>

        {/* Ordering Phrase Box */}
        <div className="p-4 rounded-2xl bg-[#360E17] text-[#FAF6EE] shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>Say this at the bar:</span>
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
                  <span>Copy order</span>
                </>
              )}
            </button>
          </div>
          <p className="font-serif-title text-base sm:text-lg text-white font-medium italic leading-relaxed pt-1">
            "{drink.orderingSentence}"
          </p>
        </div>

        {/* Bar caution notice if any */}
        {drink.barCautionNotice && (
          <div className="mt-3 flex items-start gap-2 text-xs text-[#7A5046]">
            <AlertCircle className="w-3.5 h-3.5 text-[#C2410C] shrink-0 mt-0.5" />
            <span>{drink.barCautionNotice}</span>
          </div>
        )}
      </article>
    );
  }

  // Smaller Alternative Card
  return (
    <article className="rounded-3xl border border-[#E6D7C2] bg-[#FFFDF9] p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-[#D9C4A6] transition-all">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A5B50]">
            Alternative Pick
          </span>
          {renderAlcoholBadge(drink.alcoholCategory)}
        </div>

        <div className="flex items-start gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#F5EDE1] flex items-center justify-center shrink-0 text-[#C2410C]">
            <DrinkIcon name={drink.name} className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif-title font-bold text-lg sm:text-xl text-[#360E17] leading-tight">
              {drink.name}
            </h4>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#4E2B23] font-medium mb-3 leading-snug">
          {drink.flavorSummary}
        </p>

        {/* Why it matches */}
        <p className="text-xs text-[#6E483F] bg-[#FAF5EB] p-2.5 rounded-xl border border-[#F0E4D3] mb-3">
          <span className="font-bold text-[#360E17]">Why it works:</span> {drink.matchReason}
        </p>

        {/* Ingredients */}
        <div className="mb-4">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8A5B50] mb-1">
            Ingredients
          </span>
          <div className="flex flex-wrap gap-1">
            {drink.typicalIngredients.map((ingredient, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F8F2E6] text-[#553229]"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ordering Sentence & Copy */}
      <div className="pt-3 border-t border-[#F0E6D5]">
        <div className="flex items-center justify-between gap-1 text-[11px] font-bold uppercase tracking-wider text-[#8A5B50] mb-1">
          <span>Say this:</span>
          <button
            type="button"
            onClick={handleCopy}
            className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              copied
                ? 'bg-[#15803D] text-white'
                : 'text-[#C2410C] hover:bg-[#FCEFE8] active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs sm:text-sm text-[#360E17] italic font-serif-title font-medium leading-snug">
          "{drink.orderingSentence}"
        </p>
      </div>
    </article>
  );
};
