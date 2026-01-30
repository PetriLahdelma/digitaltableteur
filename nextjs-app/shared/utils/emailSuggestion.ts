/**
 * Common email domain typos and their corrections
 * WCAG 3.3.3: Error Suggestion
 */
const DOMAIN_TYPOS: Record<string, string> = {
  // Gmail typos
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmaill.com': 'gmail.com',
  // Hotmail typos
  'hotmal.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotamil.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  // Outlook typos
  'outlok.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlool.com': 'outlook.com',
  // Yahoo typos
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  // iCloud typos
  'icloud.co': 'icloud.com',
  'icoud.com': 'icloud.com',
};

/**
 * Suggests a corrected email if a common domain typo is detected
 * @param email - The email address to check
 * @returns The suggested corrected email, or null if no typo detected
 */
export function suggestEmailCorrection(email: string): string | null {
  if (!email || !email.includes('@')) return null;

  const [localPart, domain] = email.split('@');
  if (!domain) return null;

  const lowerDomain = domain.toLowerCase();
  const correction = DOMAIN_TYPOS[lowerDomain];

  if (correction) {
    return `${localPart}@${correction}`;
  }

  return null;
}
