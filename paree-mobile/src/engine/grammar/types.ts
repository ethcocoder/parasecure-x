export type ProtocolLayer = 'IP' | 'TCP' | 'UDP' | 'HTTP' | 'DNS' | 'SST_INTERNAL';

export interface Token {
    type: string;
    value: string;
    position: number;
}

export interface GrammarRule {
    field: string;
    type: 'enum' | 'regex' | 'range' | 'structural';
    options?: string[];
    pattern?: string;
    min?: number;
    max?: number;
}

export interface IGrammar {
    layer: ProtocolLayer;
    getRules(): GrammarRule[];
    validate(tokens: Token[]): boolean;
}

export interface StateTransition {
    from: string;
    to: string;
    probability: number;
}
