/**
 * PatternRepository
 * ------------------
 * Stores predefined patterns used to detect sensitive personal
 * information in user input (dates, sequences, common words).
 * Organised by category so rules can be maintained and expanded
 * independently of the PatternDetector logic.
 */

class PatternRepository {
  constructor() {

    // Common weak/personal words organised by category
    this.commonWords = [

      // Obvious weak passwords
      "password", "admin", "user", "login", "welcome",
      "qwerty", "letmein", "iloveyou", "master", "shadow",
      "passw0rd", "pa55word",

      // Common dictionary words frequently used as passwords
      "monkey", "dragon", "football", "baseball", "sunshine",
      "princess", "superman", "batman", "starwars", "trustno1",

      // Fruits — short, common, easily guessable as base inputs
      "mango", "apple", "banana", "orange", "grape",
      "melon", "peach", "cherry", "lemon", "berry",
      "papaya", "guava", "avocado", "pineapple", "plum",

      // Animals
      "tiger", "lion", "eagle", "horse", "rabbit",
      "dolphin", "parrot", "panda", "koala", "cheetah",
      "wolf", "bear", "shark", "snake", "cat", "dog",

      // Colours
      "blue", "green", "black", "white", "purple",
      "yellow", "silver", "golden", "violet", "indigo",

      // Common nouns frequently used as passwords
      "flower", "summer", "winter", "spring", "thunder",
      "star", "moon", "fire", "water", "earth",
      "ocean", "river", "cloud", "storm", "sky",

      // Common first names
      "james", "john", "robert", "michael", "william",
      "david", "richard", "joseph", "thomas", "charles",
      "mary", "patricia", "jennifer", "linda", "barbara",
      "elizabeth", "jessica", "sarah", "karen", "lisa",

      // Keyboard patterns
      "asdfgh", "zxcvbn", "qazwsx", "1qaz2wsx"
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
