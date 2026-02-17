import time
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.tokenizer.http_tokenizer import HTTPTokenizer
from core.encoder.encoder import ReversibleEncoder
from core.decoder.decoder import ReversibleDecoder

def print_box(title, content, color="\033[94m"):
    reset = "\033[0m"
    print(f"\n{color}{'='*60}")
    print(f" {title.upper()} ")
    print(f"{'='*60}{reset}")
    print(content)
    print(f"{color}{'='*60}{reset}")

def run_demo():
    session_key = "sovereign_demo_2026"
    ts = int(time.time())
    
    # 1. Input
    raw_request = (
        "GET /api/v1/user/profile HTTP/1.1\r\n"
        "Host: secure.internal.bank.com\r\n"
        "Authorization: Bearer top-secret-token\r\n"
        "User-Agent: SecureClient/1.0\r\n"
        "Accept: application/json\r\n"
    )
    
    print_box("1. Original HTTP Request", raw_request, "\033[97m")
    
    # 2. Tokenize
    print("\n[*] Tokenizing with Dynamic Labeling...")
    tokenizer = HTTPTokenizer(session_key=session_key)
    tokens = tokenizer.tokenize(raw_request)
    
    token_display = ""
    for t in tokens:
        token_display += f"[{t.token_type}: {t.value}] "
    print(f"Tokens Generated: {len(tokens)}")
    print(f"Sample: {tokens[0].token_type} -> {tokens[0].value}")
    
    # 3. Encode
    print("\n[*] Encoding with PAREE (Vocabulary + Fallback Cipher)...")
    encoder = ReversibleEncoder(session_key, ts)
    encoded_tokens = encoder.encode(tokens)
    raw_encoded = tokenizer.reconstruct(encoded_tokens)
    
    print_box("2. Encoded (Obfuscated) Packet", raw_encoded, "\033[91m")
    
    # 4. Decode
    print("\n[*] Decoding (Applying Reversible Inverse Mapping)...")
    decoder = ReversibleDecoder(session_key, ts)
    decoded_tokens = decoder.decode(encoded_tokens)
    raw_final = tokenizer.reconstruct(decoded_tokens)
    
    print_box("3. Decoded (Restored) Packet", raw_final, "\033[92m")
    
    # 5. Verify
    print("\n" + "="*60)
    if raw_final.strip() == raw_request.strip():
        print("\033[92m[SUCCESS] 100% Data Integrity Verified! ✓\033[0m")
    else:
        print("\033[91m[FAILURE] Data Corruption Detected! ✗\033[0m")
    
    # Show uniqueness
    print("\n[*] Demonstrating Sovereign Uniqueness...")
    tokenizer_other = HTTPTokenizer(session_key="different_user")
    encoder_other = ReversibleEncoder("different_user", ts)
    re_other = tokenizer_other.reconstruct(encoder_other.encode(tokenizer_other.tokenize(raw_request)))
    
    print(f"Session A Length: {len(raw_encoded)}")
    print(f"Session B Length: {len(re_other)}")
    print(f"Session A != Session B: {raw_encoded != re_other}")
    print("="*60)

if __name__ == "__main__":
    run_demo()
