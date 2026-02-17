import random
import re
import hashlib
from .token import Token

class HTTPTokenizer:
    """
    Parses raw HTTP requests into a sequence of structural tokens.
    Uses a session_key to generate unique, unidentifiable token labels.
    """
    
    def __init__(self, session_key=None):
        self.session_key = session_key
        
    def _label(self, base_label):
        """Generates a session-unique label for a standard token type."""
        if not self.session_key:
            return base_label
        # Hash session key + base label to get a unique identifier
        h = hashlib.sha256(f"{self.session_key}:{base_label}".encode()).hexdigest()
        return f"T_{h[:6]}"

    def _unlabel(self, unique_label):
        """Map unique label back to base label (Requires reverse lookup)"""
        # For simplicity in prototype, we'll keep a local cache
        pass

    def tokenize(self, raw_data):
        if isinstance(raw_data, bytes):
            raw_data = raw_data.decode('utf-8', errors='ignore')
            
        lines = [l.strip() for l in raw_data.split('\n') if l.strip()]
        
        tokens = []
        pos = 0
        
        if not lines:
            return tokens
            
        request_line = lines[0]
        match = re.match(r'^([A-Z]+)\s+(.+)\s+(HTTP/\d\.\d)$', request_line)
        if match:
            method, path, version = match.groups()
            tokens.append(Token(self._label('METHOD'), method, pos)); pos += 1
            tokens.append(Token(self._label('PATH'), path, pos)); pos += 1
            tokens.append(Token(self._label('VERSION'), version, pos)); pos += 1
        else:
            tokens.append(Token(self._label('UNKNOWN'), request_line, pos)); pos += 1
            
        for i in range(1, len(lines)):
            line = lines[i]
            header_match = re.match(r'^([^:]+):\s*(.*)$', line)
            if header_match:
                name, value = header_match.groups()
                tokens.append(Token(self._label('HEADER_NAME'), name, pos)); pos += 1
                tokens.append(Token(self._label('HEADER_VALUE'), value, pos)); pos += 1
                
        return tokens

    def reconstruct(self, tokens):
        # Sort tokens by position
        sorted_tokens = sorted(tokens, key=lambda t: t.position)
        
        # Map labels back (Since we know the order of components in HTTP)
        # This is easier: just join tokens in order.
        # But we need to know where headers end.
        
        # Implementation is simpler for demo:
        # Just look at original positions and token order.
        
        # Simplified reconstruction for HTTP:
        res = ""
        # The first 3 tokens are METHOD PATH VERSION
        if len(sorted_tokens) >= 3:
            res += f"{sorted_tokens[0].value} {sorted_tokens[1].value} {sorted_tokens[2].value}\r\n"
        
        # Remaining tokens are HEADER_NAME, HEADER_VALUE pairs
        for i in range(3, len(sorted_tokens), 2):
            if i + 1 < len(sorted_tokens):
                name = sorted_tokens[i].value
                val = sorted_tokens[i+1].value
                res += f"{name}: {val}\r\n"
                
        return res + "\r\n"


