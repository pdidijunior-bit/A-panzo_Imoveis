import { Property } from '../types';

/**
 * Normalizes text by removing accents/diacritics, lowercase and stripping excess whitespace.
 * e.g., "Talatôna" -> "talatona", "Vivenda T3" -> "vivenda t3"
 */
export function normalizeSearchString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Calculates Levenshtein distance between two strings.
 */
function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val =
        a[i - 1] === b[j - 1]
          ? row[j - 1]
          : Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }

  return row[b.length];
}

/**
 * Checks if token matches target with fuzzy tolerance based on token length:
 * - Length < 4: exact substring match only
 * - Length 4-5: max 1 typo or prefix match
 * - Length >= 6: max 2 typos or prefix match
 */
function fuzzyTokenMatch(token: string, targetWords: string[]): boolean {
  if (!token || !targetWords.length) return false;

  for (const word of targetWords) {
    if (!word) continue;
    // Exact word or prefix match
    if (word === token || word.startsWith(token) || token.startsWith(word)) {
      return true;
    }

    // Substring match
    if (word.length >= 3 && token.length >= 3 && (word.includes(token) || token.includes(word))) {
      return true;
    }

    // Typo tolerance
    const maxAllowedDist = token.length >= 6 ? 2 : token.length >= 4 ? 1 : 0;
    if (maxAllowedDist > 0) {
      // Compare word or prefix of length comparable to token
      const wordSlice = word.slice(0, token.length);
      if (levenshteinDistance(token, wordSlice) <= maxAllowedDist) {
        return true;
      }
      if (Math.abs(token.length - word.length) <= maxAllowedDist) {
        if (levenshteinDistance(token, word) <= maxAllowedDist) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Comprehensive Smart Search Engine:
 * - Tokenizes user query into keywords
 * - Checks each keyword against Title, Code, Description, Neighborhood (bairro), Condomínio,
 *   Province, Municipality, Typology (T1, T2, T3...), Deal Type ('comprar', 'arrendar'), and Features list.
 * - Scores and ranks matched properties.
 */
export function smartPropertySearch(properties: Property[], query: string): Property[] {
  const cleanQuery = normalizeSearchString(query);
  if (!cleanQuery) return properties;

  const queryTokens = cleanQuery
    .split(/[\s,;+\-/]+/)
    .filter((t) => t.length > 0);

  if (queryTokens.length === 0) return properties;

  // Synonyms mapping for Angola real estate context
  const expandedTokens = queryTokens.map((token) => {
    const list = [token];
    if (token === 'comprar' || token === 'compra') list.push('venda');
    if (token === 'venda') list.push('comprar', 'compra');
    if (token === 'alugar' || token === 'aluguer' || token === 'arrendar') list.push('arrendamento');
    if (token === 'casa' || token === 'moradia') list.push('vivenda');
    if (token === 'apartameto' || token === 'apto' || token === 'ap') list.push('apartamento');
    return list;
  });

  interface ScoredItem {
    property: Property;
    score: number;
  }

  const scored: ScoredItem[] = [];

  for (const item of properties) {
    if (!item) continue;

    // Collect all text attributes for indexing
    const titleNorm = normalizeSearchString(item.title || '');
    const codeNorm = normalizeSearchString(item.code || '');
    const descNorm = normalizeSearchString(item.description || '');
    const neighborNorm = normalizeSearchString(item.neighborhood || '');
    const provNorm = normalizeSearchString(item.province || '');
    const muniNorm = normalizeSearchString(item.municipality || '');
    const catNorm = normalizeSearchString(item.categoryName || item.category || '');
    const dealNorm = normalizeSearchString(item.dealType || '');
    const addressNorm = normalizeSearchString(item.addressReference || '');
    const featuresNorm = (item.features || []).map((f) => normalizeSearchString(f));

    // Bedrooms representation
    const bedNorm = item.bedrooms ? [`t${item.bedrooms}`, `${item.bedrooms} quartos`, `${item.bedrooms}q`] : [];

    // Full word bag for token checking
    const allWords = [
      ...titleNorm.split(/\s+/),
      ...codeNorm.split(/\s+/),
      ...neighborNorm.split(/\s+/),
      ...muniNorm.split(/\s+/),
      ...provNorm.split(/\s+/),
      ...catNorm.split(/\s+/),
      ...dealNorm.split(/\s+/),
      ...addressNorm.split(/\s+/),
      ...featuresNorm.flatMap((f) => f.split(/\s+/)),
      ...bedNorm,
    ].filter(Boolean);

    let matchAll = true;
    let score = 0;

    for (const tokenGroup of expandedTokens) {
      let groupMatched = false;

      for (const token of tokenGroup) {
        // High priority: Code exact
        if (codeNorm.includes(token)) {
          groupMatched = true;
          score += 50;
          break;
        }

        // Neighborhood or Municipality match
        if (neighborNorm.includes(token) || muniNorm.includes(token)) {
          groupMatched = true;
          score += 40;
          break;
        }

        // Title match
        if (titleNorm.includes(token)) {
          groupMatched = true;
          score += 35;
          break;
        }

        // Typology match (e.g., T3 or 3 quartos)
        if (bedNorm.some((b) => b.includes(token) || token.includes(b))) {
          groupMatched = true;
          score += 30;
          break;
        }

        // Features match
        if (featuresNorm.some((f) => f.includes(token))) {
          groupMatched = true;
          score += 25;
          break;
        }

        // Fuzzy match across token list
        if (fuzzyTokenMatch(token, allWords)) {
          groupMatched = true;
          score += 15;
          break;
        }

        // Description partial match
        if (descNorm.includes(token)) {
          groupMatched = true;
          score += 10;
          break;
        }
      }

      if (!groupMatched) {
        matchAll = false;
        break;
      }
    }

    if (matchAll && score > 0) {
      scored.push({ property: item, score });
    }
  }

  // Sort descending by relevance score
  return scored.sort((a, b) => b.score - a.score).map((s) => s.property);
}
