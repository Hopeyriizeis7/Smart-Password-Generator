/**
 * app.js
 * -------
 * Main application controller for the Smart Memorable Password Generator.
 * Wires the UI (index.html) to all backend JS modules:
 *   PatternRepository → PatternDetector → TransformationEngine
 *   → StrengthChecker → PasswordGeneration → PasswordStorage
 *
 * Handles all DOM events (button clicks, checkbox changes)
 * and updates the UI based on generation results.
 */

// ── Initialise all modules ────────────────────────────────────────────────────
const repo      = new PatternRepository();
const detector  = new PatternDetector(repo);
const engine    = new TransformationEngine();
const checker   = new StrengthChecker();
const generator = new PasswordGeneration(detector, engine, checker);
const storage   = new PasswordStorage();

// ── DOM references ────────────────────────────────────────────────────────────
const inputField      = document.getElementById('user-input');
const generateBtn     = document.getElementById('generate-btn');
const warningSection  = document.getElementById('warning-section');
const warningMessage  = document.getElementById('warning-message');
const resultSection   = document.getElementById('result-section');
const passwordDisplay = document.getElementById('password-display');
const copyBtn         = document.getElementById('copy-btn');
const copyFeedback    = document.getElementById('copy-feedback');
const strengthRating  = document.getElementById('strength-rating');
const strengthBar     = document.getElementById('strength-bar');
const feedbackList    = document.getElementById('feedback-list');
const saveCheckbox    = document.getElementById('save-checkbox');
const storageFeedback = document.getElementById('storage-feedback');

// ── Helper: reset UI to clean state ──────────────────────────────────────────
function resetUI() {
  warningSection.hidden = true;
  resultSection.hidden  = true;
  warningMessage.textContent = '';
  passwordDisplay.textContent = '';
  feedbackList.innerHTML = '';
  strengthRating.textContent = '';
  strengthRating.className = 'strength-rating';
  strengthBar.className = 'strength-bar-fill';
  copyFeedback.hidden = true;
  storageFeedback.hidden = true;
  saveCheckbox.checked = false;
  inputField.classList.remove('input-error');
}

// ── Helper: show warning ──────────────────────────────────────────────────────
function showWarning(message) {
  warningSection.hidden = false;
  resultSection.hidden  = true;
  warningMessage.textContent = message;
  inputField.classList.add('input-error');
}

// ── Helper: render strength bar and feedback ──────────────────────────────────
function renderStrength(strengthResult) {
  const rating = strengthResult.rating.toLowerCase(); // 'weak' | 'medium' | 'strong'

  // Rating label
  strengthRating.textContent = strengthResult.rating;
  strengthRating.className = `strength-rating ${rating}`;

  // Bar fill
  strengthBar.className = `strength-bar-fill ${rating}`;

  // Feedback items
  feedbackList.innerHTML = '';
  strengthResult.feedback.forEach(msg => {
    const li = document.createElement('li');
    li.textContent = msg;
    if (msg.includes('meets all')) li.classList.add('positive');
    feedbackList.appendChild(li);
  });
}

// ── Helper: show generated password result ────────────────────────────────────
function showResult(result) {
  warningSection.hidden = false; // keep warning visible if sensitive (won't reach here anyway)
  resultSection.hidden  = false;
  warningSection.hidden = true;

  passwordDisplay.textContent = result.password;
  renderStrength(result.strength);
  inputField.classList.remove('input-error');
}

// ── Main: Generate button click ───────────────────────────────────────────────
generateBtn.addEventListener('click', () => {
  const input = inputField.value.trim();
  resetUI();

  const result = generator.generate(input);

  if (!result.success) {
    showWarning(result.warning);
  } else {
    showResult(result);
  }
});

// ── Allow Enter key to trigger generation ─────────────────────────────────────
inputField.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generateBtn.click();
});

// ── Copy button ───────────────────────────────────────────────────────────────
copyBtn.addEventListener('click', () => {
  const password = passwordDisplay.textContent;
  if (!password) return;

  navigator.clipboard.writeText(password)
    .then(() => {
      copyFeedback.hidden = false;
      copyFeedback.textContent = 'Copied to clipboard!';
      setTimeout(() => { copyFeedback.hidden = true; }, 2000);
    })
    .catch(() => {
      // Fallback for browsers that block clipboard API
      const range = document.createRange();
      range.selectNode(passwordDisplay);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand('copy');
      copyFeedback.hidden = false;
      copyFeedback.textContent = 'Copied!';
      setTimeout(() => { copyFeedback.hidden = true; }, 2000);
    });
});

// ── Save checkbox ─────────────────────────────────────────────────────────────
saveCheckbox.addEventListener('change', async () => {
  const password = generator.formatPassword();
  if (!password) return;

  storageFeedback.hidden = false;

  if (saveCheckbox.checked) {
    const saved = await storage.saveTemp(password);
    if (saved) {
      storageFeedback.textContent = '🔒 Password encrypted and saved. Auto-deletes in 24 hours.';
      storageFeedback.className = 'storage-feedback saved';
    } else {
      storageFeedback.textContent = 'Storage unavailable.';
      storageFeedback.className = 'storage-feedback cleared';
    }
  } else {
    storage.clear();
    storageFeedback.textContent = 'Saved password cleared.';
    storageFeedback.className = 'storage-feedback cleared';
    setTimeout(() => { storageFeedback.hidden = true; }, 2000);
  }
});

// ── On page load: check for existing stored password and auto-delete if expired
window.addEventListener('load', () => {
  storage.checkExpiry();
});
