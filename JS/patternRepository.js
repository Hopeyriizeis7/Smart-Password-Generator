/**
 * PatternRepository
 * ------------------
 * Stores predefined patterns used to detect sensitive personal
 * information in user input (dates, sequences, common words).
 * Separated from PatternDetector so detection logic and rule
 * definitions can evolve independently.
 */

class PatternRepository {
  constructor() {
    // Common weak/personal words that should not be used as password input
    this.commonWords = [
      "password", "admin", "user", "login", "welcome",
      "qwerty", "letmein", "sunshine", "iloveyou", "monkey",
      "dragon", "football", "baseball", "master", "shadow"
    ];

    // Regex patterns that match common date formats
    // e.g. 01012000, 01/01/2000, 2000, 1995
    this.datePatterns = [
      /\b\d{2}[\/\-]\d{2}[\/\-]\d{2,4}\b/,   // DD/MM/YYYY or DD-MM-YY
      /\b(19|20)\d{2}\b/,                     // Standalone years 1900-2099
      /\b\d{8}\b/                             // DDMMYYYY with no separators
    ];

    // Regex patterns that match sequential or repeated numbers
    this.sequences = [
      /0123|1234|2345|3456|4567|5678|6789/,   // ascending sequences
      /9876|8765|7654|6543|5432|4321/,        // descending sequences
      /(\d)\1{2,}/                            // repeated digits e.g. 111, 0000
    ];
  }

  /**
   * Returns all stored pattern categories as a single object.
   * @returns {{commonWords: string[], datePatterns: RegExp[], sequences: RegExp[]}}
   */
  getPatterns() {
    return {
      commonWords: this.commonWords,
      datePatterns: this.datePatterns,
      sequences: this.sequences
    };
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = PatternRepository;
}
