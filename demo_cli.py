import time
import sys
import os

# Add parent directory to path to find core and ml modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from core.tokenizer.http_tokenizer import HTTPTokenizer
from core.encoder.encoder import ReversibleEncoder
from core.decoder.decoder import ReversibleDecoder

def print_box(title, content, color="\033[94m"):
    reset = "\033[0m"
    print(f"\n{color}{'='*70}")
    print(f" {title.upper()} ")
    print(f"{'='*70}{reset}")
    print(content)
    print(f"{color}{'='*70}{reset}")

def step_log(icon, message, details=None):
    blue = "\033[94m"
    gray = "\033[90m"
    reset = "\033[0m"
    print(f"{blue}[{icon}] {message}{reset}")
    if details:
        print(f"    {gray}-> {details}{reset}")
    time.sleep(0.5)

def run_enhanced_demo(raw_request=None, session_key="sovereign_alpha"):
    ts = int(time.time())
    
    if not raw_request:
        raw_request = (
            "GET /api/v1/user/profile HTTP/1.1\r\n"
            "Host: secure.internal.bank.com\r\n"
            "Authorization: Bearer top-secret-token\r\n"
            "User-Agent: SecureClient/1.0\r\n"
            "Accept: application/json\r\n"
        )
    
    print_box("1. Input Packet (Plaintext)", raw_request, "\033[97m")
    
    # --- Tokenization ---
    step_log("*", "Initiating Structural Tokenizer...", f"Session: {session_key}")
    tokenizer = HTTPTokenizer(session_key=session_key)
    tokens = tokenizer.tokenize(raw_request)
    step_log("DONE", f"Generated {len(tokens)} protocol tokens using Dynamic Labeling.")
    
    # --- Encoding ---
    step_log("*", "Starting Reversible Encoding Engine (PAREE)...")
    encoder = ReversibleEncoder(session_key, ts)
    step_log("INFO", "SST Model Loaded (Formal Rule Learning Mode)")
    
    print("\n[ ENCODING PROCESS ]")
    encoded_tokens = []
    encoder.history = []
    
    for i, t in enumerate(tokens):
        # Determine base type for visualization
        base_type = "UNKNOWN"
        for bt in ['METHOD', 'PATH', 'VERSION', 'HEADER_NAME', 'HEADER_VALUE']:
            if t.token_type == encoder._label(bt):
                base_type = bt
                break
        
        # Get SST prediction for the next state
        next_pred = encoder.sst.predict_next_category(encoder.history)
        
        # Perform mapping
        encoded = encoder.encode([t])[0]
        encoded_tokens.append(encoded)
        
        # Visual feedback
        color = "\033[93m" if base_type == "METHOD" else "\033[96m"
        print(f"  {color}{base_type:12}\033[0m : {t.value:20} -> {encoded.value:20} | SST Next: {next_pred}")
        time.sleep(0.1)

    raw_encoded = tokenizer.reconstruct(encoded_tokens)
    print_box("2. Encoded Packet (Obfuscated)", raw_encoded, "\033[91m")
    
    # --- Decoding ---
    step_log("*", "Receiver: Starting Reversible Decoder...")
    decoder = ReversibleDecoder(session_key, ts)
    step_log("INFO", "Synchronizing inverse mappings (Deterministic Seed)")
    
    decoded_tokens = decoder.decode(encoded_tokens)
    raw_final = tokenizer.reconstruct(decoded_tokens)
    
    print_box("3. Decoded Packet (Restored)", raw_final, "\033[92m")
    
    # --- Verification ---
    print("\n" + "="*70)
    if raw_final.strip() == raw_request.strip():
        print("\033[92m[SUCCESS] 100% Data Integrity Verified. All rules preserved.\033[0m")
    else:
        print("\033[91m[FAILURE] Data Mismatch Detected!\033[0m")
    print("="*70)

def main():
    import argparse
    parser = argparse.ArgumentParser(description="PAREE Engine Milestone Demo")
    parser.add_argument("--interactive", action="store_true", help="Input custom traffic")
    args = parser.parse_args()
    
    print("\033[1mPAREE HYBRID NEURAL-PROCEDURAL ENGINE\033[0m")
    print("v1.0-alpha | Sovereign Structural Transformer (SST)")
    
    if args.interactive:
        print("\n[?] Enter Session Key: ", end="")
        s_key = sys.stdin.readline().strip() or "sovereign_demo"
        
        print("\n[?] Paste HTTP Request (Double Enter to start):")
        lines = []
        while True:
            line = sys.stdin.readline()
            if not line or line.strip() == "":
                if lines: break
            lines.append(line)
        
        run_enhanced_demo("".join(lines), s_key)
    else:
        run_enhanced_demo()

if __name__ == "__main__":
    main()
