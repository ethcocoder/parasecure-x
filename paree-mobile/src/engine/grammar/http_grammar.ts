import { IGrammar, GrammarRule, Token, ProtocolLayer } from './types';

export class HTTPGrammar implements IGrammar {
    layer: ProtocolLayer = 'HTTP';

    private validMethods = new Set(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE']);
    private validVersions = new Set(['HTTP/1.0', 'HTTP/1.1', 'HTTP/2']);

    // Exhaustive real-world header name list
    private headerNames: string[] = [
        'Host', 'User-Agent', 'Accept', 'Accept-Language', 'Accept-Encoding',
        'Accept-Charset', 'Accept-Ranges', 'Authorization', 'Cache-Control',
        'Connection', 'Content-Disposition', 'Content-Encoding', 'Content-Language',
        'Content-Length', 'Content-Location', 'Content-MD5', 'Content-Range',
        'Content-Security-Policy', 'Content-Type', 'Cookie', 'Date', 'ETag',
        'Expect', 'Expires', 'Forwarded', 'From', 'If-Match', 'If-Modified-Since',
        'If-None-Match', 'If-Range', 'If-Unmodified-Since', 'Keep-Alive', 'Last-Modified',
        'Link', 'Location', 'Max-Forwards', 'Origin', 'Pragma', 'Proxy-Authorization',
        'Proxy-Connection', 'Range', 'Referer', 'Retry-After', 'Server', 'Set-Cookie',
        'Strict-Transport-Security', 'TE', 'Trailer', 'Transfer-Encoding', 'Upgrade',
        'Upgrade-Insecure-Requests', 'Vary', 'Via', 'Warning', 'WWW-Authenticate',
        'X-Content-Type-Options', 'X-DNS-Prefetch-Control', 'X-Forwarded-For',
        'X-Forwarded-Host', 'X-Forwarded-Proto', 'X-Frame-Options', 'X-Powered-By',
        'X-Request-ID', 'X-Requested-With', 'X-XSS-Protection', 'Access-Control-Allow-Credentials',
        'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Origin',
        'Access-Control-Expose-Headers', 'Access-Control-Max-Age', 'Access-Control-Request-Headers',
        'Access-Control-Request-Method', 'Alt-Svc', 'Clear-Site-Data', 'Cross-Origin-Embedder-Policy',
        'Cross-Origin-Opener-Policy', 'Cross-Origin-Resource-Policy', 'Device-Memory',
        'Downlink', 'DPR', 'Early-Data', 'ECT', 'Feature-Policy', 'NEL', 'Permissions-Policy',
        'Priority', 'Report-To', 'RTT', 'Save-Data', 'Sec-CH-UA', 'Sec-CH-UA-Arch',
        'Sec-CH-UA-Bitness', 'Sec-CH-UA-Full-Version', 'Sec-CH-UA-Full-Version-List',
        'Sec-CH-UA-Mobile', 'Sec-CH-UA-Model', 'Sec-CH-UA-Platform', 'Sec-CH-UA-Platform-Version',
        'Sec-Fetch-Dest', 'Sec-Fetch-Mode', 'Sec-Fetch-Site', 'Sec-Fetch-User',
        'Sec-GPC', 'Sec-WebSocket-Accept', 'Sec-WebSocket-Extensions', 'Sec-WebSocket-Key',
        'Sec-WebSocket-Protocol', 'Sec-WebSocket-Version', 'Service-Worker-Navigation-Preload',
        'Timing-Allow-Origin', 'Viewport-Width', 'Width', 'X-Correlation-ID',
    ];

    // Massive real-world path decoys
    private decoyPaths: string[] = [
        '/', '/index.html', '/index.php', '/home', '/about', '/contact', '/login',
        '/logout', '/register', '/signup', '/dashboard', '/profile', '/settings',
        '/search', '/blog', '/news', '/faq', '/help', '/support', '/terms', '/privacy',
        '/api/v1/status', '/api/v1/health', '/api/v1/users', '/api/v1/auth/token',
        '/api/v2/users', '/api/v2/products', '/api/v2/orders', '/api/v2/payments',
        '/static/js/main.js', '/static/css/style.css', '/static/img/logo.png',
        '/assets/bundle.js', '/assets/vendor.js', '/assets/app.css',
        '/favicon.ico', '/robots.txt', '/sitemap.xml', '/manifest.json',
        '/wp-admin/', '/wp-login.php', '/wp-content/uploads/2024/01/image.jpg',
        '/cdn-cgi/trace', '/cdn-cgi/challenge-platform/h/b/flow',
        '/images/hero.webp', '/images/banner.jpg', '/images/product-1.png',
        '/fonts/inter.woff2', '/fonts/roboto.ttf',
        '/v1/graphql', '/graphql', '/api/graphql',
        '/health', '/ping', '/metrics', '/status',
        '/oauth/authorize', '/oauth/token', '/oauth/callback',
        '/.well-known/openid-configuration', '/.well-known/jwks.json',
        '/api/users/me', '/api/users/profile', '/api/users/avatar',
        '/api/products/list', '/api/products/search', '/api/products/featured',
        '/api/cart', '/api/cart/items', '/api/checkout', '/api/orders/history',
        '/api/notifications', '/api/messages', '/api/feed', '/api/timeline',
        '/socket.io/', '/ws', '/websocket',
        '/cdn/assets/v3/main.min.js', '/cdn/assets/v3/vendor.min.js',
        '/static/chunks/pages/_app.js', '/static/chunks/pages/index.js',
        '/next/static/chunks/main.js', '/_next/static/css/app.css',
    ];

    // Exhaustive real-world header value decoys
    private decoyHeaderValues: Record<string, string[]> = {
        'User-Agent': [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.101 Mobile Safari/537.36',
            'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.101 Mobile Safari/537.36',
            'Dalvik/2.1.0 (Linux; U; Android 14; Pixel 8 Build/AD1A.240905.004)',
            'okhttp/4.12.0',
            'axios/1.6.7',
            'python-requests/2.31.0',
            'curl/8.4.0',
            'Go-http-client/2.0',
        ],
        'Accept': [
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'application/json, text/plain, */*',
            'application/json',
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            '*/*',
            'text/css,*/*;q=0.1',
            'application/javascript, */*;q=0.8',
            'text/plain, */*; q=0.01',
        ],
        'Accept-Language': [
            'en-US,en;q=0.9',
            'en-GB,en;q=0.9',
            'en-US,en;q=0.9,fr;q=0.8,de;q=0.7',
            'zh-CN,zh;q=0.9,en;q=0.8',
            'ar,en-US;q=0.9,en;q=0.8',
            'es-ES,es;q=0.9,en;q=0.8',
            'fr-FR,fr;q=0.9,en;q=0.8',
            'de-DE,de;q=0.9,en;q=0.8',
            'ja-JP,ja;q=0.9,en;q=0.8',
            'pt-BR,pt;q=0.9,en;q=0.8',
            'ru-RU,ru;q=0.9,en;q=0.8',
        ],
        'Accept-Encoding': [
            'gzip, deflate, br',
            'gzip, deflate, br, zstd',
            'gzip, deflate',
            'br, gzip, deflate',
            'identity',
        ],
        'Connection': ['keep-alive', 'close', 'upgrade'],
        'Cache-Control': [
            'no-cache',
            'max-age=0',
            'no-store',
            'max-age=3600',
            'public, max-age=86400',
            'private, no-cache',
            'no-cache, no-store, must-revalidate',
        ],
        'Content-Type': [
            'application/json',
            'application/json; charset=utf-8',
            'application/x-www-form-urlencoded',
            'multipart/form-data',
            'text/plain; charset=utf-8',
            'text/html; charset=utf-8',
            'application/octet-stream',
            'application/xml',
        ],
        'Sec-Fetch-Mode': ['navigate', 'cors', 'no-cors', 'same-origin', 'websocket'],
        'Sec-Fetch-Site': ['same-origin', 'same-site', 'cross-site', 'none'],
        'Sec-Fetch-Dest': ['document', 'empty', 'image', 'script', 'style', 'font', 'fetch', 'worker'],
        'Sec-CH-UA': [
            '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
            '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            '"Microsoft Edge";v="120", "Chromium";v="120", "Not/A)Brand";v="99"',
        ],
        'Sec-CH-UA-Mobile': ['?0', '?1'],
        'Sec-CH-UA-Platform': ['"Windows"', '"macOS"', '"Linux"', '"Android"', '"iOS"'],
        'Upgrade-Insecure-Requests': ['1'],
        'Pragma': ['no-cache'],
        'Origin': [
            'https://www.google.com', 'https://github.com', 'https://stackoverflow.com',
            'https://api.example.com', 'https://app.example.com', 'null',
        ],
        'Referer': [
            'https://www.google.com/search?q=api+documentation',
            'https://github.com/user/repo',
            'https://stackoverflow.com/questions/',
            'https://developer.mozilla.org/',
            'https://www.example.com/dashboard',
        ],
        'Authorization': [
            'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIn0.sig',
            'Basic dXNlcjpwYXNzd29yZA==',
            'Bearer token_placeholder_for_camouflage',
            'ApiKey sk-prod-xxxxxxxxxxxxxxxxxxxx',
        ],
        'X-Requested-With': ['XMLHttpRequest', 'fetch'],
        'X-Forwarded-For': ['203.0.113.1', '198.51.100.42', '192.0.2.100'],
        'X-Request-ID': [
            'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            'req_8f7d6e5c4b3a2190',
            'trace-0011223344556677',
        ],
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
        if (tokenType === 'HEADER_NAME') return this.headerNames;

        if (tokenType === 'HEADER_VALUE' && headerName) {
            const lowerName = headerName.toLowerCase();
            for (const [k, v] of Object.entries(this.decoyHeaderValues)) {
                if (k.toLowerCase() === lowerName) return v;
            }
            // Generic fallback values for any unknown header
            return [
                'application/json', 'text/html', 'keep-alive', 'no-cache',
                'max-age=0', 'gzip, deflate, br', 'en-US,en;q=0.9', '1',
                'same-origin', 'cors', 'document', 'true', 'false',
            ];
        }
        return [];
    }

    validate(tokens: Token[]): boolean {
        if (tokens.length < 3) return false;
        const [method, path, version] = tokens;
        if (method.type !== 'METHOD' || !this.validMethods.has(method.value)) return false;
        if (path.type !== 'PATH' || !path.value.startsWith('/')) return false;
        if (version.type !== 'VERSION' || !this.validVersions.has(version.value)) return false;
        return true;
    }
}
