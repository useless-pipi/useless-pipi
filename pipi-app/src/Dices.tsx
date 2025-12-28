import { useEffect, useState } from 'react';
import {
  tokenize,
  rollDice,
  tallyRolls,
  calculateFinalResult,
} from '@airjp73/dice-notation';
import type { IRollResult } from './models';
import { LOCAL_STORAGE_ROLL_HISTORY } from './constants/constants';
import { useLocalStorage } from './hooks/hooks';


const MAX_HISTORY = 10;

function Dices(){

    // const [rollHistory, setRollHistory] = useState(() : IRollResult[] => []);
    const [rollHistory, setRollHistory] = useLocalStorage<IRollResult[]>(LOCAL_STORAGE_ROLL_HISTORY, [])

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

            setRollHistory(prev => {
                const updated = [newRoll, ...prev]
                return updated.length > MAX_HISTORY ? updated.slice(0, MAX_HISTORY) : updated;
            });

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

    return <>
        <div className="card">
            <button onClick={() => handleRoll('2d6 + 100')}>
                result is {rollHistory.at(0)?.total}
            </button>
            <ul>
                {rollHistory.map((roll, index) => (
                <li key={roll.id}>
                    <strong>#{index+1}</strong>: {roll.total} 
                </li>
                ))}
            </ul>
            <button onClick={() => setRollHistory([])}>
                Clear History
            </button>
      </div>
    </>
}

export default Dices