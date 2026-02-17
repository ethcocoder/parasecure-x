from .http_grammar import HTTPGrammar

class ProtocolValidator:
    """
    Validates if a packet structure conforms to the defined protocol grammar.
    """
    
    def __init__(self, protocol='HTTP'):
        if protocol != 'HTTP':
            raise ValueError(f"Protocol {protocol} not supported yet.")
        self.grammar = HTTPGrammar
        
    def validate_request_line(self, method, path, version):
        if not self.grammar.is_valid_method(method):
            return False, f"Invalid HTTP method: {method}"
        
        if not path.startswith('/'):
            return False, f"Invalid path (must start with /): {path}"
            
        if not self.grammar.is_valid_version(version):
            return False, f"Invalid HTTP version: {version}"
            
        return True, "Valid"

    def validate_header(self, name, value):
        # Basic validation: headers shouldn't have whitespace in names
        if ' ' in name:
            return False, f"Invalid header name: {name}"
            
        # Check if length matches for Content-Length
        if name.lower() == 'content-length':
            try:
                int(value)
            except ValueError:
                return False, "Content-Length must be an integer"
                
        return True, "Valid"
