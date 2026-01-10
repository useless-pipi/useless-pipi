export interface IRollResult {
    id: number;
    expression: string;
    total: any;
    rolls: any;
    timestamp: string;
    name: string | undefined;
};

export interface IRoll {
    id: number;
    name: string;
    expression: string;
}