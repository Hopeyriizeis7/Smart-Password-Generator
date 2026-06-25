/**
 * PasswordStorage
 * ----------------
 * Handles optional temporary storage of generated passwords.
 * Passwords are encrypted using the Web Crypto API (AES-GCM)
 * before being saved to localStorage.
 * An expiry timestamp is stored alongside the encrypted value.
 * Passwords are automatically deleted after 24 hours.
 *
 * This module is entirely optional and user-initiated —
 * the core generation flow does not depend on it.
 *
 * Storage keys:
 *   'spg_password' — AES-GCM encrypted password (base64)
 *   'spg_iv'       — Initialisation vector used for encryption (base64)
 *   'spg_expiry'   — Unix timestamp (ms) when password should be deleted
 *   'spg_key'      — Exported AES key (base64) for decryption
 */

class PasswordStorage {

  constructor() {
    this.STORAGE_KEY_PWD    = 'spg_password';
    this.STORAGE_KEY_IV     = 'spg_iv';
    this.STORAGE_KEY_EXPIRY = 'spg_expiry';
    this.STORAGE_KEY_KEY    = 'spg_key';
    this.EXPIRY_MS          = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  // ── Helpers: base64 encode/decode for storing binary data as strings ────────

  _bufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  _base64ToBuffer(base64) {
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer.buffer;
  }

  // ── Encryption ──────────────────────────────────────────────────────────────

  /**
   * Encrypts a password string using AES-GCM (Web Crypto API).
   * Generates a fresh random key and IV for every save operation.
   * @param {string} password
   * @returns {Promise<{encrypted: string, iv: string, key: string}>}
   */
  async encrypt(password) {
    const encoder = new TextEncoder();
    const data    = encoder.encode(password);

    // Generate a fresh AES-GCM key
    const cryptoKey = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,       // extractable so we can store it
      ['encrypt', 'decrypt']
    );

    // Generate a random 12-byte initialisation vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      data
    );

    // Export the key so it can be stored (needed for decryption)
    const exportedKey = await window.crypto.subtle.exportKey('raw', cryptoKey);

    return {
      encrypted: this._bufferToBase64(encrypted),
      iv:        this._bufferToBase64(iv),
      key:       this._bufferToBase64(exportedKey)
    };
  }

  // ── Decryption ──────────────────────────────────────────────────────────────

  /**
   * Decrypts a previously encrypted password.
   * @param {string} encryptedB64 - base64 encrypted ciphertext
   * @param {string} ivB64        - base64 initialisation vector
   * @param {string} keyB64       - base64 raw AES key
   * @returns {Promise<string>} decrypted password
   */
  async decrypt(encryptedB64, ivB64, keyB64) {
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      this._base64ToBuffer(keyB64),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: this._base64ToBuffer(ivB64) },
      cryptoKey,
      this._base64ToBuffer(encryptedB64)
    );

    return new TextDecoder().decode(decrypted);
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Encrypts and saves a password to localStorage with a 24-hour expiry.
   * @param {string} password
   * @returns {Promise<boolean>} true if saved successfully
   */
  async saveTemp(password) {
    try {
      const { encrypted, iv, key } = await this.encrypt(password);
      const expiry = Date.now() + this.EXPIRY_MS;

      localStorage.setItem(this.STORAGE_KEY_PWD,    encrypted);
      localStorage.setItem(this.STORAGE_KEY_IV,     iv);
      localStorage.setItem(this.STORAGE_KEY_KEY,    key);
      localStorage.setItem(this.STORAGE_KEY_EXPIRY, expiry.toString());

      return true;
    } catch (err) {
      console.error('PasswordStorage: save failed', err);
      return false;
    }
  }

  /**
   * Checks whether a stored password has expired.
   * If expired, automatically deletes it.
   * Should be called on every page load.
   * @returns {boolean} true if password was deleted due to expiry
   */
  checkExpiry() {
    const expiry = localStorage.getItem(this.STORAGE_KEY_EXPIRY);
    if (!expiry) return false;

    if (Date.now() > parseInt(expiry, 10)) {
      this.clear();
      console.log('PasswordStorage: stored password expired and was deleted.');
      return true;
    }
    return false;
  }

  /**
   * Retrieves and decrypts the stored password if it exists and has not expired.
   * @returns {Promise<string|null>} decrypted password or null
   */
  async retrieve() {
    if (this.checkExpiry()) return null;

    const encrypted = localStorage.getItem(this.STORAGE_KEY_PWD);
    const iv        = localStorage.getItem(this.STORAGE_KEY_IV);
    const key       = localStorage.getItem(this.STORAGE_KEY_KEY);

    if (!encrypted || !iv || !key) return null;

    try {
      return await this.decrypt(encrypted, iv, key);
    } catch (err) {
      console.error('PasswordStorage: decryption failed', err);
      return null;
    }
  }

  /**
   * Removes all stored password data from localStorage immediately.
   */
  clear() {
    localStorage.removeItem(this.STORAGE_KEY_PWD);
    localStorage.removeItem(this.STORAGE_KEY_IV);
    localStorage.removeItem(this.STORAGE_KEY_KEY);
    localStorage.removeItem(this.STORAGE_KEY_EXPIRY);
  }
}

// Browser only — no module.exports needed
// PasswordStorage uses window.crypto and localStorage which are browser APIs
