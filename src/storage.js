// Utility for localStorage-based spelling data and progress
export const STORAGE_KEYS = {
  WORDS: 'spelling_words',
  CYCLE: 'spelling_cycle',
  POSITION: 'spelling_position',
  SESSION: 'spelling_session',
};

export function getWords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.WORDS) || '[]');
}

export function saveWords(words) {
  localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
}

export function getCycle() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CYCLE) || '[]');
}

export function saveCycle(cycle) {
  localStorage.setItem(STORAGE_KEYS.CYCLE, JSON.stringify(cycle));
}

export function getPosition() {
  return Number(localStorage.getItem(STORAGE_KEYS.POSITION) || '0');
}

export function savePosition(pos) {
  localStorage.setItem(STORAGE_KEYS.POSITION, String(pos));
}

export function resetAll() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
