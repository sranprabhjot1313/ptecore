import React, { useState, useRef } from 'react';
import { getWords, getCycle, saveCycle, getPosition, savePosition } from './storage';

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

function PracticeScreen() {
  const [words] = useState(() => getWords());
  const [cycle, setCycle] = useState(() => {
    const storedWords = getWords();
    const storedCycle = getCycle();
    if (!storedCycle || storedCycle.length !== storedWords.length || storedWords.length === 0) {
      const newCycle = shuffle(storedWords);
      saveCycle(newCycle);
      savePosition(0);
      return newCycle;
    }
    return storedCycle;
  });
  const [pos, setPos] = useState(() => {
    const storedWords = getWords();
    const storedCycle = getCycle();
    if (!storedCycle || storedCycle.length !== storedWords.length || storedWords.length === 0) {
      return 0;
    }
    return getPosition();
  });
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle, correct, incorrect
  const inputRef = useRef();

  if (!words.length) {
    return <div className="practice-screen"><h2>Practice Spelling</h2><p>Add words in Manage Words to start practicing.</p></div>;
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
      saveCycle(newCycle);
    }
    setCycle(newCycle);
    setPos(nextPos);
    savePosition(nextPos);
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
      <h2>Practice Spelling</h2>
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
