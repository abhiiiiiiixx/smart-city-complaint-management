import { ComplaintPriority } from '../types/database';

interface PrioritySuggestion {
  priority: ComplaintPriority;
  reason: string;
  matchedKeywords: string[];
}

const CRITICAL_KEYWORDS = [
  'spark',
  'sparking',
  'live wire',
  'open wire',
  'short circuit',
  'fire',
  'gas leak',
  'cylinder',
  'burst pipe',
  'flooding',
  'collapse',
  'cave-in',
  'fatal',
  'life hazard',
  'deep open manhole',
  'exposed cable',
  'electrocution',
];

const HIGH_KEYWORDS = [
  'manhole',
  'overflowing sewage',
  'contamination',
  'foul smell',
  'blackout',
  'total dark',
  'school',
  'hospital',
  'main road',
  'highway',
  'traffic jam',
  'major pothole',
  'accident',
  'fallen tree',
  'broken pole',
  'senior citizen',
];

const LOW_KEYWORDS = [
  'faded sign',
  'graffiti',
  'tree trimming',
  'routine',
  'minor scratch',
  'cosmetic',
  'poster',
  'suggestion',
];

export function analyzeComplaintPriority(
  title: string,
  description: string,
  categoryDefaultPriority: ComplaintPriority = 'Medium'
): PrioritySuggestion {
  const combinedText = `${title} ${description}`.toLowerCase();

  const matchedCritical = CRITICAL_KEYWORDS.filter((word) =>
    combinedText.includes(word)
  );
  if (matchedCritical.length > 0) {
    return {
      priority: 'Critical',
      reason: `Automated safety check detected critical keywords: "${matchedCritical.join(', ')}". High civic safety hazard.`,
      matchedKeywords: matchedCritical,
    };
  }

  const matchedHigh = HIGH_KEYWORDS.filter((word) =>
    combinedText.includes(word)
  );
  if (matchedHigh.length > 0) {
    return {
      priority: 'High',
      reason: `Key civic risk indicators found: "${matchedHigh.join(', ')}". Marked for prioritized dispatch.`,
      matchedKeywords: matchedHigh,
    };
  }

  const matchedLow = LOW_KEYWORDS.filter((word) =>
    combinedText.includes(word)
  );
  if (matchedLow.length > 0 && categoryDefaultPriority !== 'High') {
    return {
      priority: 'Low',
      reason: `Routine maintenance or non-urgent civic issue detected ("${matchedLow.join(', ')}").`,
      matchedKeywords: matchedLow,
    };
  }

  return {
    priority: categoryDefaultPriority,
    reason: `Standard default priority for this complaint category.`,
    matchedKeywords: [],
  };
}
