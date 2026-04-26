import React, { useState, useRef } from 'react';
import {
  addWrongWord,
  getCycle,
  getPosition,
  getWords,
  getWrongCycle,
  getWrongPosition,
  getWrongWords,
  saveCycle,
  savePosition,
  saveWrongCycle,
  saveWrongPosition,
} from './storage';

function shuffle(arr) {
  // Fisher-Yates shuffle
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speakWord(word) {
  if (!window.speechSynthesis) return;
  const utter = new window.SpeechSynthesisUtterance(word);
  utter.lang = 'en-US';
  window.speechSynthesis.speak(utter);
}

function getPracticeConfig(mode) {
  if (mode === 'wrong') {
    return {
      title: 'Practice Wrong Words',
      emptyMessage: 'Wrong words will appear here after you miss them in practice.',
      getSourceWords: getWrongWords,
      getStoredCycle: getWrongCycle,
      saveStoredCycle: saveWrongCycle,
      getStoredPosition: getWrongPosition,
      saveStoredPosition: saveWrongPosition,
    };
  }

  return {
    title: 'Practice Spelling',
    emptyMessage: 'Add words in Manage Words to start practicing.',
    getSourceWords: getWords,
    getStoredCycle: getCycle,
    saveStoredCycle: saveCycle,
    getStoredPosition: getPosition,
    saveStoredPosition: savePosition,
  };
}

function PracticeScreen({ mode = 'all' }) {
  const config = getPracticeConfig(mode);
  const [wrongCount, setWrongCount] = useState(() => getWrongWords().length);
  const [words] = useState(() => config.getSourceWords());
  const [cycle, setCycle] = useState(() => {
    const storedWords = config.getSourceWords();
    const storedCycle = config.getStoredCycle();
    if (!storedCycle || storedCycle.length !== storedWords.length || storedWords.length === 0) {
      const newCycle = shuffle(storedWords);
      config.saveStoredCycle(newCycle);
      config.saveStoredPosition(0);
      return newCycle;
    }
    return storedCycle;
  });
  const [pos, setPos] = useState(() => {
    const storedWords = config.getSourceWords();
    const storedCycle = config.getStoredCycle();
    if (!storedCycle || storedCycle.length !== storedWords.length || storedWords.length === 0) {
      return 0;
    }
    const storedPosition = config.getStoredPosition();
    return storedPosition >= 0 && storedPosition < storedCycle.length ? storedPosition : 0;
  });
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle, correct, incorrect
  const inputRef = useRef();

  if (!words.length) {
    return <div className="practice-screen"><h2>{config.title}</h2><p>{config.emptyMessage}</p></div>;
  }

  const currentWord = cycle[pos];
  const total = cycle.length;
  const currentNum = pos + 1;

  const handlePlay = () => {
    speakWord(currentWord);
  };

  const handleCheck = () => {
    if (input.trim().toLowerCase() === currentWord.toLowerCase()) {
      setStatus('correct');
    } else {
      const updatedWrongWords = addWrongWord(currentWord);
      setWrongCount(updatedWrongWords.length);
      setStatus('incorrect');
    }
  };

  const handleNext = () => {
    let nextPos = pos + 1;
    let newCycle = cycle;
    if (nextPos >= total) {
      // New cycle
      newCycle = shuffle(words);
      nextPos = 0;
      config.saveStoredCycle(newCycle);
    }
    setCycle(newCycle);
    setPos(nextPos);
    config.saveStoredPosition(nextPos);
    setInput('');
    setStatus('idle');
    setTimeout(() => {
      speakWord(newCycle[nextPos]);
      inputRef.current && inputRef.current.focus();
    }, 300);
  };

  const handleRepeat = () => {
    speakWord(currentWord);
  };

  return (
    <div className="practice-screen">
      <h2>{config.title}</h2>
      {mode !== 'wrong' && (
        <div className="wrong-words-summary">
          Wrong words saved: {wrongCount}
        </div>
      )}
      <div className="practice-controls">
        <button onClick={handlePlay}>Play Word</button>
        <button onClick={handleRepeat}>Repeat Word</button>
      </div>
      <form onSubmit={e => { e.preventDefault(); handleCheck(); }} className="practice-form">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type the spelling"
          autoComplete="off"
          disabled={status === 'correct'}
        />
        <button type="submit" disabled={status === 'correct'}>Check Answer</button>
      </form>
      {status === 'correct' && <div className="feedback correct">Correct!</div>}
      {status === 'incorrect' && (
        <div className="feedback incorrect">
          Incorrect. Correct spelling: <strong>{currentWord}</strong>
        </div>
      )}
      <button className="next-btn" onClick={handleNext}>Next Word</button>
      <div className="progress">Word {currentNum} of {total} in current cycle</div>
      <div className="cycle-status">{pos + 1 > total ? 'Cycle complete! Starting new cycle.' : ''}</div>
    </div>
  );
}

export default PracticeScreen;
