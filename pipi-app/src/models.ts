export type TDiceRolls = (number[] | null)[] | 'ERROR';

export interface IRollResult {
    id: number;
    expression: string;
    total: number | 'ERROR';
    rolls: TDiceRolls;
    timestamp: string;
    name: string | undefined;
    breakdown?: string;
};

export interface IRoll {
    id: number;
    name: string;
    expression: string;
}