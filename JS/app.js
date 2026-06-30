/**
 * app.js
 * -------
 * Main application controller for the Smart Memorable Password Generator.
 * Wires the UI to all backend JS modules, including the passphrase-based
 * encrypted storage flow (PBKDF2 key derivation — no key ever stored).
 */

// ── Initialise all modules ────────────────────────────────────────────────────
const repo      = new PatternRepository();
const detector  = new PatternDetector(repo);
const engine    = new TransformationEngine();
const checker   = new StrengthChecker();
const generator = new PasswordGeneration(detector, engine, checker);
const storage   = new PasswordStorage();

// ── DOM references ────────────────────────────────────────────────────────────
const inputField        = document.getElementById('user-input');
const generateBtn       = document.getElementById('generate-btn');
const warningSection    = document.getElementById('warning-section');
const warningMessage    = document.getElementById('warning-message');
const resultSection     = document.getElementById('result-section');
const passwordDisplay   = document.getElementById('password-display');
const copyBtn           = document.getElementById('copy-btn');
const copyFeedback      = document.getElementById('copy-feedback');
const strengthRating    = document.getElementById('strength-rating');
const strengthBar       = document.getElementById('strength-bar');
const feedbackList      = document.getElementById('feedback-list');

const saveCheckbox      = document.getElementById('save-checkbox');
const passphraseRow     = document.getElementById('passphrase-row');
const savePassphrase    = document.getElementById('save-passphrase');
const confirmSaveBtn    = document.getElementById('confirm-save-btn');
const storageFeedback   = document.getElementById('storage-feedback');

const retrieveSection   = document.getElementById('retrieve-section');
const retrieveTimeRem   = document.getElementById('retrieve-time-remaining');
const retrievePassphrase= document.getElementById('retrieve-passphrase');
const revealBtn         = document.getElementById('reveal-btn');
const deleteSavedBtn    = document.getElementById('delete-saved-btn');
const retrieveResult    = document.getElementById('retrieve-result');
const retrieveError     = document.getElementById('retrieve-error');

// ── Reset UI state ────────────────────────────────────────────────────────────
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
  passphraseRow.hidden = true;
  savePassphrase.value = '';
  inputField.classList.remove('input-error');
}

function showWarning(message) {
  warningSection.hidden = false;
  resultSection.hidden  = true;
  warningMessage.textContent = message;
  inputField.classList.add('input-error');
}

function renderStrength(strengthResult) {
  const rating = strengthResult.rating.toLowerCase();
  strengthRating.textContent = strengthResult.rating;
  strengthRating.className = `strength-rating ${rating}`;
  strengthBar.className = `strength-bar-fill ${rating}`;
  feedbackList.innerHTML = '';
  strengthResult.feedback.forEach(msg => {
    const li = document.createElement('li');
    li.textContent = msg;
    if (msg.includes('meets all')) li.classList.add('positive');
    feedbackList.appendChild(li);
  });
}

function showResult(result) {
  resultSection.hidden  = false;
  warningSection.hidden = true;
  passwordDisplay.textContent = result.password;
  renderStrength(result.strength);
  inputField.classList.remove('input-error');
}

// ── Generate button ───────────────────────────────────────────────────────────
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

// ── Save checkbox — reveal passphrase input ───────────────────────────────────
saveCheckbox.addEventListener('change', () => {
  if (saveCheckbox.checked) {
    passphraseRow.hidden = false;
    savePassphrase.focus();
  } else {
    passphraseRow.hidden = true;
    storageFeedback.hidden = true;
  }
});

// ── Confirm save — encrypt with passphrase ────────────────────────────────────
confirmSaveBtn.addEventListener('click', async () => {
  const password   = generator.formatPassword();
  const passphrase = savePassphrase.value.trim();

  if (!password) return;

  if (!passphrase || passphrase.length < 4) {
    storageFeedback.hidden = false;
    storageFeedback.textContent = 'Please enter a passphrase of at least 4 characters.';
    storageFeedback.className = 'storage-feedback cleared';
    return;
  }

  const saved = await storage.saveTemp(password, passphrase);
  storageFeedback.hidden = false;

  if (saved) {
    storageFeedback.textContent = '🔒 Password encrypted and saved. You will need your passphrase to retrieve it within 24 hours.';
    storageFeedback.className = 'storage-feedback saved';
    savePassphrase.value = '';
    checkForSavedPassword(); // refresh the retrieve section
  } else {
    storageFeedback.textContent = 'Saving failed. Please try again.';
    storageFeedback.className = 'storage-feedback cleared';
  }
});

// ── Retrieve saved password section ───────────────────────────────────────────
function checkForSavedPassword() {
  if (storage.hasSaved()) {
    retrieveSection.hidden = false;
    retrieveTimeRem.textContent = `Expires in ${storage.timeRemaining()}`;
    retrieveResult.hidden = true;
    retrieveError.hidden = true;
    retrievePassphrase.value = '';
  } else {
    retrieveSection.hidden = true;
  }
}

revealBtn.addEventListener('click', async () => {
  const passphrase = retrievePassphrase.value.trim();
  if (!passphrase) return;

  const decrypted = await storage.decrypt(passphrase);

  if (decrypted) {
    retrieveResult.hidden = false;
    retrieveResult.textContent = decrypted;
    retrieveError.hidden = true;
  } else {
    retrieveError.hidden = false;
    retrieveResult.hidden = true;
  }
});

retrievePassphrase.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') revealBtn.click();
});

deleteSavedBtn.addEventListener('click', () => {
  storage.clear();
  retrieveSection.hidden = true;
});

// ── On page load: check expiry and show retrieve section if applicable ───────
window.addEventListener('load', () => {
  checkForSavedPassword();
});
