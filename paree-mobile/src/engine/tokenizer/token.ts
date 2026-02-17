import { ProtocolLayer } from '../grammar/types';

export class Token {
    constructor(
        public type: string,
        public value: string,
        public position: number,
        public layer: ProtocolLayer = 'HTTP'
    ) { }
}
