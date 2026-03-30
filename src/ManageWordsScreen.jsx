import React, { useState, useEffect } from 'react';
import { getWords, saveWords } from './storage';

function ManageWordsScreen() {
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setWords(getWords());
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    const word = newWord.trim();
    if (!word) {
      setError('Word cannot be empty.');
      return;
    }
    if (words.some(w => w.toLowerCase() === word.toLowerCase())) {
      setError('Duplicate word.');
      return;
    }
    const updated = [...words, word];
    setWords(updated);
    saveWords(updated);
    setNewWord('');
    setError('');
  };

  const handleDelete = (idx) => {
    const updated = words.filter((_, i) => i !== idx);
    setWords(updated);
    saveWords(updated);
    setError('');
  };

  const handleEdit = (idx) => {
    setEditIndex(idx);
    setEditValue(words[idx]);
    setError('');
  };

  const handleEditSave = (idx) => {
    const word = editValue.trim();
    if (!word) {
      setError('Word cannot be empty.');
      return;
    }
    if (words.some((w, i) => w.toLowerCase() === word.toLowerCase() && i !== idx)) {
      setError('Duplicate word.');
      return;
    }
    const updated = words.map((w, i) => (i === idx ? word : w));
    setWords(updated);
    saveWords(updated);
    setEditIndex(null);
    setEditValue('');
    setError('');
  };

  return (
    <div className="manage-words-screen">
      <h2>Manage Words</h2>
      <form onSubmit={handleAdd} className="add-word-form">
        <input
          type="text"
          value={newWord}
          onChange={e => setNewWord(e.target.value)}
          placeholder="Enter new word"
          maxLength={32}
        />
        <button type="submit">Add</button>
      </form>
      {error && <div className="error-msg">{error}</div>}
      <ul className="words-list">
        {words.length === 0 && <li>No words saved yet.</li>}
        {words.map((word, idx) => (
          <li key={idx}>
            {editIndex === idx ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  maxLength={32}
                />
                <button onClick={() => handleEditSave(idx)}>Save</button>
                <button onClick={() => setEditIndex(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span>{word}</span>
                <button onClick={() => handleEdit(idx)}>Edit</button>
                <button onClick={() => handleDelete(idx)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="words-count">Total words: {words.length}</div>
    </div>
  );
}

export default ManageWordsScreen;
