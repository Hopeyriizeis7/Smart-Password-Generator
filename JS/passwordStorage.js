/**
 * PasswordStorage
 * ----------------
 * Handles optional temporary encrypted storage of generated passwords.
 *
 * Security approach — PBKDF2 key derivation:
 * Rather than generating and storing an AES key (which would be
 * readable from localStorage), the encryption key is DERIVED from
 * a user-provided passphrase using PBKDF2 (100,000 iterations).
 * Only the salt and ciphertext are stored — the key never touches
 * localStorage, making the stored data useless without the passphrase.
 *
 * Storage keys (localStorage):
 *   'spg_password' — AES-GCM encrypted ciphertext (base64)
 *   'spg_iv'       — Initialisation vector (base64)
 *   'spg_salt'     — PBKDF2 salt (base64) — NOT the key
 *   'spg_expiry'   — Unix timestamp (ms) for auto-deletion
 */

class PasswordStorage {

  constructor() {
    this.STORAGE_KEY_PWD    = 'spg_password';
    this.STORAGE_KEY_IV     = 'spg_iv';
    this.STORAGE_KEY_SALT   = 'spg_salt';
    this.STORAGE_KEY_EXPIRY = 'spg_expiry';
    this.EXPIRY_MS          = 24 * 60 * 60 * 1000;
    this.PBKDF2_ITERATIONS  = 100000;
  }

  _bufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  _base64ToBuffer(base64) {
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
    return buffer.buffer;
  }

  async _deriveKey(passphrase, salt) {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw', new TextEncoder().encode(passphrase),
      { name: 'PBKDF2' }, false, ['deriveKey']
    );
    return await window.crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: this.PBKDF2_ITERATIONS, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false, ['encrypt', 'decrypt']
    );
  }

  async saveTemp(password, passphrase) {
    try {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv   = window.crypto.getRandomValues(new Uint8Array(12));
      const key  = await this._deriveKey(passphrase, salt);
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv }, key,
        new TextEncoder().encode(password)
      );
      localStorage.setItem(this.STORAGE_KEY_PWD,    this._bufferToBase64(encrypted));
      localStorage.setItem(this.STORAGE_KEY_IV,     this._bufferToBase64(iv));
      localStorage.setItem(this.STORAGE_KEY_SALT,   this._bufferToBase64(salt));
      localStorage.setItem(this.STORAGE_KEY_EXPIRY, (Date.now() + this.EXPIRY_MS).toString());
      return true;
    } catch (err) {
      console.error('PasswordStorage: save failed', err);
      return false;
    }
  }

  async decrypt(passphrase) {
    try {
      if (this.checkExpiry()) return null;
      const encB64  = localStorage.getItem(this.STORAGE_KEY_PWD);
      const ivB64   = localStorage.getItem(this.STORAGE_KEY_IV);
      const saltB64 = localStorage.getItem(this.STORAGE_KEY_SALT);
      if (!encB64 || !ivB64 || !saltB64) return null;
      const key = await this._deriveKey(passphrase, this._base64ToBuffer(saltB64));
      const dec = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: this._base64ToBuffer(ivB64) },
        key, this._base64ToBuffer(encB64)
      );
      return new TextDecoder().decode(dec);
    } catch {
      return null; // wrong passphrase — AES-GCM auth tag fails
    }
  }

  checkExpiry() {
    const expiry = localStorage.getItem(this.STORAGE_KEY_EXPIRY);
    if (!expiry) return false;
    if (Date.now() > parseInt(expiry, 10)) { this.clear(); return true; }
    return false;
  }

  hasSaved() {
    if (this.checkExpiry()) return false;
    return !!localStorage.getItem(this.STORAGE_KEY_PWD);
  }

  timeRemaining() {
    const expiry = localStorage.getItem(this.STORAGE_KEY_EXPIRY);
    if (!expiry) return null;
    const ms = parseInt(expiry, 10) - Date.now();
    if (ms <= 0) return null;
    return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
  }

  clear() {
    [this.STORAGE_KEY_PWD, this.STORAGE_KEY_IV,
     this.STORAGE_KEY_SALT, this.STORAGE_KEY_EXPIRY]
      .forEach(k => localStorage.removeItem(k));
  }
}
