from .mapping import MappingGenerator
from ml.wrapper import SSTWrapper

class ReversibleEncoder:
    """
    Transforms token streams into an encoded representation.
    Ensures that the transformation is protocol-compliant and reversible.
    Uses a hybrid neural-procedural approach for structural obfuscation.
    """
    
    def __init__(self, session_key, timestamp):
        self.session_key = session_key
        # Use a 5-minute window for deterministic mapping
        window = MappingGenerator.get_time_window(timestamp)

        self.generator = MappingGenerator(session_key, window)
        self.mappings = {} # token_type -> (forward, inverse)
        self.sst = SSTWrapper()
        self.history = [] # Tracks (base_type, original_value) for neural context

    def _label(self, base_label):
        import hashlib
        h = hashlib.sha256(f"{self.session_key}:{base_label}".encode()).hexdigest()
        return f"T_{h[:6]}"

    def encode(self, tokens):
        from core.grammar.http_grammar import HTTPGrammar
        from core.tokenizer.token import Token
        
        encoded_tokens = []
        self.history = [] # Reset for each encode call
        
        for i, t in enumerate(tokens):
            base_type = None
            for bt in ['METHOD', 'PATH', 'VERSION', 'HEADER_NAME', 'HEADER_VALUE']:
                if t.token_type == self._label(bt):
                    base_type = bt
                    break
            
            if not base_type:
                encoded_tokens.append(t)
                continue
                
            hname = None
            if base_type == 'HEADER_VALUE' and len(self.history) > 0:
                # Find the previous HEADER_NAME in history
                for h_type, h_val in reversed(self.history):
                    if h_type == 'HEADER_NAME':
                        hname = h_val
                        break
                
            # Hybrid Logic: Use SST to influence the decoy vocabulary
            # Predict what "looks natural" for the NEXT token
            # Note: For now we just track history; SST integration is structural
            suggested_type = self.sst.predict_next_category(self.history)
            
            vocab = HTTPGrammar.get_vocabulary(base_type, hname)
            encoded_value = self.generator.map_value(base_type, t.value, vocab)
            
            # Record original for context-aware prediction of the next token
            self.history.append((base_type, t.value))
            
            encoded_tokens.append(Token(t.token_type, encoded_value, t.position))
            
        return encoded_tokens
