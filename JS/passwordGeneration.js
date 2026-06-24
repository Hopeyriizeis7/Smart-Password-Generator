/**
 * PasswordGeneration
 * -------------------
 * Orchestrates the full password generation workflow by coordinating
 * PatternDetector, TransformationEngine and StrengthChecker.
 *
 * Flow:
 * 1. Receive user input
 * 2. Run PatternDetector — if sensitive info detected, reject and return warning
 * 3. Run TransformationEngine — apply substitution, capitalisation, symbol insertion
 * 4. Run StrengthChecker — evaluate and score the transformed output
 * 5. Return the generated password, strength result and any feedback
 *
 * This class does NOT store the generated password — storage is
 * handled separately by PasswordStorage (optional, user-initiated).
 */

class PasswordGeneration {
  constructor(patternDetector, transformationEngine, strengthChecker) {
    this.detector  = patternDetector;
    this.engine    = transformationEngine;
    this.checker   = strengthChecker;
    this.password  = null; // holds the most recently generated password
  }

  /**
   * Runs the full generation pipeline for a given input.
   * @param {string} input - raw user input word or phrase
   * @returns {{
   *   success: boolean,
   *   password: string|null,
   *   strength: {score: number, rating: string, feedback: string[]}|null,
   *   warning: string|null
   * }}
   */
  generate(input) {

    // Step 1 — Validate and detect sensitive patterns
    const isSensitive = this.detector.detect(input);

    if (isSensitive) {
      this.password = null;
      return {
        success: false,
        password: null,
        strength: null,
        warning: this.detector.warn()
      };
    }

    // Step 2 — Apply rule-based transformations
    const transformed = this.engine.transform(input);

    // Step 3 — Evaluate strength of transformed password
    const strengthResult = this.checker.evaluate(transformed);

    // Step 4 — Store generated password temporarily in memory
    this.password = transformed;

    return {
      success: true,
      password: transformed,
      strength: strengthResult,
      warning: null
    };
  }

  /**
   * Returns the most recently generated password.
   * Returns null if no password has been generated yet
   * or if the last attempt was rejected.
   * @returns {string|null}
   */
  formatPassword() {
    return this.password;
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = PasswordGeneration;
}
