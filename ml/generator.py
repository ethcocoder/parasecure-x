import random
import os
import sys
import hashlib

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.grammar.http_grammar import HTTPGrammar
from core.tokenizer.http_tokenizer import HTTPTokenizer

class ProtocolDataGenerator:
    """
    Generates large datasets of structural tokens for training the SST.
    """
    
    def __init__(self, tokenizer=None):
        self.tokenizer = tokenizer or HTTPTokenizer()
        self.grammar = HTTPGrammar()

    def generate_sample_request(self):
        method = random.choice(HTTPGrammar.METHODS)
        path = random.choice(HTTPGrammar.DECOY_PATHS)
        version = random.choice(HTTPGrammar.VERSIONS)
        
        request = f"{method} {path} {version}\n"
        
        # Add random headers
        num_headers = random.randint(2, 6)
        chosen_headers = random.sample(list(HTTPGrammar.HEADERS.keys()), num_headers)
        
        for header in chosen_headers:
            val_options = HTTPGrammar.DECOY_HEADER_VALUES.get(header, ["generic-value"])
            val = random.choice(val_options)
            request += f"{header}: {val}\n"
            
        return request

    def generate_dataset(self, size=1000):
        """Generates sequences of (TypeID, ValueID) for training."""
        dataset = []
        
        # Build stable maps for categorical training
        type_list = sorted(['METHOD', 'PATH', 'VERSION', 'HEADER_NAME', 'HEADER_VALUE'])
        type_map = {t: i for i, t in enumerate(type_list)}
        
        for _ in range(size):
            raw = self.generate_sample_request()
            tokens = self.tokenizer.tokenize(raw)
            
            sequence = []
            for t in tokens:
                # Find base label by reversing the dynamic label (conceptually)
                # In training we'll use base labels to learn "General Protocol Rules"
                base_type = 'UNKNOWN'
                for bt in type_list:
                    if t.token_type == self.tokenizer._label(bt):
                        base_type = bt
                        break
                
                # Map value to a simple hash for structural modeling
                val_hash = int(hashlib.md5(t.value.encode()).hexdigest(), 16) % 1000
                sequence.append((type_map.get(base_type, 5), val_hash))
            
            dataset.append(sequence)
        return dataset

if __name__ == "__main__":
    gen = ProtocolDataGenerator()
    data = gen.generate_dataset(size=5)
    for i, sample in enumerate(data):
        print(f"Sample {i+1} Tokens: {len(sample)}")
        print(sample[:3], "...")
