/* boxlock.js — checks a pet box password WITHOUT keeping the password inside the page.

   Instead of the password itself, the page holds a "lock code" that looks like
       pbkdf2$210000$<random salt>$<scrambled fingerprint>
   When someone types a password, this file scrambles it the same way (PBKDF2 / SHA-256, 210,000 rounds)
   and compares the result. The password cannot be read back out of the lock code, and every guess is
   deliberately slow — so someone who views the page source finds no password to copy.

   Make a lock code for a password with  make-password.html  (open it on your own computer).
   Used by home.html (to open a box) and petbox.html (the "I'm the owner" button).

   Note: a lock code cannot protect a weak password. "casper123" can still be guessed, so give every
   box a long random password (make-password.html can suggest one). */
(function (global) {
  var ITERATIONS = 210000;

  function available() {
    return !!(global.crypto && global.crypto.subtle && global.TextEncoder);
  }
  function toHex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) {
      return ('0' + b.toString(16)).slice(-2);
    }).join('');
  }
  function fromHex(hex) {
    var out = new Uint8Array(hex.length / 2);
    for (var i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }
  function derive(password, salt, iterations) {
    var enc = new TextEncoder();
    return global.crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
      .then(function (key) {
        return global.crypto.subtle.deriveBits(
          { name: 'PBKDF2', salt: salt, iterations: iterations, hash: 'SHA-256' }, key, 256);
      })
      .then(toHex);
  }

  // password -> lock code (to paste into home.html and petbox.html)
  function make(password) {
    var salt = global.crypto.getRandomValues(new Uint8Array(16));
    return derive(password, salt, ITERATIONS).then(function (hash) {
      return 'pbkdf2$' + ITERATIONS + '$' + toHex(salt) + '$' + hash;
    });
  }

  // does this password match the lock code?  ->  Promise<true|false>
  function verify(password, lockCode) {
    var parts = String(lockCode || '').split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') return Promise.resolve(false);
    return derive(password, fromHex(parts[2]), parseInt(parts[1], 10)).then(function (hash) {
      var diff = hash.length ^ parts[3].length;       // compare every character, no early exit
      for (var i = 0; i < hash.length && i < parts[3].length; i++) diff |= hash.charCodeAt(i) ^ parts[3].charCodeAt(i);
      return diff === 0;
    });
  }

  global.BoxLock = { available: available, make: make, verify: verify };
})(window);
