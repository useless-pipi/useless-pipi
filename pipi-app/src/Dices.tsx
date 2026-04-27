import {
  tokenize,
  rollDice,
  tallyRolls,
  calculateFinalResult,
} from '@airjp73/dice-notation';
import type { IRoll, IRollResult, TDiceRolls } from './models';
import { LOCAL_STORAGE_ROLL_HISTORY, LOCAL_STORAGE_ROLLS } from './constants/constants';
import { useLocalStorage } from './hooks/hooks';
import { STYLE_BUTTON_2ND, STYLE_BUTTON_DANGER } from './styles/styles';
import { Fragment, useEffect, useState } from 'react';

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
        expression: '2d6',
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

const isDiceRolls = (value: TDiceRolls | unknown): value is (number[] | null)[] => {
    return Array.isArray(value);
};

const isConstantToken = (token: { type: string; detailType?: string }) => {
    return token.type === 'DiceRoll' && token.detailType === '_Constant';
};

const formatRollGroup = (dieRolls: number[]) => {
    if (dieRolls.length === 0) {
        return '';
    }

    return dieRolls.length > 1 ? `{${dieRolls.join('+')}}` : `{${dieRolls[0]}}`;
};

const buildRollBreakdown = (expression: string, rolls: TDiceRolls) => {
    try {
        if (!isDiceRolls(rolls)) {
            return {
                inline: expression,
                details: [] as string[],
            };
        }

        const tokens = tokenize(expression);
        const details: string[] = [];

        const inline = tokens.map((token, index) => {
            if (token.type === 'DiceRoll') {
                if (isConstantToken(token)) {
                    return token.content;
                }

                const tokenRolls = rolls[index];

                if (Array.isArray(tokenRolls) && tokenRolls.length > 0) {
                    const sum = tokenRolls.reduce((acc, value) => acc + value, 0);
                    details.push(`${token.content} → [${tokenRolls.join(', ')}] = ${sum}`);
                    return formatRollGroup(tokenRolls);
                }

                return token.content;
            }

            if (token.type === 'Operator') {
                return ` ${token.content} `;
            }

            return token.content;
        }).join('').replace(/\s+/g, ' ').trim();

        return { inline, details };
    }
    catch (error) {
        console.error('func [buildRollBreakdown]', error);
        return {
            inline: expression,
            details: [] as string[],
        };
    }
};

function Dices(){

    // const [rollHistory, setRollHistory] = useState(() : IRollResult[] => []);
    const [rollHistory, setRollHistory] = useLocalStorage<IRollResult[]>(LOCAL_STORAGE_ROLL_HISTORY, initRollHistories)
    const [rolls, setRolls] = useLocalStorage<IRoll[]>(LOCAL_STORAGE_ROLLS, [])
    const [rolls2, setRolls2] = useLocalStorage<IRoll[]>(LOCAL_STORAGE_ROLLS, [])

    const [rollExpr, setRollExpr] = useState<string>(() => '')
    const [rollName, setRollName] = useState<string>(() => '')

    const [customRolls, setCustomRolls] = useState<IRoll[]>(() => [])
    const latestRoll = rollHistory.at(0)
    const [latestExpanded, setLatestExpanded] = useState<boolean>(true)
    const [expandedHistoryIds, setExpandedHistoryIds] = useState<number[]>([])

    const latestBreakdown = latestRoll ? buildRollBreakdown(latestRoll.expression, latestRoll.rolls) : null

    useEffect(() => {
        setRolls(initRolls)
        setRolls2(initRolls2)
    }, [])

    useEffect(() => {
        if (latestRoll) {
            setLatestExpanded(true)
        }
    }, [latestRoll?.id])

    const handleRoll = (iRoll: IRoll) => {
        try {
            const diceExpr = iRoll.expression
            const tokens = tokenize(diceExpr);
            const rolls = rollDice(tokens);
            const rollTotals = tallyRolls(tokens, rolls);
            const result = calculateFinalResult(tokens, rollTotals);
            const breakdown = buildRollBreakdown(diceExpr, rolls).inline;
            
            const newRoll = {
                id: Date.now(),
                expression: diceExpr,
                total: result,
                rolls: rolls,
                timestamp: new Date().toLocaleTimeString(),
                name: iRoll.name,
                breakdown,
            };

            setRollHistory(prev => {
                const updated = [newRoll, ...prev]
                return updated.length > MAX_HISTORY ? updated.slice(0, MAX_HISTORY) : updated;
            });

        }
        catch (error) {
            console.error('func [handleRoll]', error);
            const errRoll: IRollResult = {
                id: Date.now(),
                expression: iRoll.expression,
                total: 'ERROR',
                rolls: 'ERROR',
                timestamp: new Date().toLocaleTimeString(),
                name: iRoll.name,
                breakdown: iRoll.expression,
            };
            setRollHistory(prev => [errRoll, ...prev]);
        }
    }

    const toggleHistoryExpanded = (rollId: number) => {
        setExpandedHistoryIds((prev) => {
            if (prev.includes(rollId)) {
                return prev.filter((id) => id !== rollId)
            }

            return [...prev, rollId]
        })
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

                {latestRoll && (
                    <div className="mt-3">
                        <button className={STYLE_BUTTON_2ND} onClick={() => setLatestExpanded((prev) => !prev)}>
                            {latestExpanded ? 'Collapse breakdown' : 'Expand breakdown'}
                        </button>

                        {latestExpanded && latestBreakdown && (
                            <div className="mt-3 rounded-base border border-default bg-neutral-primary-soft p-3 text-left">
                                <p className="font-medium text-heading">
                                    {latestBreakdown.inline} = {latestRoll.total}
                                </p>

                                {latestBreakdown.details.length > 0 && (
                                    <ul className="mt-2 list-disc pl-5 text-sm text-body">
                                        {latestBreakdown.details.map((detail) => (
                                            <li key={detail}>{detail}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                )}
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
                            <th scope="col" className="px-6 py-3 font-medium">
                                Breakdown
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                            {rollHistory.map((roll, index) => {
                                const isExpanded = expandedHistoryIds.includes(roll.id)
                                const breakdown = buildRollBreakdown(roll.expression, roll.rolls)

                                return (
                                    <Fragment key={roll.id}>
                                        <tr className="bg-neutral-primary border-b border-default">
                                            <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                                                #{index+1} {roll.name?.slice(0,5)}
                                            </th>
                                            <td className="px-6 py-4">
                                                <strong>{roll.total}</strong> 
                                            </td>
                                            <td className="px-6 py-4">
                                                {roll.expression}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className={STYLE_BUTTON_2ND} onClick={() => toggleHistoryExpanded(roll.id)}>
                                                    {isExpanded ? 'Hide' : 'Show'}
                                                </button>
                                            </td>
                                        </tr>

                                        {isExpanded && (
                                            <tr className="bg-neutral-primary-soft border-b border-default">
                                                <td colSpan={4} className="px-6 py-4">
                                                    <p className="font-medium text-heading">
                                                        {breakdown.inline} = {roll.total}
                                                    </p>

                                                    {breakdown.details.length > 0 && (
                                                        <ul className="mt-2 list-disc pl-5 text-sm text-body">
                                                            {breakdown.details.map((detail) => (
                                                                <li key={`${roll.id}-${detail}`}>{detail}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                )
                            })}
                            
                       
                    </tbody>
                </table>
            </div>
      </div>
    </>
}

export default Dices