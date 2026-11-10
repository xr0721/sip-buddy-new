import React from 'react';

interface DrinkIconProps {
  name: string;
  category?: string;
  className?: string;
}

export const DrinkIcon: React.FC<DrinkIconProps> = ({ name, category, className = 'w-6 h-6' }) => {
  const lowerName = name.toLowerCase();
  const lowerCat = (category || '').toLowerCase();

  // Espresso / Coffee
  if (lowerName.includes('espresso') || lowerName.includes('coffee') || lowerName.includes('stout')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 44 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    );
  }

  // Wine / Sangria / Moscato
  if (lowerCat === 'wine' || lowerName.includes('wine') || lowerName.includes('sangria') || lowerName.includes('moscato') || lowerName.includes('sauvignon') || lowerName.includes('cabernet') || lowerName.includes('rosé')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 22h8" />
        <path d="M12 15v7" />
        <path d="M12 15a5 5 0 0 0 5-5c0-4-2-7-5-7s-5 3-5 7a5 5 0 0 0 5 5z" />
        <path d="M7 10h10" strokeDasharray="1 1" />
      </svg>
    );
  }

  // Beer / Pilsner / IPA / Witbier
  if (lowerCat === 'beer' || lowerName.includes('beer') || lowerName.includes('ipa') || lowerName.includes('pilsner') || lowerName.includes('wheat')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 11h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1" />
        <path d="M9 2v2" />
        <path d="M13 2v2" />
        <path d="M5 6h12v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6z" />
        <path d="M5 10h12" />
      </svg>
    );
  }

  // Spritz / Sparkling / French 75
  if (lowerName.includes('spritz') || lowerName.includes('prosecco') || lowerName.includes('cava') || lowerName.includes('sparkl') || lowerName.includes('french 75')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 15v7" />
        <path d="M9 22h6" />
        <path d="M8 3h8l-1.5 9a2.5 2.5 0 0 1-2.5 2.5h0a2.5 2.5 0 0 1-2.5-2.5L8 3z" />
        <circle cx="11" cy="7" r="0.7" fill="currentColor" />
        <circle cx="13" cy="9" r="0.7" fill="currentColor" />
      </svg>
    );
  }

  // Zero-Proof / Mocktail / Botanical / Mule
  if (lowerCat === 'zero-proof' || lowerName.includes('zero') || lowerName.includes('mocktail') || lowerName.includes('cucumber') || lowerName.includes('mule')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 4h14l-1.5 16a2 2 0 0 1-2 1.8H8.5a2 2 0 0 1-2-1.8L5 4z" />
        <path d="M5 8h14" />
        <line x1="14" y1="2" x2="16" y2="7" />
        <circle cx="10" cy="13" r="1.5" />
      </svg>
    );
  }

  // Classic Cocktail / Martini / Sour / Old Fashioned coupe
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 22 8 0" />
      <path d="M12 11v11" />
      <path d="m19 3-7 8-7-8Z" />
      <circle cx="12" cy="5" r="1" fill="currentColor" />
    </svg>
  );
};
