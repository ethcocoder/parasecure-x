class Token:
    """
    Represents a semantic unit of a network packet.
    """
    def __init__(self, token_type, value, position):
        self.token_type = token_type  # e.g., 'METHOD', 'PATH', 'HEADER_NAME', 'HEADER_VALUE'
        self.value = value            # e.g., 'GET', '/index.html', 'Host', 'example.com'
        self.position = position      # Order in the packet/sequence
        
    def __repr__(self):
        return f"Token({self.token_type}, '{self.value}', pos={self.position})"

    def __eq__(self, other):
        if not isinstance(other, Token):
            return False
        return (self.token_type == other.token_type and 
                self.value == other.value and 
                self.position == other.position)
