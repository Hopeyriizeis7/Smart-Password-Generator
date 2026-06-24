/**
 * StrengthChecker
 * ----------------
 * Evaluates the strength of a generated password against
 * standard security criteria aligned with NIST SP 800-63B
 * guidelines, which prioritise length and character diversity.
 *
 * Scoring criteria:
 * 1. Length          — minimum 8 characters (NIST primary recommendation)
 * 2. Uppercase       — at least one uppercase letter
 * 3. Lowercase       — at least one lowercase letter
 * 4. Numbers         — at least one numeric digit
 * 5. Special chars   — at least one special character
 * 6. Length bonus    — extra points for passwords over 12 characters
 *
 * Strength ratings:
 * 0-2 criteria met  → Weak
 * 3-4 criteria met  → Medium
 * 5-6 criteria met  → Strong
 */

class StrengthChecker {
  constructor() {
    this.score = 0;
    this.feedback = [];
  }

  /**
   * Evaluates the password against all strength criteria.
   * Updates this.score and this.feedback based on results.
   * @param {string} password - the generated password to evaluate
   * @returns {{score: number, rating: string, feedback: string[]}}
   */
  evaluate(password) {
    this.score = 0;
    this.feedback = [];

    if (!password || typeof password !== 'string') {
      return {
        score: 0,
        rating: 'Weak',
        feedback: ['No password provided.']
      };
    }

    // Criterion 1 — Minimum length (8+ characters)
    if (password.length >= 8) {
      this.score++;
    } else {
      this.feedback.push('Password is too short. Aim for at least 8 characters — try a longer base word.');
    }

    // Criterion 2 — Contains uppercase letter
    if (/[A-Z]/.test(password)) {
      this.score++;
    } else {
      this.feedback.push('No uppercase letter detected.');
    }

    // Criterion 3 — Contains lowercase letter
    if (/[a-z]/.test(password)) {
      this.score++;
    } else {
      this.feedback.push('No lowercase letter detected.');
    }

    // Criterion 4 — Contains at least one number
    if (/[0-9]/.test(password)) {
      this.score++;
    } else {
      this.feedback.push('No number detected.');
    }

    // Criterion 5 — Contains at least one special character
    if (/[^a-zA-Z0-9]/.test(password)) {
      this.score++;
    } else {
      this.feedback.push('No special character detected.');
    }

    // Criterion 6 — Length bonus (12+ characters — NIST recommends longer passwords)
    if (password.length >= 12) {
      this.score++;
    } else {
      this.feedback.push('Consider using a longer base word (12+ characters) for stronger security.');
    }

    return {
      score: this.score,
      rating: this.getRating(),
      feedback: this.feedback.length > 0 ? this.feedback : ['Password meets all strength criteria.']
    };
  }

  /**
   * Returns a human-readable strength rating based on the current score.
   * @returns {string} 'Weak' | 'Medium' | 'Strong'
   */
  getRating() {
    if (this.score <= 2) return 'Weak';
    if (this.score <= 4) return 'Medium';
    return 'Strong';
  }

  /**
   * Returns a formatted display string for UI output.
   * @param {string} password
   * @returns {string}
   */
  displayScore(password) {
    const result = this.evaluate(password);
    return `Strength: ${result.rating} (${result.score}/6)\nFeedback: ${result.feedback.join(' ')}`;
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = StrengthChecker;
}
