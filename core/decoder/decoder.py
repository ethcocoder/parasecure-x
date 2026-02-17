from core.encoder.mapping import MappingGenerator

class ReversibleDecoder:
    """
    Restores encoded token streams to their original state.
    Uses the inverse session mapping to achieve 100% accuracy.
    """
    
    def __init__(self, session_key, timestamp):
        self.session_key = session_key
        window = MappingGenerator.get_time_window(timestamp)

        self.generator = MappingGenerator(session_key, window)
        self.inverse_mappings = {}

    def _label(self, base_label):
        import hashlib
        h = hashlib.sha256(f"{self.session_key}:{base_label}".encode()).hexdigest()
        return f"T_{h[:6]}"

    def decode(self, encoded_tokens):
        from core.grammar.http_grammar import HTTPGrammar
        from core.tokenizer.token import Token
        
        decoded_tokens = []
        
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
            if base_type == 'HEADER_VALUE' and i > 0:
                # The name is still encoded, need to decode it first to get vocab context!
                name_mapping = self.generator.generate_mapping('HEADER_NAME', HTTPGrammar.get_vocabulary('HEADER_NAME'))
                inv_name_map = {v: k for k, v in name_mapping.items()}
                enc_name = encoded_tokens[i-1].value
                hname = inv_name_map.get(enc_name, self.generator._reversible_cipher(enc_name, decrypt=True))

                
            vocab = HTTPGrammar.get_vocabulary(base_type, hname)
            original_value = self.generator.unmap_value(base_type, t.value, vocab)
            
            decoded_tokens.append(Token(t.token_type, original_value, t.position))
            
        return decoded_tokens


