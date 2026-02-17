from core.encoder.mapping import MappingGenerator
from ml.wrapper import SSTWrapper

class ReversibleDecoder:
    """
    Restores encoded token streams to their original state.
    Uses a hybrid neural-procedural approach to mirror the Encoder.
    """
    
    def __init__(self, session_key, timestamp):
        self.session_key = session_key
        window = MappingGenerator.get_time_window(timestamp)

        self.generator = MappingGenerator(session_key, window)
        self.sst = SSTWrapper()
        self.history = [] # Tracks (base_type, decoded_value) for neural context

    def _label(self, base_label):
        import hashlib
        h = hashlib.sha256(f"{self.session_key}:{base_label}".encode()).hexdigest()
        return f"T_{h[:6]}"

    def decode(self, encoded_tokens):
        from core.grammar.http_grammar import HTTPGrammar
        from core.tokenizer.token import Token
        
        decoded_tokens = []
        self.history = [] # Reset for each decode call
        
        for i, t in enumerate(encoded_tokens):
            base_type = None
            for bt in ['METHOD', 'PATH', 'VERSION', 'HEADER_NAME', 'HEADER_VALUE']:
                if t.token_type == self._label(bt):
                    base_type = bt
                    break
            
            if not base_type:
                decoded_tokens.append(t)
                continue
                
            hname = None
            if base_type == 'HEADER_VALUE' and len(self.history) > 0:
                # Use the decoded history to find the header name
                for h_type, h_val in reversed(self.history):
                    if h_type == 'HEADER_NAME':
                        hname = h_val
                        break
            
            # Mirror the Encoder's structural prediction
            suggested_type = self.sst.predict_next_category(self.history)
            
            vocab = HTTPGrammar.get_vocabulary(base_type, hname)
            original_value = self.generator.unmap_value(base_type, t.value, vocab)
            
            # Record decoded result for context-aware prediction of the next token
            self.history.append((base_type, original_value))
            
            decoded_tokens.append(Token(t.token_type, original_value, t.position))
            
        return decoded_tokens
