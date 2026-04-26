// Utility for localStorage-based spelling data and progress
export const STORAGE_KEYS = {
  WORDS: 'spelling_words',
  CYCLE: 'spelling_cycle',
  POSITION: 'spelling_position',
  WRONG_WORDS: 'spelling_wrong_words',
  WRONG_CYCLE: 'spelling_wrong_cycle',
  WRONG_POSITION: 'spelling_wrong_position',
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

export function getWrongWords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.WRONG_WORDS) || '[]');
}

export function saveWrongWords(words) {
  localStorage.setItem(STORAGE_KEYS.WRONG_WORDS, JSON.stringify(words));
}

export function addWrongWord(word) {
  const wrongWords = getWrongWords();
  const alreadySaved = wrongWords.some(savedWord => savedWord.toLowerCase() === word.toLowerCase());

  if (alreadySaved) {
    return wrongWords;
  }

  const updated = [...wrongWords, word];
  saveWrongWords(updated);
  return updated;
}

export function getWrongCycle() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.WRONG_CYCLE) || '[]');
}

export function saveWrongCycle(cycle) {
  localStorage.setItem(STORAGE_KEYS.WRONG_CYCLE, JSON.stringify(cycle));
}

export function getWrongPosition() {
  return Number(localStorage.getItem(STORAGE_KEYS.WRONG_POSITION) || '0');
}

export function saveWrongPosition(pos) {
  localStorage.setItem(STORAGE_KEYS.WRONG_POSITION, String(pos));
}

export function resetAll() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
