import pytest
import time
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from core.encoder.encoder import ReversibleEncoder
from core.tokenizer.token import Token

def test_deterministic_encoding():
    session_key = "test_key"
    ts = 1700000000 # Fixed timestamp
    
    encoder1 = ReversibleEncoder(session_key, ts)
    encoder2 = ReversibleEncoder(session_key, ts)
    
    tokens = [
        Token('METHOD', 'GET', 0),
        Token('PATH', '/api', 1)
    ]
    
    encoded1 = encoder1.encode(tokens)
    encoded2 = encoder2.encode(tokens)
    
    # Same key/time should produce same result
    assert [t.value for t in encoded1] == [t.value for t in encoded2]

def test_unique_encoding_across_sessions():
    ts = 1700000000
    enc_a = ReversibleEncoder("session_A", ts)
    enc_b = ReversibleEncoder("session_B", ts)
    
    tokens = [Token('PATH', '/private/data', 0)]
    
    val_a = enc_a.encode(tokens)[0].value
    val_b = enc_b.encode(tokens)[0].value
    
    # Different session keys should produce different values
    assert val_a != val_b

def test_mapping_is_stable_window():
    session_key = "test"
    ts_start = 1700000000
    ts_near = ts_start + 60 # 1 minute later (same 5-min window)
    
    enc1 = ReversibleEncoder(session_key, ts_start)
    enc2 = ReversibleEncoder(session_key, ts_near)
    
    tokens = [Token('METHOD', 'GET', 0)]
    assert enc1.encode(tokens)[0].value == enc2.encode(tokens)[0].value
