import React, { useState } from 'react';
import { Sparkles, Wine, GlassWater, Loader2, AlertCircle, RotateCcw, HeartHandshake } from 'lucide-react';
import { Header } from './components/Header.js';
import { FlavorChips } from './components/FlavorChips.js';
import { DrinkControls } from './components/DrinkControls.js';
import { DrinkCard } from './components/DrinkCard.js';
import { RefinementBar } from './components/RefinementBar.js';
import { ClarificationCard } from './components/ClarificationCard.js';
import { HowItWorksModal } from './components/HowItWorksModal.js';
import { CatalogModal } from './components/CatalogModal.js';
import { InformationalCard } from './components/InformationalCard.js';
import {
  DrinkTypeFilter,
  AlcoholPreferenceFilter,
  RecommendationPayload,
  TransparencyData,
} from './types.js';

export default function App() {
  // State for user inputs
  const [userQuery, setUserQuery] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [drinkType, setDrinkType] = useState<DrinkTypeFilter>('Any');
  const [alcoholPreference, setAlcoholPreference] = useState<AlcoholPreferenceFilter>('Regular');
  const [avoidIngredients, setAvoidIngredients] = useState('');
  const [activeRefinements, setActiveRefinements] = useState<string[]>([]);

  // State for recommendation response
  const [payload, setPayload] = useState<RecommendationPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Previous recommendation history for "Something different" refinement
  const [previousDrinkNames, setPreviousDrinkNames] = useState<string[]>([]);

  // Toggle flavor chips
  const handleToggleChip = (chip: string) => {
    setSelectedChips(prev => {
      if (prev.includes(chip)) {
        return prev.filter(c => c !== chip);
      }
      return [...prev, chip];
    });
  };

  // Perform API request
  const fetchRecommendations = async (params: {
    clarificationAnswer?: string;
    skipClarification?: boolean;
    additionalRefinement?: string;
    customQuery?: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    const queryToSend = params.customQuery !== undefined ? params.customQuery : userQuery;

    let updatedRefinements = [...activeRefinements];
    if (params.additionalRefinement) {
      if (!updatedRefinements.includes(params.additionalRefinement)) {
        updatedRefinements.push(params.additionalRefinement);
      }
      setActiveRefinements(updatedRefinements);
    }

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: queryToSend,
          selectedFlavorChips: selectedChips,
          drinkType,
          alcoholPreference,
          avoidIngredients,
          refinements: updatedRefinements,
          previousRecommendations: previousDrinkNames,
          clarificationAnswer: params.clarificationAnswer,
          skipClarification: params.skipClarification,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      const data: RecommendationPayload = await response.json();
      setPayload(data);

      // Track recommended drinks
      if (data.recommendationData?.bestMatch) {
        const newNames = [
          data.recommendationData.bestMatch.name,
          ...(data.recommendationData.alternatives?.map(a => a.name) || []),
        ];
        setPreviousDrinkNames(prev => Array.from(new Set([...prev, ...newNames])));
      }

      // Smooth scroll down to results if recommendations were returned
      if (data.responseType === 'recommendations') {
        setTimeout(() => {
          const resultsElem = document.getElementById('results-section');
          if (resultsElem) {
            resultsElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } catch (err: any) {
      console.error('Fetch recommendations error:', err);
      setErrorMessage(err.message || 'Could not connect to Sip Buddy. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial trigger
  const handleFindMySip = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecommendations({});
  };

  // Handle refinement selection
  const handleApplyRefinement = (refinement: string) => {
    fetchRecommendations({ additionalRefinement: refinement });
  };

  // Reset / Start Over
  const handleStartOver = () => {
    setUserQuery('');
    setSelectedChips([]);
    setDrinkType('Any');
    setAlcoholPreference('Regular');
    setAvoidIngredients('');
    setActiveRefinements([]);
    setPayload(null);
    setPreviousDrinkNames([]);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#360E17] flex flex-col font-sans selection:bg-[#F3C68F]">
      {/* App Header */}
      <Header
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onReset={handleStartOver}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Intro Hero Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5EDE1] text-[#7A4B3F] border border-[#E8DEC9]">
            <HeartHandshake className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>No jargon. No pressure. Just good drinks.</span>
          </div>

          <h1 className="font-serif-title font-extrabold text-3xl sm:text-4xl text-[#360E17] tracking-tight">
            Bar-menu panic? I’ve got you.
          </h1>
          <p className="text-sm sm:text-base text-[#613D34] max-w-md mx-auto leading-relaxed">
            Tell me what sounds good. I’ll help you order.
          </p>
        </div>

        {/* Form Input Card */}
        <section className="rounded-3xl border border-[#E8DEC9] bg-[#FFFDF9] p-5 sm:p-7 shadow-sm space-y-5">
          <form onSubmit={handleFindMySip} className="space-y-5">
            {/* Free Text Input */}
            <div>
              <label htmlFor="drink-craving" className="block text-xs font-bold uppercase tracking-wider text-[#734A42] mb-1.5">
                What are you in the mood for?
              </label>
              <div className="relative">
                <input
                  id="drink-craving"
                  type="text"
                  value={userQuery}
                  onChange={e => setUserQuery(e.target.value)}
                  placeholder="Something fruity but not too sweet…"
                  className="w-full min-h-[48px] px-4 py-3 rounded-2xl text-sm sm:text-base bg-[#FCFAF5] border border-[#E8DEC9] text-[#360E17] placeholder-[#9E837B] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 focus:border-[#C2410C] transition-all"
                />
              </div>
            </div>

            {/* Flavor Chips */}
            <FlavorChips
              selectedChips={selectedChips}
              onToggleChip={handleToggleChip}
            />

            {/* Compact Optional Controls */}
            <DrinkControls
              drinkType={drinkType}
              onChangeDrinkType={setDrinkType}
              alcoholPreference={alcoholPreference}
              onChangeAlcoholPreference={setAlcoholPreference}
              avoidIngredients={avoidIngredients}
              onChangeAvoidIngredients={setAvoidIngredients}
            />

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[52px] px-6 py-3.5 rounded-2xl text-base font-bold bg-[#360E17] text-[#FAF6EE] hover:bg-[#4A1521] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#F59E0B]" />
                    <span>Mixing recommendations...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                    <span>Find my sip</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Loading Indicator Animation */}
        {isLoading && (
          <div className="rounded-3xl border border-[#E8DEC9] bg-[#FFFDF9] p-8 text-center space-y-4 shadow-sm animate-pulse">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAF5EB] border border-[#EADCC8] flex items-center justify-center text-[#C2410C]">
              <Wine className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-lg text-[#360E17]">
                Consulting the reference shelf...
              </h3>
              <p className="text-xs sm:text-sm text-[#734A42] mt-1 max-w-sm mx-auto">
                Filtering out exclusions, matching your flavor notes, and preparing what to say at the bar.
              </p>
            </div>
          </div>
        )}

        {/* Error State with Retry Button */}
        {errorMessage && !isLoading && (
          <div className="rounded-3xl border border-[#FCA5A5] bg-[#FEF2F2] p-5 sm:p-6 space-y-3 text-[#991B1B]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
              <h4 className="font-bold text-sm sm:text-base">Unable to get drink picks</h4>
            </div>
            <p className="text-xs sm:text-sm text-[#7F1D1D] leading-relaxed">
              {errorMessage}
            </p>
            <div className="pt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchRecommendations({})}
                className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors cursor-pointer"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={handleStartOver}
                className="text-xs font-semibold text-[#7F1D1D] hover:underline"
              >
                Reset inputs
              </button>
            </div>
          </div>
        )}

        {/* Clarification Flow (Single Follow-Up Question) */}
        {!isLoading && payload?.responseType === 'question' && payload.questionData && (
          <ClarificationCard
            question={payload.questionData.question}
            options={payload.questionData.options}
            assumptionNotice={payload.questionData.assumptionNotice}
            isLoading={isLoading}
            onSelectOption={option => fetchRecommendations({ clarificationAnswer: option })}
            onSkip={() => fetchRecommendations({ skipClarification: true })}
          />
        )}

        {/* Informational Response (Availability / Menu questions) */}
        {!isLoading && payload?.responseType === 'informational' && payload.informationalData && (
          <InformationalCard
            data={payload.informationalData}
            onStartOver={handleStartOver}
            onAskForRecommendation={() => {
              fetchRecommendations({ customQuery: 'Recommend something refreshing and popular here' });
            }}
          />
        )}

        {/* Recommendation Results Section */}
        {!isLoading && payload?.responseType === 'recommendations' && payload.recommendationData && (
          <section id="results-section" className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* Header summary badge */}
            <div className="flex items-center justify-between pb-1">
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
                    Your Personalized Bar Lineup
                  </span>
                  {activeRefinements.map(r => (
                    <span key={r} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E05D38] text-white">
                      Refined: {r}
                    </span>
                  ))}
                </div>
                <h2 className="font-serif-title font-bold text-2xl text-[#360E17]">
                  Ready to order
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsHowItWorksOpen(true)}
                className="text-xs text-[#8C6961] hover:text-[#360E17] underline decoration-[#D9C4A6]"
              >
                View retrieval audit
              </button>
            </div>

            {/* Availability Notice Banner if user asked about bar stock / availability */}
            {payload.recommendationData.availabilityNotice && (
              <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] flex items-start gap-3 shadow-xs">
                <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm leading-relaxed">
                  <strong className="font-bold text-[#78350F] block mb-0.5">
                    Bar Inventory Notice
                  </strong>
                  {payload.recommendationData.availabilityNotice}
                </div>
              </div>
            )}

            {/* Featured Best Match Card */}
            {payload.recommendationData.bestMatch && (
              <DrinkCard
                drink={payload.recommendationData.bestMatch}
                isFeatured={true}
              />
            )}

            {/* Alternatives Grid */}
            {payload.recommendationData.alternatives && payload.recommendationData.alternatives.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-title font-bold text-lg text-[#360E17]">
                    Two Great Alternatives
                  </h3>
                  <span className="text-[11px] text-[#8C6961]">Meaningfully different styles</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {payload.recommendationData.alternatives.map((alt, idx) => (
                    <DrinkCard key={idx} drink={alt} isFeatured={false} />
                  ))}
                </div>
              </div>
            )}

            {/* Buddy's Warm Note */}
            {payload.recommendationData.buddyNote && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF9EE] border border-[#F1E0C4] flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#360E17] text-[#F59E0B] flex items-center justify-center shrink-0 mt-0.5">
                  <Wine className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-[#5B3931] leading-relaxed">
                  <strong className="text-[#360E17] font-semibold block mb-0.5">
                    Sip Buddy's Bar Wisdom
                  </strong>
                  {payload.recommendationData.buddyNote}
                </div>
              </div>
            )}

            {/* Refinement and Start Over Bar */}
            <RefinementBar
              activeRefinements={activeRefinements}
              onApplyRefinement={handleApplyRefinement}
              onStartOver={handleStartOver}
              isLoading={isLoading}
            />
          </section>
        )}

        {/* Empty Result Notification */}
        {!isLoading && payload?.responseType === 'empty' && (
          <div className="rounded-3xl border border-[#E8DEC9] bg-[#FFFDF9] p-6 text-center space-y-4">
            <h3 className="font-serif-title font-bold text-xl text-[#360E17]">
              No exact match in our reference collection
            </h3>
            <p className="text-xs sm:text-sm text-[#734A42] max-w-md mx-auto">
              {payload.recommendationData?.buddyNote ||
                'Your current combination of exclusions and drink filters left no safe matches in our 24 bar classics. Try relaxing your restrictions!'}
            </p>
            <button
              type="button"
              onClick={handleStartOver}
              className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-bold bg-[#360E17] text-white hover:bg-[#4A1521]"
            >
              Start over with new preferences
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E8DEC9] py-6 px-4 text-center text-xs text-[#8C6961]">
        <div className="max-w-md mx-auto space-y-1">
          <p>
            Sip Buddy helps you navigate bar menus with confidence. Drink responsibly.
          </p>
          <p className="text-[11px] text-[#A89088]">
            Never drink and drive. Zero-proof choices are always celebrated.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        transparency={payload?.transparency}
      />

      <CatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
      />
    </div>
  );
}
