/**
 * PatternDetector
 * ----------------
 * Validates user input by checking it against the rule set
 * provided by PatternRepository. Determines whether input
 * contains sensitive personal information (dates, sequences,
 * common weak words) and generates a warning message if so.
 */

class PatternDetector {
  constructor(patternRepository) {
    this.repository = patternRepository; // dependency, not ownership
    this.matchedRule = null;             // stores which rule was triggered, for warn()
  }

  /**
   * Checks the input against all pattern categories.
   * @param {string} input - the raw word/phrase entered by the user
   * @returns {boolean} true if input matches a sensitive pattern, false if clean
   */
  detect(input) {
    if (!input || typeof input !== "string") {
      this.matchedRule = "empty";
      return true; // treat empty/invalid input as rejected
    }

    const patterns = this.repository.getPatterns();
    const lowerInput = input.toLowerCase();

    // 1. Check against common weak/personal words
    for (const word of patterns.commonWords) {
      const wordRegex = new RegExp("\\b" + word + "\\b", "i");
      if (wordRegex.test(lowerInput)) {
        this.matchedRule = "commonWord";
        return true;
      }
    }

    // 2. Check against date patterns
    for (const pattern of patterns.datePatterns) {
      if (pattern.test(input)) {
        this.matchedRule = "datePattern";
        return true;
      }
    }

    // 3. Check against sequential/repeated number patterns
    for (const pattern of patterns.sequences) {
      if (pattern.test(input)) {
        this.matchedRule = "sequence";
        return true;
      }
    }

    // No match found - input is clean
    this.matchedRule = null;
    return false;
  }

  /**
   * Returns a human-readable warning message based on the last
   * detected rule. Should only be called after detect() returns true.
   * @returns {string}
   */
  warn() {
    switch (this.matchedRule) {
      case "empty":
        return "Please enter a word or phrase to generate a password.";
      case "commonWord":
        return "Your input contains a common or easily guessable word. Please choose a different word for better security.";
      case "datePattern":
        return "Your input appears to contain a date or birth year. Avoid using dates as they are easily guessable. Please try a different word.";
      case "sequence":
        return "Your input contains a predictable number sequence. Please choose a different word for better security.";
      default:
        return "Your input contains sensitive information. Please try a different word.";
    }
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = PatternDetector;
}
