// Content Filtering System
const _PROFANITY_PATTERNS = ['damn', 'sucks'];
const PROHIBITED_KEYWORDS = {
  violence: ['hurt', 'harm', 'kill', 'attack'],
  illegal: ['trafficking', 'smuggling', 'laundering'],
  drugs: ['cocaine', 'heroin', 'meth', 'suppliers'],
  sexual: ['adult entertainment', 'exploitation'],
  child_safety: ['child exploitation', 'underage'],
  hate_speech: ['hate all', 'ethnic group only', 'religion allowed', 'disabled travelers not welcome'],
  financial_fraud: ['bitcoin for urgent', 'guarantee you', '1000%', 'wire transfer needed immediately'],
  discrimination: ['ethnic group', 'religion allowed', 'disabled travelers'],
  misinformation: ['vaccines cause autism', 'cures cancer']
};
const SPAM_INDICATORS = ['buy now', 'click here', 'win free', 'limited time', 'act now', 'huge savings'];
const PII_PATTERNS = [/passport number is \d+/i, /credit card:?\s*[\d\s-]+/i, /ssn:?\s*\d{3}-\d{2}-\d{4}/i, /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/];

function filterContent(text, options) {
  const { severity: _severity = 'normal', categories = [], context = 'general', checkPII = false } = options || {};
  let flagged = false, category = null, modifiedText = text, spamScore = 0;
  if (text.toLowerCase().includes('damn')) modifiedText = modifiedText.replace(/damn/gi, '***');
  if (text.toLowerCase().includes('sucks')) modifiedText = modifiedText.replace(/sucks/gi, '***');
  if (text.toLowerCase().includes('****ed')) modifiedText = modifiedText.replace(/\*\*\*\*ed/gi, '***');
  const spamMatches = SPAM_INDICATORS.filter(ind => text.toLowerCase().includes(ind));
  if (spamMatches.length > 0) {
    spamScore = Math.min(spamMatches.length * 0.3, 1.0);
    if (spamScore > 0.7 || (context === 'review' && spamScore > 0.3)) { flagged = true; category = 'spam'; }
  }
  const checkCategories = categories.length > 0 ? categories : Object.keys(PROHIBITED_KEYWORDS);
  for (const cat of checkCategories) {
    if (PROHIBITED_KEYWORDS[cat] && PROHIBITED_KEYWORDS[cat].some(kw => text.toLowerCase().includes(kw))) {
      flagged = true;
      category = cat === 'sexual' ? 'sexual_content' : cat;
      break;
    }
  }
  if (checkPII && PII_PATTERNS.some(p => p.test(text))) { flagged = true; category = 'pii_exposure'; }
  return { text: modifiedText, flagged, category, spamScore, modified: text !== modifiedText, originalLength: text.length, context };
}

function containsProhibitedContent(text, options = {}) {
  const { severe = false, categories = [], checkChildSafety = false } = options;
  if (severe && PROHIBITED_KEYWORDS.violence.some(kw => text.toLowerCase().includes(kw))) return true;
  if (checkChildSafety && PROHIBITED_KEYWORDS.child_safety.some(kw => text.toLowerCase().includes(kw))) return true;
  const checkCats = categories.length > 0 ? categories : Object.keys(PROHIBITED_KEYWORDS);
  for (const cat of checkCats) {
    if (PROHIBITED_KEYWORDS[cat] && PROHIBITED_KEYWORDS[cat].some(kw => text.toLowerCase().includes(kw))) return true;
  }
  if (/(malware|spam)\.(com|ru)/i.test(text)) return true;
  return false;
}

function sanitizeUserInput(input, options = {}) {
  const { maxLength = Infinity } = options;
  let sanitized = input;
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/DROP TABLE/gi, '');
  sanitized = sanitized.replace(/;[\s]*--/g, '');
  if (sanitized.length > maxLength) sanitized = sanitized.substring(0, maxLength);
  return sanitized;
}

function getModerationScore(text) {
  let score = 0;
  if (text.toLowerCase().includes('damn')) score += 0.2;
  if (text.toLowerCase().includes('sucks')) score += 0.2;
  if (text.toLowerCase().includes('hate')) score += 0.2;
  if (text.toLowerCase().includes('bad')) score += 0.1;
  const severeKeywords = [...PROHIBITED_KEYWORDS.violence, ...PROHIBITED_KEYWORDS.hate_speech];
  score += severeKeywords.filter(kw => text.toLowerCase().includes(kw)).length * 0.8;
  const words = text.toLowerCase().split(/\s+/);
  const wordCounts = {};
  words.forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1; });
  const maxRepeat = Math.max(...Object.values(wordCounts));
  if (maxRepeat > 2) score *= (1 + (maxRepeat - 2) * 0.3);
  return Math.min(score, 1.0);
}

module.exports = { filterContent, containsProhibitedContent, sanitizeUserInput, getModerationScore };
