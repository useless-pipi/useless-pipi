import {
  tokenize,
  rollDice,
  tallyRolls,
  calculateFinalResult,
} from '@airjp73/dice-notation';
import type { IRoll, IRollResult } from './models';
import { LOCAL_STORAGE_ROLL_HISTORY, LOCAL_STORAGE_ROLLS } from './constants/constants';
import { useLocalStorage } from './hooks/hooks';
import { STYLE_BUTTON_2ND } from './styles/styles';
import { useEffect } from 'react';


const MAX_HISTORY = 10;
const initRolls: IRoll[] = [
    {
        id: 0,
        name: 'Claw',
        expression: '3d6+7',
    },
    {
        id: 1,
        name: 'Crackling Wave',
        expression: '5d12',
    },
    {
        id: 2,
        name: 'Witch Strike',
        expression: '4d6',
    },
    {
        id: 3,
        name: 'Sake',
        expression: '10d4+20',
    },
]

function Dices(){

    // const [rollHistory, setRollHistory] = useState(() : IRollResult[] => []);
    const [rollHistory, setRollHistory] = useLocalStorage<IRollResult[]>(LOCAL_STORAGE_ROLL_HISTORY, [])
    const [rolls, setRolls] = useLocalStorage<IRoll[]>(LOCAL_STORAGE_ROLLS, [])

    useEffect(() => setRolls(initRolls))

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
            {/* <button className={STYLE_BUTTON_2ND} onClick={() => handleRoll('3d6+7')}>
                3d6+7
            </button>
            <button className={STYLE_BUTTON_2ND} onClick={() => handleRoll('5d12')}>
                5d12
            </button>
            <button className={STYLE_BUTTON_2ND} onClick={() => handleRoll('4d6')}>
                4d6
            </button>
            <button className={STYLE_BUTTON_2ND} onClick={() => handleRoll('10d4+20')}>
                10d4+20
            </button> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-row-dense gap-4">
            {
                rolls.map((roll) => (
                    <>
                        <button className={STYLE_BUTTON_2ND} onClick={() => handleRoll(roll.expression)}>
                            <strong>{roll.name}</strong> ({roll.expression})
                        </button>
                    </>
                ))
            }
            </div>

            <p className="my-4"> Result is {rollHistory.at(0)?.total}  </p>

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
                            <>
                                <tr className="bg-neutral-primary border-b border-default">
                                    <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                                        #{index+1}
                                    </th>
                                    <td className="px-6 py-4">
                                        <strong>{roll.total}</strong> 
                                    </td>
                                    <td className="px-6 py-4">
                                        {roll.expression}
                                    </td>
                                </tr>
                            </>
                            ))}
                            
                       
                    </tbody>
                </table>
            </div>
            <button onClick={() => setRollHistory([])}>
                Clear History
            </button>
      </div>
    </>
}

export default Dices