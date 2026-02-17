class HTTPGrammar:
    """
    Formal grammar specification for HTTP/1.1 protocols.
    Used for structural validation and informed tokenization.
    """
    
    METHODS = [
        'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 
        'HEAD', 'OPTIONS', 'CONNECT', 'TRACE'
    ]
    
    VERSIONS = ['HTTP/1.0', 'HTTP/1.1', 'HTTP/2']
    
    # Common headers and their expected value types (simplified for prototype)
    HEADERS = {
        'Host': str,
        'User-Agent': str,
        'Accept': str,
        'Accept-Language': str,
        'Accept-Encoding': str,
        'Connection': str,
        'Upgrade-Insecure-Requests': str,
        'If-Modified-Since': str,
        'If-None-Match': str,
        'Cache-Control': str,
        'Content-Type': str,
        'Content-Length': int,
        'Authorization': str,
        'Referer': str,
        'Origin': str,
        'Cookie': str,
    }

    DECOY_PATHS = [
        '/', '/index.html', '/style.css', '/script.js', 
        '/images/logo.png', '/favicon.ico', '/api/v1/status',
        '/login', '/dashboard', '/settings', '/search',
        '/about', '/contact', '/blog', '/assets/main.css'
    ]

    DECOY_HEADER_VALUES = {
        'User-Agent': [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            'ParaSecure/1.0 (Mobile; Sovereign)'
        ],
        'Accept': [
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'application/json, text/plain, */*',
            '*/*'
        ],
        'Connection': ['keep-alive', 'close']
    }

    @classmethod
    def get_vocabulary(cls, token_type, header_name=None):
        """Returns a list of valid values for a given token type."""
        if token_type == 'METHOD':
            return cls.METHODS
        if token_type == 'VERSION':
            return cls.VERSIONS
        if token_type == 'PATH':
            return cls.DECOY_PATHS
        if token_type == 'HEADER_NAME':
            return list(cls.HEADERS.keys())
        if token_type == 'HEADER_VALUE' and header_name:
            # Case-insensitive header check
            for h, vals in cls.DECOY_HEADER_VALUES.items():
                if h.lower() == header_name.lower():
                    return vals
        return []

    @classmethod
    def is_valid_method(cls, method):

        return method.upper() in cls.METHODS

    @classmethod
    def is_valid_version(cls, version):
        return version.upper() in cls.VERSIONS

    @classmethod
    def get_header_type(cls, header_name):
        # Case-insensitive header lookup
        for h, t in cls.HEADERS.items():
            if h.lower() == header_name.lower():
                return t
        return str  # Default to string for unknown headers
