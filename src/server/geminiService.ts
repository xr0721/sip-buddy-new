/**
 * Gemini Service for Sip Buddy
 * 
 * Handles server-side drink recommendations using gemini-3.1-flash-lite,
 * with instant-path availability guardrails, bounded request timeouts,
 * request cancellation, and clearly labeled reference-shelf fallback.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { SIP_BUDDY_SYSTEM_INSTRUCTIONS } from '../config/sipBuddyInstructions.js';
import { retrieveCandidateDrinks, RetrievalInput } from '../data/drinkRetrieval.js';
import { DrinkReference } from '../data/drinkReferences.js';
import { InformationalData, DrinkCardData, TransparencyData } from '../types.js';

export interface RecommendRequest extends RetrievalInput {
  clarificationAnswer?: string;
  skipClarification?: boolean;
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

// Bounded timeout for model requests (8.5 seconds)
const MODEL_TIMEOUT_MS = 8500;

export async function generateSipRecommendations(reqBody: RecommendRequest): Promise<RecommendationPayload> {
  const startTime = Date.now();
  const userQ = (reqBody.userQuery || '').toLowerCase().trim();

  // Pattern detection for availability inquiries
  const isAvailabilityQuery =
    /\b(do they|does this bar|can you check if|is (this|that|it|anything)?.* on (their|the) menu|do they (definitely|actually|usually)? (have|serve|carry)|are they serving|do you know if (they|this bar) (have|has|serve)|tell me if (this bar|they) (has|have|serves?)|is there .* on the menu|on their menu|on the menu)\b/i.test(userQ);

  const isRecommendationQuery =
    /\b(recommend|recommendation|suggest|suggestion|pick|what should i|choose|give me|find my sip|find me)\b/i.test(userQ) ||
    (reqBody.selectedFlavorChips && reqBody.selectedFlavorChips.length > 0) ||
    (reqBody.refinements && reqBody.refinements.length > 0);

  // 1. FAST-PATH: Pure availability / menu inquiry
  // Return informational response immediately without calling Gemini or retrieving drinks.
  if (isAvailabilityQuery && !isRecommendationQuery) {
    let answer = '';
    let suggestedInquiry = '';

    if (userQ.includes('gin') && userQ.includes('tonic')) {
      answer = "I can’t confirm what this bar serves because I don’t have its menu or stock information. You can check the menu or ask: 'Do you serve gin and tonics?'";
      suggestedInquiry = "Do you serve gin and tonics?";
    } else if (userQ.includes('menu')) {
      answer = "I can’t confirm whether this is on their menu because no menu was supplied to me, and I don't have access to this bar's specific menu or inventory.";
      suggestedInquiry = "Is this on your menu today?";
    } else {
      answer = "I can’t confirm what this bar serves because I don’t have its menu or stock information. You can check the menu or ask the bartender directly.";
      suggestedInquiry = "Do you have this available today?";
    }

    const durationMs = Date.now() - startTime;
    return {
      responseType: 'informational',
      informationalData: {
        title: 'Availability & Menu Check',
        answer,
        suggestedInquiry,
        buddyNote: "Every bar has its own unique inventory! Asking the bartender directly is always your best bet.",
      },
      transparency: {
        userPreferences: {
          query: reqBody.userQuery || '(none provided)',
          flavorChips: reqBody.selectedFlavorChips || [],
          drinkType: reqBody.drinkType || 'Any',
          alcoholPreference: reqBody.alcoholPreference || 'Regular',
          avoidIngredients: reqBody.avoidIngredients || 'None',
          refinements: reqBody.refinements || [],
        },
        deterministicRulesApplied: ['Fast-path: direct availability check (bypassed LLM & retrieval)'],
        retrievedCandidates: [],
        modelUsed: 'instant-informational-guard',
        durationMs,
      },
    };
  }

  // 2. MIXED OR RECOMMENDATION REQUESTS
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set on the server.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Step 1: Deterministic retrieval
  const retrievalResult = retrieveCandidateDrinks(reqBody);
  const candidates = retrievalResult.candidates;

  const transparency: TransparencyData = {
    userPreferences: {
      query: reqBody.userQuery || '(none provided)',
      flavorChips: reqBody.selectedFlavorChips || [],
      drinkType: reqBody.drinkType || 'Any',
      alcoholPreference: reqBody.alcoholPreference || 'Regular',
      avoidIngredients: reqBody.avoidIngredients || 'None',
      refinements: reqBody.refinements || [],
    },
    deterministicRulesApplied: retrievalResult.rulesApplied,
    retrievedCandidates: candidates.map(c => ({
      name: c.name,
      category: c.category,
      alcoholCategory: c.alcoholCategory,
    })),
    modelUsed: 'gemini-3.1-flash-lite',
  };

  // If no drinks passed the deterministic constraints
  if (candidates.length === 0) {
    transparency.durationMs = Date.now() - startTime;
    return {
      responseType: 'empty',
      recommendationData: {
        bestMatch: {
          name: 'No exact match in our reference collection',
          flavorSummary: 'Your requested combination of exclusions and drink types left no matching drinks in our curated reference guide.',
          typicalIngredients: ['None available'],
          matchReason: 'Our catalog has ~24 classic bar standards, but none fit all these specific restrictions at once.',
          alcoholCategory: reqBody.alcoholPreference === 'No alcohol' ? 'alcohol-free' : 'lower-alcohol option',
          orderingSentence: 'Hi, I am looking for something customized with your bartender recommendations today!',
          barCautionNotice: 'Try removing an ingredient exclusion or relaxing your category filter to see options.',
        },
        alternatives: [],
        buddyNote: 'We want to be totally honest: Sip Buddy only recommends drinks from its reference catalog and won’t invent fake recipes that compromise your restrictions. Tap "Start Over" to adjust!',
      },
      transparency,
    };
  }

  // Format candidates for prompt
  const candidateText = candidates
    .map((c, i) => `${i + 1}. ${c.name} (${c.category}, ${c.alcoholCategory})
   - Flavor: ${c.flavorDescription}
   - Ingredients: ${c.typicalIngredients.join(', ')}
   - Sweetness profile: ${c.sweetnessLevel}
   - Standard ordering: "${c.defaultOrderingSentence}"
   - Creator favorite: ${c.creatorFavorite ? 'Yes' : 'No'}`)
    .join('\n\n');

  // Build user prompt
  const prompt = `
USER PREFERENCES:
- Free text request: "${reqBody.userQuery || 'Not specified'}"
- Flavor chips selected: ${reqBody.selectedFlavorChips?.length ? reqBody.selectedFlavorChips.join(', ') : 'None'}
- Drink type: ${reqBody.drinkType || 'Any'}
- Alcohol preference: ${reqBody.alcoholPreference || 'Regular'}
- Ingredients to avoid: ${reqBody.avoidIngredients || 'None'}
- Active refinements: ${reqBody.refinements?.length ? reqBody.refinements.join(', ') : 'None'}
- Previous recommendations shown: ${reqBody.previousRecommendations?.length ? reqBody.previousRecommendations.join(', ') : 'None'}
- User clarification response: ${reqBody.clarificationAnswer || (reqBody.skipClarification ? 'User chose to skip clarification and wants recommendations immediately' : 'None')}

RETRIEVED CANDIDATE DRINKS (FROM OUR REFERENCE COLLECTION):
${candidateText}

INSTRUCTIONS:
1. INTENT & AVAILABILITY HANDLING:
   - If this is a hybrid request (asking for recommendations AND asking if this bar has it, e.g. "Recommend a gin drink and tell me if this bar has it"):
     * Set responseType = "recommendations".
     * In recommendationData, populate availabilityNotice with an explicit statement: "I can't confirm whether this bar has this in stock because I don't have access to their menu or inventory. Always check with your bartender!"
     * In orderingSentence, frame it politely as an availability inquiry (e.g. "Hi, do you have the ingredients to make a Gin & Tonic?").
   - Otherwise, provide normal recommendations from the retrieved candidates.

2. CLARIFICATION RULE:
   - If user clarification response is "None" AND the request is genuinely too vague to make any reasonable recommendation (e.g. no text, no flavor chips, and no filters at all), you MAY ask at most ONE brief follow-up question with 2 to 4 tappable options.
   - Otherwise, or if user answered or skipped clarification, or if there is enough information (even one flavor chip or keyword is enough!), DO NOT ask a question. Immediately provide recommendations from the retrieved candidates.

3. REFINEMENT & NO-REPEAT RULE:
   - If "Previous recommendations shown" contains drink names (e.g. the user tapped "More refreshing", "Less sweet", or "Something different"), you MUST NOT choose any of those previous drinks as the new "bestMatch". The user explicitly requested a change because the previous drink did not satisfy them.
   - Choose a DIFFERENT, NEW drink from the candidates list as the new "bestMatch" that specifically fulfills the requested refinement (for example, if "More refreshing", select a lighter, bubbly, or crisper option).
   - In the "matchReason" for the bestMatch, explicitly explain how this new choice provides the requested refinement compared to earlier options while preserving all restrictions (e.g. fruity, not too sweet, zero tequila).

4. RECOMMENDATIONS FORMAT (when responseType is "recommendations"):
   - Select ONE "bestMatch" and TWO distinct "alternatives" from the candidates list.
   - For each drink:
     * name: The drink's recognizable name.
     * flavorSummary: Exactly ONE plain-language, jargon-free sentence explaining what it tastes like.
     * typicalIngredients: List of 3-5 main ingredients.
     * matchReason: Explain why it matches this user's specific request.
     * alcoholCategory: Exactly one of "contains alcohol", "lower-alcohol option", or "alcohol-free".
     * orderingSentence: A short, natural sentence the user can say to the bartender (e.g. "Hi, could I please get an Espresso Martini?").
   - buddyNote: 1-2 friendly sentences offering a helpful bar tip or cheering them on.
`.trim();

  const schemaConfig = {
    systemInstruction: SIP_BUDDY_SYSTEM_INSTRUCTIONS,
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        responseType: {
          type: Type.STRING,
          description: 'One of "recommendations" or "question"',
        },
        questionData: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            assumptionNotice: { type: Type.STRING },
          },
        },
        recommendationData: {
          type: Type.OBJECT,
          properties: {
            availabilityNotice: {
              type: Type.STRING,
              description: 'Clear statement that availability at this specific bar cannot be confirmed because Sip Buddy has no menu or inventory access.',
            },
            bestMatch: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                flavorSummary: { type: Type.STRING },
                typicalIngredients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                matchReason: { type: Type.STRING },
                alcoholCategory: { type: Type.STRING },
                orderingSentence: { type: Type.STRING },
                barCautionNotice: { type: Type.STRING },
              },
              required: ['name', 'flavorSummary', 'typicalIngredients', 'matchReason', 'alcoholCategory', 'orderingSentence'],
            },
            alternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  flavorSummary: { type: Type.STRING },
                  typicalIngredients: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  matchReason: { type: Type.STRING },
                  alcoholCategory: { type: Type.STRING },
                  orderingSentence: { type: Type.STRING },
                },
                required: ['name', 'flavorSummary', 'typicalIngredients', 'matchReason', 'alcoholCategory', 'orderingSentence'],
              },
            },
            buddyNote: { type: Type.STRING },
          },
          required: ['bestMatch', 'alternatives', 'buddyNote'],
        },
      },
      required: ['responseType'],
    },
  };

  let rawText = '{}';
  let usedModel = 'gemini-3.1-flash-lite';

  // 3 & 4. Primary model: gemini-3.1-flash-lite without reasoning settings + bounded timeout with AbortController
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort(new Error(`Model call timed out after ${MODEL_TIMEOUT_MS}ms`));
  }, MODEL_TIMEOUT_MS);

  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        ...schemaConfig,
        abortSignal: abortController.signal,
      },
    });
    rawText = res.text || '{}';
    usedModel = 'gemini-3.1-flash-lite';
  } catch (err: any) {
    const errMsg = String(err?.message || err || '');
    const errStatus = String(err?.status || '');
    const isHighTraffic =
      errMsg.includes('503') ||
      errMsg.includes('high demand') ||
      errMsg.includes('UNAVAILABLE') ||
      errStatus === 'UNAVAILABLE';
    const isTimeout =
      err?.name === 'AbortError' ||
      errMsg.toLowerCase().includes('timeout') ||
      errMsg.toLowerCase().includes('aborted');

    let fallbackLabel = 'reference-catalog-fallback';
    let buddyFallbackNote = '';

    if (isHighTraffic) {
      fallbackLabel = 'reference-catalog-fallback (AI high demand)';
      buddyFallbackNote = 'Live AI demand was temporarily high, but our reference collection has you covered with these trusted classics!';
    } else if (isTimeout) {
      fallbackLabel = 'reference-catalog-fallback (request timeout)';
      buddyFallbackNote = 'AI recommendation took longer than expected to respond, but our reference collection has you covered with these trusted classics!';
    } else {
      fallbackLabel = 'reference-catalog-fallback (direct catalog)';
      buddyFallbackNote = 'Our reference shelf selected these trusted drink standards directly from our bar collection!';
    }

    console.warn(`Primary model error handled (${fallbackLabel}):`, errMsg);

    const topPick = candidates[0];
    const alt1 = candidates[1] || candidates[0];
    const alt2 = candidates[2] || candidates[0];
    usedModel = fallbackLabel;

    rawText = JSON.stringify({
      responseType: 'recommendations',
      recommendationData: {
        bestMatch: {
          name: topPick.name,
          flavorSummary: topPick.flavorDescription,
          typicalIngredients: topPick.typicalIngredients,
          matchReason: `[Reference Shelf Selection] A classic matching your ${topPick.flavorTags.slice(0, 2).join(' & ')} profile.`,
          alcoholCategory: topPick.alcoholCategory,
          orderingSentence: topPick.defaultOrderingSentence,
        },
        alternatives: [
          {
            name: alt1.name,
            flavorSummary: alt1.flavorDescription,
            typicalIngredients: alt1.typicalIngredients,
            matchReason: `[Reference Shelf Selection] A crisp alternative featuring ${alt1.flavorTags.slice(0, 2).join(' & ')} notes.`,
            alcoholCategory: alt1.alcoholCategory,
            orderingSentence: alt1.defaultOrderingSentence,
          },
          {
            name: alt2.name,
            flavorSummary: alt2.flavorDescription,
            typicalIngredients: alt2.typicalIngredients,
            matchReason: `[Reference Shelf Selection] Another great option with a distinct ${alt2.sweetnessLevel} profile.`,
            alcoholCategory: alt2.alcoholCategory,
            orderingSentence: alt2.defaultOrderingSentence,
          },
        ],
        buddyNote: buddyFallbackNote,
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }

  transparency.modelUsed = usedModel;
  transparency.durationMs = Date.now() - startTime;

  const parsed = JSON.parse(rawText);

  // If hybrid query (asks for recommendation AND availability check)
  if (isAvailabilityQuery && isRecommendationQuery && parsed.recommendationData) {
    if (!parsed.recommendationData.availabilityNotice) {
      parsed.recommendationData.availabilityNotice =
        "I can't confirm whether this bar has this in stock because I don't have access to their menu or inventory. Always check with your bartender!";
    }
  } else if (!isAvailabilityQuery && parsed.recommendationData?.availabilityNotice) {
    // Pure recommendation requests should not display an availability warning banner
    delete parsed.recommendationData.availabilityNotice;
  }

  // If the model erroneously chose 'question' when skipClarification is true or if user answered, enforce recommendations fallback
  if (parsed.responseType === 'question' && (reqBody.skipClarification || reqBody.clarificationAnswer)) {
    parsed.responseType = 'recommendations';
  }

  // Ensure alcoholCategory is valid and alternatives are populated with 2 items
  if (parsed.recommendationData?.bestMatch) {
    parsed.recommendationData.bestMatch.alcoholCategory = normalizeAlcoholCategory(
      parsed.recommendationData.bestMatch.alcoholCategory,
      parsed.recommendationData.bestMatch.name
    );

    if (!parsed.recommendationData.alternatives) {
      parsed.recommendationData.alternatives = [];
    }

    // Ensure we have 2 distinct alternatives from candidate drinks
    if (parsed.recommendationData.alternatives.length < 2) {
      const existingNames = new Set([
        parsed.recommendationData.bestMatch.name.toLowerCase(),
        ...parsed.recommendationData.alternatives.map((a: DrinkCardData) => a.name.toLowerCase()),
      ]);

      const remainingCandidates = candidates.filter(
        c => !existingNames.has(c.name.toLowerCase())
      );

      for (const extra of remainingCandidates) {
        if (parsed.recommendationData.alternatives.length >= 2) break;
        parsed.recommendationData.alternatives.push({
          name: extra.name,
          flavorSummary: extra.flavorDescription,
          typicalIngredients: extra.typicalIngredients,
          matchReason: `A solid ${extra.sweetnessLevel} alternative matching your general flavor criteria.`,
          alcoholCategory: extra.alcoholCategory,
          orderingSentence: extra.defaultOrderingSentence,
        });
      }
    }

    parsed.recommendationData.alternatives.forEach((alt: DrinkCardData) => {
      alt.alcoholCategory = normalizeAlcoholCategory(alt.alcoholCategory, alt.name);
    });
  }

  return {
    responseType: parsed.responseType || 'recommendations',
    questionData: parsed.questionData,
    recommendationData: parsed.recommendationData,
    transparency,
  };
}

function normalizeAlcoholCategory(cat: string, drinkName: string): 'contains alcohol' | 'lower-alcohol option' | 'alcohol-free' {
  if (cat === 'alcohol-free' || cat === 'lower-alcohol option' || cat === 'contains alcohol') {
    return cat;
  }
  const lower = (cat || '').toLowerCase();
  if (lower.includes('free') || lower.includes('zero') || lower.includes('non-alc')) {
    return 'alcohol-free';
  }
  if (lower.includes('lower') || lower.includes('low') || lower.includes('spritz')) {
    return 'lower-alcohol option';
  }
  return 'contains alcohol';
}
