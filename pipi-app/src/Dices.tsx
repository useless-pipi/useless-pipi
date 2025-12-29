import {
  tokenize,
  rollDice,
  tallyRolls,
  calculateFinalResult,
} from '@airjp73/dice-notation';
import type { IRollResult } from './models';
import { LOCAL_STORAGE_ROLL_HISTORY } from './constants/constants';
import { useLocalStorage } from './hooks/hooks';
import { STYLE_BUTTON_2ND } from './styles/styles';


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
            <button className={STYLE_BUTTON_2ND} onClick={() => handleRoll('3d6 + 7')}>
                3d6 + 7
            </button>
            <button className={STYLE_BUTTON_2ND} onClick={() => handleRoll('5d12')}>
                5d12
            </button>
            <button className={STYLE_BUTTON_2ND} onClick={() => handleRoll('4d6')}>
                4d6
            </button>
            <button className={STYLE_BUTTON_2ND} onClick={() => handleRoll('10d4+20')}>
                10d4+20
            </button>

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