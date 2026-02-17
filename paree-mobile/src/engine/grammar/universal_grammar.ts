import { IGrammar, Token, ProtocolLayer } from './types';
import { HTTPGrammar } from './http_grammar';

// Placeholder for future expansion
class TCPGrammar implements IGrammar {
    layer: ProtocolLayer = 'TCP';
    getRules() { return []; }
    validate(tokens: Token[]) { return true; } // TODO: Implement TCP state machine
}

class IPGrammar implements IGrammar {
    layer: ProtocolLayer = 'IP';
    getRules() { return []; }
    validate(tokens: Token[]) { return true; } // TODO: Implement IP header checks
}

export class UniversalGrammarRegistry {
    private registry: Map<ProtocolLayer, IGrammar>;

    constructor() {
        this.registry = new Map();
        this.registry.set('HTTP', new HTTPGrammar());
        this.registry.set('TCP', new TCPGrammar());
        this.registry.set('IP', new IPGrammar());
    }

    getGrammar(layer: ProtocolLayer): IGrammar | undefined {
        return this.registry.get(layer);
    }

    /**
     * validates a multi-layer packet structure
     * For prototype, we focus mainly on the Application Layer (HTTP)
     */
    validatePacket(tokens: Token[], layer: ProtocolLayer = 'HTTP'): boolean {
        const grammar = this.getGrammar(layer);
        if (!grammar) return false;
        return grammar.validate(tokens);
    }
}
