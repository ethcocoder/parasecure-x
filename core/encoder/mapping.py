import random
import hashlib

class MappingGenerator:
    """
    Generates deterministic, reversible mappings for token values.
    Uses session key and timestamp to ensure uniqueness and security.
    """
    
    def __init__(self, session_key, timestamp_window):
        self.session_key = session_key
        self.timestamp_window = timestamp_window
        self.seed = self._generate_seed()
        
    def _generate_seed(self):
        """Creates a stable seed from session key and time window."""
        hash_input = f"{self.session_key}:{self.timestamp_window}".encode()
        hash_val = hashlib.sha256(hash_input).digest()
        return int.from_bytes(hash_val[:8], 'big')

    def _reversible_cipher(self, value):

        """Simple XOR-based cipher for values outside the vocabulary."""
        key = hashlib.sha256(self.session_key.encode()).digest()
        result = []
        for i, char in enumerate(value):
            # Using i + seed to ensure different values map differently
            k_byte = key[(i + self.seed) % len(key)]
            result.append(chr(ord(char) ^ k_byte))
        return "".join(result)

    def generate_mapping(self, token_type, vocabulary):
        """
        Creates a bijective (one-to-one) mapping for a stable vocabulary.
        """
        if not vocabulary:
            return {}
            
        rng = random.Random(self.seed + hash(token_type))
        sorted_vocab = sorted(list(set(vocabulary)))
        shuffled_vocab = sorted_vocab.copy()
        rng.shuffle(shuffled_vocab)
        return dict(zip(sorted_vocab, shuffled_vocab))

    def map_value(self, token_type, value, vocabulary):
        mapping = self.generate_mapping(token_type, vocabulary)
        if value in mapping:
            return mapping[value]
        # Fallback to printable hex cipher
        return self._reversible_cipher(value)

    def unmap_value(self, token_type, value, vocabulary):
        mapping = self.generate_mapping(token_type, vocabulary)
        inverse_map = {v: k for k, v in mapping.items()}
        if value in inverse_map:
            return inverse_map[value]
        # Decrypt hex cipher
        return self._reversible_cipher(value, decrypt=True)


    @staticmethod
    def get_time_window(timestamp, window_minutes=5):

        """Aligns timestamp to a window to handle small desyncs."""
        return int(timestamp // (window_minutes * 60))
