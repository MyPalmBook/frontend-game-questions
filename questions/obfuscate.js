/**
 * Simple reversible obfuscation utilities for frontend quiz answers.
 * Exports:
 *  - obfuscate(text, key)
 *  - deobfuscate(encoded, key)
 *  - obfuscateQuestionAnswers(questions, key) // returns new array, obfuscates 'answer' prop
 *  - deobfuscateQuestionAnswers(questions, key)
 *
 * Uses XOR with a repeating key and Base64. Works in browser and Node (with Buffer fallback).
 */

// btoa/atob fallback for Node
function _btoa(str) {
  if (typeof btoa === 'function') return btoa(str);
  if (typeof Buffer === 'function') return Buffer.from(str, 'binary').toString('base64');
  throw new Error('No btoa or Buffer available');
}

function _atob(b64) {
  if (typeof atob === 'function') return atob(b64);
  if (typeof Buffer === 'function') return Buffer.from(b64, 'base64').toString('binary');
  throw new Error('No atob or Buffer available');
}

function _xorString(input, key) {
  if (!key) throw new Error('Key required for obfuscation');
  const out = new Array(input.length);
  for (let i = 0; i < input.length; i++) {
    out[i] = String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return out.join('');
}

/**
 * Obfuscate a string using XOR with a repeating key and Base64-encode the result.
 * @param {string} text
 * @param {string} key - secret key (must be same for deobfuscation)
 * @returns {string} base64-encoded obfuscated value
 */
export function obfuscate(text, key) {
  if (text == null) return '';
  const bin = _xorString(String(text), String(key));
  return _btoa(bin);
}

/**
 * Reverse of obfuscate()
 * @param {string} encoded - base64-encoded obfuscated value
 * @param {string} key
 * @returns {string} original text
 */
export function deobfuscate(encoded, key) {
  if (!encoded) return '';
  const bin = _atob(String(encoded));
  return _xorString(bin, String(key));
}

/**
 * Create a shallow-copied array of questions with each question's answer property obfuscated.
 * Does not mutate the original array/objects.
 * @param {Array<Object>} questions
 * @param {string} key
 * @param {string} [answerProp='answer']
 */
export function obfuscateQuestionAnswers(questions, key, answerProp = 'answer') {
  if (!Array.isArray(questions)) return [];
  return questions.map(q => {
    if (!q || typeof q !== 'object') return q;
    const copy = { ...q };
    if (Object.prototype.hasOwnProperty.call(q, answerProp)) {
      copy[answerProp] = obfuscate(q[answerProp], key);
    }
    return copy;
  });
}

/**
 * Deobfuscate the answer property for questions created with obfuscateQuestionAnswers.
 */
export function deobfuscateQuestionAnswers(questions, key, answerProp = 'answer') {
  if (!Array.isArray(questions)) return [];
  return questions.map(q => {
    if (!q || typeof q !== 'object') return q;
    const copy = { ...q };
    if (Object.prototype.hasOwnProperty.call(q, answerProp)) {
      try {
        copy[answerProp] = deobfuscate(q[answerProp], key);
      } catch (e) {
        // If deobfuscation fails, leave the value as-is to avoid crashing the app
        copy[answerProp] = q[answerProp];
      }
    }
    return copy;
  });
}

// Default export for convenience
export default {
  obfuscate,
  deobfuscate,
  obfuscateQuestionAnswers,
  deobfuscateQuestionAnswers,
};
