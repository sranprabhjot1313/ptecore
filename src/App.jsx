import { useState } from 'react';
import PracticeScreen from './PracticeScreen.jsx';
import ManageWordsScreen from './ManageWordsScreen.jsx';
import './App.css';

function App() {
  const [screen, setScreen] = useState('practice');

  return (
    <div className="app-container">
      <nav className="main-nav">
        <button
          className={screen === 'practice' ? 'active' : ''}
          onClick={() => setScreen('practice')}
        >
          Practice
        </button>
        <button
          className={screen === 'manage' ? 'active' : ''}
          onClick={() => setScreen('manage')}
        >
          Manage Words
        </button>
      </nav>
      <main>
        {screen === 'practice' ? <PracticeScreen /> : <ManageWordsScreen />}
      </main>
    </div>
  );
}

export default App;
