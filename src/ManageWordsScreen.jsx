import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { getWords, saveWords } from './storage';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

function extractWordsFromText(text) {
  const normalizedText = text
    .replace(/-\s*\n\s*/g, '')
    .replace(/\s+/g, ' ');

  return (normalizedText.match(/[A-Za-z]+(?:[-'][A-Za-z]+)?/g) || [])
    .map(word => word.replace(/^[-']+|[-']+$/g, '').trim())
    .filter(word => word.length > 1 && word.length <= 32);
}

function getTextItemPosition(item) {
  const transform = item.transform || [1, 0, 0, 1, 0, 0];
  const fontSize = Math.hypot(transform[0], transform[1]) || item.height || 10;

  return {
    text: item.str || '',
    x: transform[4] || 0,
    y: transform[5] || 0,
    width: item.width || 0,
    fontSize,
  };
}

function buildPageText(items) {
  const textItems = items
    .filter(item => item.str && item.str.trim())
    .map(getTextItemPosition)
    .sort((a, b) => b.y - a.y || a.x - b.x);

  const lines = [];

  textItems.forEach(item => {
    const yTolerance = Math.max(2, item.fontSize * 0.45);
    let line = lines.find(existing => Math.abs(existing.y - item.y) <= yTolerance);

    if (!line) {
      line = { y: item.y, items: [] };
      lines.push(line);
    }

    line.items.push(item);
  });

  return lines
    .sort((a, b) => b.y - a.y)
    .map(line => {
      const sortedItems = line.items.sort((a, b) => a.x - b.x);

      return sortedItems.reduce((lineText, item, index) => {
        if (index === 0) return item.text;

        const previous = sortedItems[index - 1];
        const previousEnd = previous.x + previous.width;
        const gap = item.x - previousEnd;
        const shouldAddSpace = gap > Math.max(1.5, item.fontSize * 0.3);

        return `${lineText}${shouldAddSpace ? ' ' : ''}${item.text}`;
      }, '');
    })
    .join('\n');
}

function ManageWordsScreen() {
  const [words, setWords] = useState(() => getWords());
  const [newWord, setNewWord] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

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

  const handlePdfImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please choose a PDF file.');
      setImportStatus('');
      e.target.value = '';
      return;
    }

    setIsImporting(true);
    setError('');
    setImportStatus(`Reading ${file.name}...`);

    try {
      const data = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      const extractedWords = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = buildPageText(textContent.items);
        extractedWords.push(...extractWordsFromText(pageText));
      }

      const seen = new Set(words.map(word => word.toLowerCase()));
      const wordsToAdd = [];

      extractedWords.forEach(word => {
        const key = word.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          wordsToAdd.push(word);
        }
      });

      if (wordsToAdd.length === 0) {
        setImportStatus(`No new words found in ${file.name}.`);
        return;
      }

      const updated = [...words, ...wordsToAdd];
      setWords(updated);
      saveWords(updated);
      setImportStatus(`Added ${wordsToAdd.length} word${wordsToAdd.length === 1 ? '' : 's'} from ${file.name}.`);
    } catch (err) {
      console.error(err);
      setError('Could not read that PDF. Please try another file.');
      setImportStatus('');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
      <div className="pdf-import">
        <label htmlFor="pdf-upload">Add words from PDF</label>
        <input
          ref={fileInputRef}
          id="pdf-upload"
          type="file"
          accept="application/pdf,.pdf"
          onChange={handlePdfImport}
          disabled={isImporting}
        />
      </div>
      {error && <div className="error-msg">{error}</div>}
      {importStatus && <div className="import-msg">{importStatus}</div>}
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
