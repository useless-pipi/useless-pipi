export interface IRollResult {
    id: number;
    expression: string;
    total: any;
    rolls: any;
    timestamp: string;
};

export interface IRoll {
    id: number;
    name: string;
    expression: string;
}