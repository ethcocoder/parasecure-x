import pytest
import time
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from core.tokenizer.http_tokenizer import HTTPTokenizer
from core.encoder.encoder import ReversibleEncoder
from core.decoder.decoder import ReversibleDecoder

def test_full_cycle_integrity():
    session_key = "sovereign_security_alpha"
    ts = int(time.time())
    
    # 1. Original Packet
    raw_original = "GET /api/v1/private/data HTTP/1.1\r\nHost: internal.bank.com\r\nUser-Agent: SpecialAgent/1.0\r\n\r\n"
    
    # 2. Tokenize (with unique partitioning)
    tokenizer = HTTPTokenizer(session_key=session_key)
    tokens = tokenizer.tokenize(raw_original)
    
    # 3. Encode
    encoder = ReversibleEncoder(session_key, ts)
    encoded_tokens = encoder.encode(tokens)
    raw_encoded = tokenizer.reconstruct(encoded_tokens)
    
    # Verify it's actually obfuscated
    assert "/api/v1/private/data" not in raw_encoded
    assert "internal.bank.com" not in raw_encoded
    
    # 4. Decode (on the other side)
    decoder = ReversibleDecoder(session_key, ts)
    decoded_tokens = decoder.decode(encoded_tokens)
    raw_final = tokenizer.reconstruct(decoded_tokens)
    
    # 5. Verify Integrity
    assert raw_final.strip() == raw_original.strip()

def test_unique_encodings_cycle():
    # Verify that different sessions have different "look" but both work
    raw = "GET /secret HTTP/1.1\r\nHost: x.com\r\n\r\n"
    ts = 1700000000
    
    sessions = ["A", "B", "C"]
    results = []
    
    for s in sessions:
        tok = HTTPTokenizer(session_key=s)
        enc = ReversibleEncoder(s, ts)
        dec = ReversibleDecoder(s, ts)
        
        et = enc.encode(tok.tokenize(raw))
        re = tok.reconstruct(et)
        results.append(re)
        
        dt = dec.decode(et)
        assert tok.reconstruct(dt).strip() == raw.strip()
        
    # All encoded versions should be unique
    assert len(set(results)) == len(sessions)
