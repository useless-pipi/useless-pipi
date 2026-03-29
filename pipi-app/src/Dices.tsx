import {
  tokenize,
  rollDice,
  tallyRolls,
  calculateFinalResult,
} from '@airjp73/dice-notation';
import type { IRoll, IRollResult } from './models';
import { LOCAL_STORAGE_ROLL_HISTORY, LOCAL_STORAGE_ROLLS } from './constants/constants';
import { useLocalStorage } from './hooks/hooks';
import { STYLE_BUTTON_2ND, STYLE_BUTTON_DANGER } from './styles/styles';
import { useEffect, useState } from 'react';

const MAX_HISTORY = 10;
const EMPTY_HISTORY: IRollResult[] = [];
const initRolls: IRoll[] = [
    {
        id: 0,
        name: 'Claw (Force+Prone)',
        expression: '3d6+7',
    },
    {
        id: 1,
        name: 'Crackling Wave (Lightning + No Reaction)',
        expression: '5d12',
    },
    {
        id: 2,
        name: 'Witch Strike (Lightning)',
        expression: '4d6',
    },
]

const initRolls2: IRoll[] = [
    {
        id: 3,
        name: 'Dire Worg Bite (Piercing)',
        expression: '2d8+6',
    },
    {
        id: 4,
        name: 'Dire Worg Bite (Poison + Poisoned)',
        expression: '2d8+6',
    },
    {
        id: 5,
        name: 'Rotting Fist (Bludgeoning)',
        expression: '2d10+5',
    },
    {
        id: 6,
        name: 'Rotting Fist (Necrotic + Curse)',
        expression: '3d6',
    },
    {
        id: 7,
        name: 'Channel Neg Energy (Necrotic)',
        expression: '8d6+5',
    },
    {
        id: 8,
        name: 'Dreadful Glare (Psychic + Paralyzed)',
        expression: '8d6+5',
    },
]

const initRollHistories: IRollResult[] = EMPTY_HISTORY;

function Dices(){

    // const [rollHistory, setRollHistory] = useState(() : IRollResult[] => []);
    const [rollHistory, setRollHistory] = useLocalStorage<IRollResult[]>(LOCAL_STORAGE_ROLL_HISTORY, initRollHistories)
    const [rolls, setRolls] = useLocalStorage<IRoll[]>(LOCAL_STORAGE_ROLLS, [])
    const [rolls2, setRolls2] = useLocalStorage<IRoll[]>(LOCAL_STORAGE_ROLLS, [])

    const [rollExpr, setRollExpr] = useState<string>(() => '')
    const [rollName, setRollName] = useState<string>(() => '')

    const [customRolls, setCustomRolls] = useState<IRoll[]>(() => [])
    const latestRoll = rollHistory.at(0)

    useEffect(() => {
        setRolls(initRolls)
        setRolls2(initRolls2)
    }, [])

    const handleRoll = (iRoll: IRoll) => {
        try {
            const diceExpr = iRoll.expression
            const tokens = tokenize(diceExpr);
            const rolls = rollDice(tokens);
            const rollTotals = tallyRolls(tokens, rolls);
            const result = calculateFinalResult(tokens, rollTotals);
            
            const newRoll = {
                id: Date.now(),
                expression: diceExpr,
                total: result,
                rolls: rolls,
                timestamp: new Date().toLocaleTimeString(),
                name: iRoll.name,
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
                expression: iRoll.expression,
                total: 'ERROR',
                rolls: 'ERROR',
                timestamp: new Date().toLocaleTimeString(),
                name: iRoll.name
            };
            setRollHistory(prev => [errRoll, ...prev]);
        }
    }

    const handleRollExprChange = (event: any)  => {
        // Update the state with the new value from the input field
        setRollExpr(event.target.value);
    };

    const handleRollNameChange = (event: any)  => {
        // Update the state with the new value from the input field
        setRollName(event.target.value);
    };

    const addCustomDie = () => {
        const aRoll: IRoll = {
            id: Date.now(),
            name: rollName,
            expression: rollExpr,
        }
        setCustomRolls((prev) => [...prev, aRoll])
        setRollExpr('')
        setRollName('')
    }

    const deleteCustomRoll = (roll: IRoll) => {
        console.log(customRolls)
        setCustomRolls(customRolls.filter(customRolls => customRolls.id !== roll.id));
        console.log(customRolls)
    }

    return <>
        <div className="card">
            { // make the div not transpaent in background, and make it look like a card with shadow and rounded corners
            }
            <div className="sticky top-4 z-10 my-4 rounded-base border-2 border-default bg-stone-500 p-4 shadow-xs">
                <p className="text-sm text-body">Latest result</p>
                <p className="my-2 text-4xl font-bold text-heading">
                    {latestRoll?.total ?? '--'}
                </p>
                <p className="text-sm text-body">
                    {latestRoll ? (
                        <>
                            <strong>{latestRoll.name}</strong> ({latestRoll.expression}) at {latestRoll.timestamp}
                        </>
                    ) : (
                        'Click any dice button to roll.'
                    )}
                </p>
            </div>

            <div className="my-4  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-row-dense gap-4 border-2 border-default rounded-base p-4">
            {
                rolls.map((roll) => (
                    <button key={roll.id} className={STYLE_BUTTON_2ND} onClick={() => handleRoll(roll)}>
                        <strong>{roll.name}</strong> ({roll.expression})
                    </button>
                ))
            }
            </div>

            <div className="my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-row-dense gap-4 border-2 border-default rounded-base p-4">
            {
                rolls2.map((roll) => (
                    <button key={roll.id} className={STYLE_BUTTON_2ND} onClick={() => handleRoll(roll)}>
                        <strong>{roll.name}</strong> ({roll.expression})
                    </button>
                ))
            }
            </div>

            <div className="my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-row-dense gap-4 border-2 border-default rounded-base p-4">
            {
                customRolls.map((roll) => (
                    <div key={roll.id} className='grid grid-cols-[4fr_1fr] gap-4'>
                        <button className={STYLE_BUTTON_2ND} onClick={() => handleRoll(roll)}>
                            <strong>{roll.name}</strong> ({roll.expression}) 
                        </button>
                        <button className={STYLE_BUTTON_DANGER} onClick={() => deleteCustomRoll(roll)}>
                            x
                        </button>
                    </div>
                ))
            }
            </div>

            <div className="my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-row-dense gap-4">
                <input type="text" id="diceExpression" 
                    className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body" 
                    value={rollName} onChange={handleRollNameChange}
                    placeholder="Dice Name i.e. Stirke" />
                <input type="text" id="diceExpression" 
                    className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body" 
                    value={rollExpr} onChange={handleRollExprChange}
                    placeholder="Dice Expr i.e. 4d8+2" />
                <button className={STYLE_BUTTON_2ND} onClick={() => addCustomDie()}>
                    Add Custom Dice
                </button>
            </div>

            <button onClick={() => setRollHistory(EMPTY_HISTORY)}>
                Clear History
            </button>

            <div className="my-4 relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
                <table className="w-full text-sm text-left rtl:text-right text-body">
                    <thead className="text-sm text-body bg-neutral-secondary-soft border-b rounded-base border-default">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-medium">
                                #
                            </th>
                            <th scope="col" className="px-6 py-3 font-medium">
                                Result
                            </th>
                            <th scope="col" className="px-6 py-3 font-medium">
                                Expression
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                            {rollHistory.map((roll, index) => (
                                <tr key={roll.id} className="bg-neutral-primary border-b border-default">
                                    <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                                        #{index+1} {roll.name?.slice(0,5)}
                                    </th>
                                    <td className="px-6 py-4">
                                        <strong>{roll.total}</strong> 
                                    </td>
                                    <td className="px-6 py-4">
                                        {roll.expression}
                                    </td>
                                </tr>
                            ))}
                            
                       
                    </tbody>
                </table>
            </div>
      </div>
    </>
}

export default Dices