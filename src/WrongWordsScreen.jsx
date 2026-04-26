import React, { useState } from 'react';
import { getWrongWords, saveWrongWords } from './storage';

function WrongWordsScreen() {
  const [wrongWords, setWrongWords] = useState(() => getWrongWords());

  const handleDelete = (idx) => {
    const updated = wrongWords.filter((_, i) => i !== idx);
    setWrongWords(updated);
    saveWrongWords(updated);
  };

  const handleClear = () => {
    setWrongWords([]);
    saveWrongWords([]);
  };

  return (
    <div className="wrong-words-screen">
      <h2>Wrong Words</h2>
      {wrongWords.length === 0 ? (
        <p>No wrong words saved yet.</p>
      ) : (
        <>
          <ul className="words-list">
            {wrongWords.map((word, idx) => (
              <li key={`${word}-${idx}`}>
                <span>{word}</span>
                <button onClick={() => handleDelete(idx)}>Delete</button>
              </li>
            ))}
          </ul>
          <button className="clear-wrong-btn" onClick={handleClear}>Clear All</button>
        </>
      )}
      <div className="words-count">Total wrong words: {wrongWords.length}</div>
    </div>
  );
}

export default WrongWordsScreen;
