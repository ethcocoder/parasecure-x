import { IGrammar, GrammarRule, Token, ProtocolLayer } from './types';

export class HTTPGrammar implements IGrammar {
    layer: ProtocolLayer = 'HTTP';

    private validMethods = new Set(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE']);
    private validVersions = new Set(['HTTP/1.0', 'HTTP/1.1', 'HTTP/2']);

    // Common headers
    private headers: Record<string, string> = {
        'Host': 'string',
        'User-Agent': 'string',
        'Accept': 'string',
        'Accept-Language': 'string',
        'Accept-Encoding': 'string',
        'Connection': 'string',
        'Upgrade-Insecure-Requests': 'string',
        'If-Modified-Since': 'string',
        'If-None-Match': 'string',
        'Cache-Control': 'string',
        'Content-Type': 'string',
        'Content-Length': 'int',
        'Authorization': 'string',
        'Referer': 'string',
        'Origin': 'string',
        'Cookie': 'string',
    };

    private decoyPaths = [
        '/', '/index.html', '/style.css', '/script.js',
        '/images/logo.png', '/favicon.ico', '/api/v1/status',
        '/login', '/dashboard', '/settings', '/search',
        '/about', '/contact', '/blog', '/assets/main.css'
    ];

    private decoyHeaderValues: Record<string, string[]> = {
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
    };

    getRules(): GrammarRule[] {
        return [
            { field: 'METHOD', type: 'enum', options: Array.from(this.validMethods) },
            { field: 'VERSION', type: 'enum', options: Array.from(this.validVersions) },
            { field: 'PATH', type: 'regex', pattern: '^/.*' },
            { field: 'HEADER_NAME', type: 'structural' }
        ];
    }

    getVocabulary(tokenType: string, headerName?: string): string[] {
        if (tokenType === 'METHOD') return Array.from(this.validMethods);
        if (tokenType === 'VERSION') return Array.from(this.validVersions);
        if (tokenType === 'PATH') return this.decoyPaths;
        if (tokenType === 'HEADER_NAME') return Object.keys(this.headers);

        if (tokenType === 'HEADER_VALUE' && headerName) {
            // Case-insensitive lookup
            const lowerName = headerName.toLowerCase();
            for (const [k, v] of Object.entries(this.decoyHeaderValues)) {
                if (k.toLowerCase() === lowerName) {
                    return v;
                }
            }
        }
        return [];
    }

    validate(tokens: Token[]): boolean {
        if (tokens.length < 3) return false;

        const [method, path, version] = tokens;

        if (method.type !== 'METHOD' || !this.validMethods.has(method.value)) return false;
        if (path.type !== 'PATH' || !path.value.startsWith('/')) return false;
        if (version.type !== 'VERSION' || !this.validVersions.has(version.value)) return false;

        // Simple header validation
        let expectingValue = false;
        for (let i = 3; i < tokens.length; i++) {
            const t = tokens[i];
            if (t.type === 'HEADER_NAME') {
                if (expectingValue) return false;
                expectingValue = true;
            } else if (t.type === 'HEADER_VALUE') {
                if (!expectingValue) return false;
                expectingValue = false;
            }
        }
        return !expectingValue;
    }
}
