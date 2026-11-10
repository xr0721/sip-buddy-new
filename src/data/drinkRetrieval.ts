/**
 * Drink Retrieval Engine (Deterministic Step)
 * 
 * Filters and scores items from DRINK_REFERENCES based on user inputs,
 * tags, alcohol requirements, exclusions, and active refinements.
 */

import { DRINK_REFERENCES, DrinkReference } from './drinkReferences.js';

export interface RetrievalInput {
  userQuery?: string;
  selectedFlavorChips?: string[];
  drinkType?: 'Any' | 'Cocktail' | 'Wine' | 'Beer' | 'Zero-proof';
  alcoholPreference?: 'Regular' | 'Lower alcohol' | 'No alcohol';
  avoidIngredients?: string;
  refinements?: string[];
  previousRecommendations?: string[];
}

export interface RetrievalResult {
  candidates: DrinkReference[];
  rulesApplied: string[];
  explanation: string;
}

export function retrieveCandidateDrinks(input: RetrievalInput): RetrievalResult {
  const {
    userQuery = '',
    selectedFlavorChips = [],
    drinkType = 'Any',
    alcoholPreference = 'Regular',
    avoidIngredients = '',
    refinements = [],
    previousRecommendations = [],
  } = input;

  const rulesApplied: string[] = [];
  const normalizedQuery = userQuery.toLowerCase().trim();

  // Extract avoid tokens from both the explicit avoid field and free-text negations
  const avoidTokens = avoidIngredients
    .toLowerCase()
    .split(/[,;\s]+/)
    .map(t => t.trim())
    .filter(t => t.length > 2);

  // Parse natural-language negative phrases for ingredients from free-text (e.g. "no tequila", "no dairy", "without gin")
  const negativeRegex = /\b(?:no|not|without|avoid|hold the|hate)\s+([a-z]+)/gi;
  const nonIngredientWords = ['too', 'very', 'super', 'overly', 'much', 'so', 'a', 'an', 'the', 'sweet', 'bitter', 'sour', 'dry', 'strong', 'heavy', 'light'];
  let match: RegExpExecArray | null;
  while ((match = negativeRegex.exec(normalizedQuery)) !== null) {
    const token = match[1].toLowerCase();
    if (token.length > 2 && !nonIngredientWords.includes(token) && !avoidTokens.includes(token)) {
      avoidTokens.push(token);
    }
  }

  // Explicit check for tequila negation or exclusion
  const explicitlyAvoidsTequila =
    avoidTokens.includes('tequila') ||
    /\b(?:no|not|without|avoid|hold the)\s+tequila\b/i.test(normalizedQuery) ||
    /\btequila[-\s]*free\b/i.test(normalizedQuery);

  if (explicitlyAvoidsTequila && !avoidTokens.includes('tequila')) {
    avoidTokens.push('tequila');
  }

  // Only consider tequila desired if mentioned positively and not negated
  const wantsTequila =
    !explicitlyAvoidsTequila &&
    /\b(?:tequila|paloma|margarita)\b/i.test(normalizedQuery) &&
    !/\b(?:no|not|without|avoid|hold the)\s+(?:tequila|paloma|margarita)\b/i.test(normalizedQuery);

  // Check if we should filter out previous recommendations
  const isRefining = refinements.length > 0 && previousRecommendations.length > 0;
  const normalizedPrev = previousRecommendations.map(p => p.toLowerCase().trim());

  // Step 1: Deterministic Filtering
  let pool = DRINK_REFERENCES.filter(drink => {
    // 1. Alcohol preference filter
    if (alcoholPreference === 'No alcohol' || drinkType === 'Zero-proof') {
      if (drink.alcoholCategory !== 'alcohol-free') {
        return false;
      }
    } else if (alcoholPreference === 'Lower alcohol') {
      // Must be lower-alcohol or alcohol-free
      if (drink.alcoholCategory === 'contains alcohol') {
        return false;
      }
    }

    // 2. Drink type category filter
    if (drinkType !== 'Any') {
      if (drinkType === 'Zero-proof') {
        if (drink.category !== 'zero-proof' && drink.alcoholCategory !== 'alcohol-free') {
          return false;
        }
      } else if (drinkType.toLowerCase() !== drink.category) {
        return false;
      }
    }

    // 3. Avoid ingredients filter
    for (const token of avoidTokens) {
      const inName = drink.name.toLowerCase().includes(token);
      const inSpirit = drink.baseSpirit?.toLowerCase().includes(token);
      const inIngredients = drink.typicalIngredients.some(ing => ing.toLowerCase().includes(token));
      const inTags = drink.flavorTags.some(tag => tag.toLowerCase().includes(token));

      if (inName || inSpirit || inIngredients || inTags) {
        return false;
      }
    }

    // 4. Default tequila exclusion rule
    if (drink.baseSpirit === 'tequila' && !wantsTequila) {
      return false;
    }

    return true;
  });

  // Track applied rules for transparency
  if (alcoholPreference === 'No alcohol' || drinkType === 'Zero-proof') {
    rulesApplied.push('Strictly filtered to zero-proof / alcohol-free drinks');
  } else if (alcoholPreference === 'Lower alcohol') {
    rulesApplied.push('Limited to lower-alcohol spritzes, sangrias, and zero-proof styles');
  }

  if (drinkType !== 'Any') {
    rulesApplied.push(`Restricted category to ${drinkType}`);
  }

  if (avoidTokens.length > 0) {
    rulesApplied.push(`Excluded drinks containing: ${avoidTokens.join(', ')}`);
  }

  if (!wantsTequila) {
    rulesApplied.push('Protected default: tequila excluded unless explicitly requested');
  }

  // Refinement filter: if user requested a refinement and we have enough unseen drinks,
  // strictly exclude previous recommendations so a fresh, different best match surfaces!
  if (isRefining) {
    const unseenPool = pool.filter(drink => !normalizedPrev.includes(drink.name.toLowerCase()));
    if (unseenPool.length >= 3) {
      pool = unseenPool;
      rulesApplied.push(`Refined selection: excluded previously shown drinks (${previousRecommendations.slice(0, 3).join(', ')})`);
    } else {
      rulesApplied.push('Refined selection: prioritized unshown drinks over previously viewed drinks');
    }
  }

  // Step 2: Deterministic Scoring
  const scored = pool.map(drink => {
    let score = 0;
    const matchDetails: string[] = [];
    const isPreviouslySeen = normalizedPrev.includes(drink.name.toLowerCase());

    // Flavor chips matching
    selectedFlavorChips.forEach(chip => {
      const lowerChip = chip.toLowerCase();
      if (lowerChip === 'surprise me') {
        score += 1;
      } else if (drink.flavorTags.includes(lowerChip)) {
        score += 4;
        matchDetails.push(`Matches flavor tag "${chip}"`);
      }
    });

    // Query text token matching (ignoring negative words)
    if (normalizedQuery) {
      const stopWords = ['something', 'with', 'from', 'have', 'that', 'this', 'drink', 'please', 'no', 'not', 'without', 'avoid'];
      const words = normalizedQuery
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.includes(w) && !avoidTokens.includes(w));

      words.forEach(word => {
        if (drink.name.toLowerCase().includes(word)) {
          score += 3;
        } else if (drink.flavorTags.includes(word)) {
          score += 2;
        } else if (drink.typicalIngredients.some(ing => ing.toLowerCase().includes(word))) {
          score += 2;
        }
      });
    }

    // Refinement rules
    if (refinements.includes('Less sweet')) {
      if (drink.sweetnessLevel === 'dry' || drink.sweetnessLevel === 'bitter') {
        score += 6;
      } else if (drink.sweetnessLevel === 'sweet') {
        score -= 8;
      }
    }

    if (refinements.includes('More refreshing')) {
      if (drink.flavorTags.includes('refreshing')) {
        score += 5;
      }
      if (drink.flavorTags.includes('bubbly') || drink.flavorTags.includes('crisp')) {
        score += 4;
      }
      if (drink.sweetnessLevel === 'dry' || drink.sweetnessLevel === 'balanced') {
        score += 2;
      }
    }

    // Heavy penalty for previously seen drinks during any refinement if they were not completely filtered
    if (isRefining && isPreviouslySeen) {
      score -= 30;
    }

    // Creator favorite light influence if user didn't have strict constraints
    if (drink.creatorFavorite) {
      score += 0.5;
    }

    return { drink, score, matchDetails };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Take top 6 candidates (or all if fewer) to give Gemini rich curated choices
  const candidates = scored.slice(0, 6).map(s => s.drink);

  const explanation = candidates.length > 0
    ? `Retrieved ${candidates.length} candidate drinks based on deterministic rules and flavor relevance.`
    : `No matching drinks found in reference catalog matching all strict constraints.`;

  return {
    candidates,
    rulesApplied,
    explanation,
  };
}
