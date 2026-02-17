import pytest
import sys
import os

# Add the parent directory to sys.path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from core.grammar.http_grammar import HTTPGrammar
from core.grammar.validator import ProtocolValidator

def test_grammar_methods():
    assert HTTPGrammar.is_valid_method('GET')
    assert HTTPGrammar.is_valid_method('POST')
    assert not HTTPGrammar.is_valid_method('INVALID')

def test_grammar_versions():
    assert HTTPGrammar.is_valid_version('HTTP/1.1')
    assert HTTPGrammar.is_valid_version('HTTP/2')
    assert not HTTPGrammar.is_valid_version('HTTP/3.0')

def test_validator_request_line():
    validator = ProtocolValidator()
    
    # Valid
    is_valid, msg = validator.validate_request_line('GET', '/index.html', 'HTTP/1.1')
    assert is_valid
    
    # Invalid method
    is_valid, msg = validator.validate_request_line('FETCH', '/', 'HTTP/1.1')
    assert not is_valid
    assert "method" in msg
    
    # Invalid path
    is_valid, msg = validator.validate_request_line('GET', 'index.html', 'HTTP/1.1')
    assert not is_valid
    assert "path" in msg

def test_validator_headers():
    validator = ProtocolValidator()
    
    # Valid
    assert validator.validate_header('Host', 'example.com')[0]
    
    # Invalid name (contains space)
    assert not validator.validate_header('Invalid Name', 'value')[0]
    
    # Invalid Content-Length
    assert not validator.validate_header('Content-Length', 'abc')[0]
