import React, { useState, useEffect, useRef } from 'react';
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
  const [words, setWords] = useState([]);
  const [cycle, setCycle] = useState([]);
  const [pos, setPos] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle, correct, incorrect
  const [showAnswer, setShowAnswer] = useState(false);
  const inputRef = useRef();

  // Load words, cycle, and position
  useEffect(() => {
    const w = getWords();
    setWords(w);
    let c = getCycle();
    let p = getPosition();
    // If no cycle or cycle is invalid, create new
    if (!c || c.length !== w.length || w.length === 0) {
      c = shuffle(w);
      p = 0;
      saveCycle(c);
      savePosition(0);
    }
    setCycle(c);
    setPos(p);
    setInput('');
    setStatus('idle');
    setShowAnswer(false);
  }, []);

  // If words change, reset cycle
  useEffect(() => {
    if (words.length && (cycle.length !== words.length)) {
      const c = shuffle(words);
      setCycle(c);
      setPos(0);
      saveCycle(c);
      savePosition(0);
      setInput('');
      setStatus('idle');
      setShowAnswer(false);
    }
  }, [words]);

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
      setShowAnswer(false);
    } else {
      setStatus('incorrect');
      setShowAnswer(true);
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
    setShowAnswer(false);
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
