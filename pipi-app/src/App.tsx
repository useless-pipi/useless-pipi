import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {
  tokenize,
  rollDice,
  tallyRolls,
  calculateFinalResult,
} from '@airjp73/dice-notation';
import type { IRollResult } from './models';

function App() {
  const [count, setCount] = useState(0)
  const [rollHistory, setRollHistory] = useState(() : IRollResult[] => []);

  const handleReload = () => {
    // This triggers a full page reload using the browser's built-in functionality.
    window.location.reload(); // Passing 'true' forces the page to reload from the server, not the browser cache.
  };

  const handleRoll = (diceExpr: string) => {
    try {
      const tokens = tokenize(diceExpr);
      const rolls = rollDice(tokens);
      const rollTotals = tallyRolls(tokens, rolls);
      const result = calculateFinalResult(tokens, rollTotals);
      
      const newRoll = {
        id: Date.now(),
        expression: diceExpr,
        total: result,
        rolls: rolls,
        timestamp: new Date().toLocaleTimeString()
      };

      setRollHistory(prev => [newRoll, ...prev]);

    }
    catch (error) {
      console.error('func [handleRoll]', error);
      const errRoll = {
        id: Date.now(),
        expression: diceExpr,
        total: 'ERROR',
        rolls: 'ERROR',
        timestamp: new Date().toLocaleTimeString()
      };
      setRollHistory(prev => [errRoll, ...prev]);
    }
  }

  return (
    <>
      <button onClick={handleReload} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Reload Page
      </button>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React ??</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div className="card">
        <button onClick={() => handleRoll('2d6 + 100')}>
          count is {count}
        </button>
        <ul>
            {rollHistory.map(roll => (
              <li key={roll.id}>
                <strong>{roll.timestamp}</strong>: {roll.total} 
              </li>
            ))}
          </ul>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
