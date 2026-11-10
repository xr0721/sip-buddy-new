export type DrinkCategory = 'cocktail' | 'wine' | 'beer' | 'zero-proof';
export type AlcoholCategory = 'contains alcohol' | 'lower-alcohol option' | 'alcohol-free';
export type DrinkTypeFilter = 'Any' | 'Cocktail' | 'Wine' | 'Beer' | 'Zero-proof';
export type AlcoholPreferenceFilter = 'Regular' | 'Lower alcohol' | 'No alcohol';

export interface DrinkCardData {
  name: string;
  flavorSummary: string;
  typicalIngredients: string[];
  matchReason: string;
  alcoholCategory: AlcoholCategory;
  orderingSentence: string;
  barCautionNotice?: string;
}

export interface TransparencyData {
  userPreferences: {
    query: string;
    flavorChips: string[];
    drinkType: string;
    alcoholPreference: string;
    avoidIngredients: string;
    refinements: string[];
  };
  deterministicRulesApplied: string[];
  retrievedCandidates: Array<{
    name: string;
    category: string;
    alcoholCategory: string;
  }>;
  modelUsed: string;
  durationMs?: number;
}

export interface InformationalData {
  title?: string;
  answer: string;
  suggestedInquiry?: string;
  buddyNote?: string;
}

export interface RecommendationPayload {
  responseType: 'recommendations' | 'question' | 'empty' | 'informational';
  informationalData?: InformationalData;
  questionData?: {
    question: string;
    options: string[];
    assumptionNotice?: string;
  };
  recommendationData?: {
    availabilityNotice?: string;
    bestMatch: DrinkCardData;
    alternatives: DrinkCardData[];
    buddyNote: string;
  };
  transparency: TransparencyData;
}
