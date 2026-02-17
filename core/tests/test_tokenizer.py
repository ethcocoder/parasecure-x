import pytest
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from core.tokenizer.http_tokenizer import HTTPTokenizer

from core.tokenizer.token import Token

def test_basic_tokenization_no_session():
    tokenizer = HTTPTokenizer()
    raw = "GET /index.html HTTP/1.1\r\nHost: example.com\r\n\r\n"
    tokens = tokenizer.tokenize(raw)
    
    # Without session key, it should behave traditionally (one token per unit)
    assert any(t.token_type == 'METHOD' and t.value == 'GET' for t in tokens)
    assert any(t.token_type == 'HEADER_NAME' and t.value == 'Host' for t in tokens)

def test_unique_tokenization_with_session():
    # Two different sessions should produce different token counts/boundaries
    tok1 = HTTPTokenizer(session_key="session_A")
    tok2 = HTTPTokenizer(session_key="session_B")
    
    raw = "GET /very/long/path/to/resource HTTP/1.1\r\nHost: example.com\r\n\r\n"
    
    tokens1 = tok1.tokenize(raw)
    tokens2 = tok2.tokenize(raw)
    
    # They should both reconstruct to the same thing
    assert tok1.reconstruct(tokens1).strip() == raw.strip()
    assert tok2.reconstruct(tokens2).strip() == raw.strip()
    
    # BUT their token sequences should be different in length or values
    # because of dynamic partitioning
    assert [t.value for t in tokens1] != [t.value for t in tokens2]

def test_perfect_reconstruction_complex():
    tokenizer = HTTPTokenizer(session_key="unique_seed_123")
    raw = "POST /api/v1/data HTTP/1.1\r\nHost: server.local\r\nUser-Agent: Mozilla/5.0\r\nContent-Type: application/json\r\n\r\n"
    
    tokens = tokenizer.tokenize(raw)
    reconstructed = tokenizer.reconstruct(tokens)
    
    assert reconstructed.strip() == raw.strip()

def test_reconstruction_order():
    tokenizer = HTTPTokenizer(session_key="random")
    raw = "GET / HTTP/1.1\r\nHeader1: Val1\r\nHeader2: Val2\r\n\r\n"
    tokens = tokenizer.tokenize(raw)
    reconstructed = tokenizer.reconstruct(tokens)
    
    # Headers must maintain order
    assert "Header1: Val1" in reconstructed
    assert "Header2: Val2" in reconstructed
    assert reconstructed.find("Header1") < reconstructed.find("Header2")

