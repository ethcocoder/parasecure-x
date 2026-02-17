from .mapping import MappingGenerator

class ReversibleEncoder:
    """
    Transforms token streams into an encoded representation.
    Ensures that the transformation is protocol-compliant and reversible.
    """
    
    def __init__(self, session_key, timestamp):
        self.session_key = session_key
        # Use a 5-minute window for deterministic mapping
        window = MappingGenerator.get_time_window(timestamp)

        self.generator = MappingGenerator(session_key, window)
        self.mappings = {} # token_type -> (forward, inverse)

    def _label(self, base_label):
        import hashlib
        h = hashlib.sha256(f"{self.session_key}:{base_label}".encode()).hexdigest()
        return f"T_{h[:6]}"

    def encode(self, tokens):
        from core.grammar.http_grammar import HTTPGrammar
        from core.tokenizer.token import Token
        
        encoded_tokens = []
        
        # Re-derive header context by looking at the logical order (simple for prototype)
        # In HTTP, after 3 tokens, we have Name/Value pairs
        for i, t in enumerate(tokens):
            base_type = None
            # Find which base type this token belongs to by checking labels
            for bt in ['METHOD', 'PATH', 'VERSION', 'HEADER_NAME', 'HEADER_VALUE']:
                if t.token_type == self._label(bt):
                    base_type = bt
                    break
            
            if not base_type:
                encoded_tokens.append(t)
                continue
                
            hname = None
            if base_type == 'HEADER_VALUE' and i > 0:
                # Assume previous token was the name
                hname = tokens[i-1].value
                
            vocab = HTTPGrammar.get_vocabulary(base_type, hname)
            encoded_value = self.generator.map_value(base_type, t.value, vocab)
            
            encoded_tokens.append(Token(t.token_type, encoded_value, t.position))
            
        return encoded_tokens



