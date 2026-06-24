/**
 * TransformationEngine
 * ---------------------
 * Applies rule-based transformation techniques to valid user input
 * to produce a stronger password while preserving enough of the
 * original word's structure to remain memorable.
 *
 * Techniques applied:
 * 1. Character substitution  — replaces letters with visually similar symbols
 * 2. Selective capitalisation — capitalises specific characters
 * 3. Strategic symbol insertion — inserts symbols at defined positions
 *
 * Full string shuffling is deliberately excluded — it destroys the
 * familiar word structure that supports user recall.
 */

class TransformationEngine {
  constructor() {
    // Character substitution rules
    // Maps each lowercase letter to its visually similar symbol equivalent
    this.rules = {
      'a': '@',
      'e': '3',
      'i': '!',
      'o': '0',
      's': '$',
      't': '7',
      'l': '1',
      'b': '8',
      'g': '9',
      'z': '2'
    };
  }

  /**
   * Applies character substitution to the input string.
   * Only substitutes lowercase letters that have a defined rule.
   * Preserves characters with no substitution rule unchanged.
   * @param {string} input
   * @returns {string}
   */
  substitute(input) {
    return input
      .split('')
      .map(char => {
        const lower = char.toLowerCase();
        return this.rules[lower] !== undefined ? this.rules[lower] : char;
      })
      .join('');
  }

  /**
   * Applies selective capitalisation to the input string.
   * Capitalises every character at a position divisible by 3
   * that is still an alphabetic character.
   * Also guarantees at least one uppercase letter by forcing
   * the first remaining alphabetic character to uppercase.
   * @param {string} input
   * @returns {string}
   */
  capitalise(input) {
    let result = input
      .split('')
      .map((char, index) => {
        if ((index === 0 || index % 3 === 0) && /[a-zA-Z]/.test(char)) {
          return char.toUpperCase();
        }
        return char;
      })
      .join('');

    // Guarantee at least one uppercase letter in the output
    if (!/[A-Z]/.test(result)) {
      result = result.replace(/[a-z]/, c => c.toUpperCase());
    }

    return result;
  }

  /**
   * Inserts special characters at strategic positions.
   * Inserts one symbol at the midpoint and one at the end.
   * Symbol selection is deterministic based on input length.
   * @param {string} input
   * @returns {string}
   */
  insertSymbol(input) {
    const symbols = ['#', '*', '&', '%', '^', '~'];
    const sym1 = symbols[input.length % symbols.length];
    const sym2 = symbols[(input.length + 2) % symbols.length];
    const mid = Math.floor(input.length / 2);
    return input.slice(0, mid) + sym1 + input.slice(mid) + sym2;
  }

  /**
   * Runs all three transformation techniques in sequence:
   * substitute → capitalise → insertSymbol
   * Returns the final transformed password string.
   * @param {string} input - clean, validated user input
   * @returns {string} transformed password
   */
  transform(input) {
    if (!input || typeof input !== 'string') return '';
    let result = input.trim();
    result = this.substitute(result);
    result = this.capitalise(result);
    result = this.insertSymbol(result);
    return result;
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = TransformationEngine;
}
